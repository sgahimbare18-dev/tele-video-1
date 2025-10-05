import React, { createContext, useState, useEffect, useContext } from 'react';
import Peer from 'simple-peer';
import { io, Socket } from 'socket.io-client';
import VirtualBackgroundProcessor from '../components/VirtualBackgroundProcessor';

// Type declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
  type: 'public' | 'private';
  recipient?: string;
}

type UserRole = 'admin' | 'moderator' | 'participant';

interface Participant {
  id: string;
  name: string;
  role: UserRole;
  interests?: string[];
  currentBreakoutRoom?: string | null;
  muted?: boolean;
  banned?: boolean;
}

interface SentimentData {
  timestamp: Date;
  score: number; // -1 to 1 (negative to positive)
  confidence: number; // 0 to 1
  source: 'speech' | 'message';
  text?: string;
}

interface ParticipationMetrics {
  userId: string;
  userName: string;
  talkTime: number; // in seconds
  messageCount: number;
  engagementScore: number; // 0 to 100
  lastActivity: Date;
  sentimentAverage: number;
}

interface MeetingAnalytics {
  meetingStartTime: Date | null;
  totalDuration: number; // in seconds
  sentimentHistory: SentimentData[];
  participationMetrics: Map<string, ParticipationMetrics>;
  overallSentiment: number;
  engagementLevel: 'low' | 'medium' | 'high';
  keyTopics: string[];
  summary: string;
}

interface BreakoutRoom {
  id: string;
  name: string;
  interests: string[];
  participants: Map<string, Participant>;
}



interface VideoContextProps {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  participants: Map<string, Participant>;
  messages: Message[];
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenShareEnabled: boolean;
  isConnecting: boolean;
  error: string | null;
  currentUserRole: UserRole;
  roomLocked: boolean;
  joinRequests: Participant[];
  recordingEnabled: Map<string, boolean>;
  isRecording: boolean;
  interpreterEnabled: boolean;
  transcribedText: string;
  virtualBackgroundEnabled: boolean;
  socket: Socket | null;
  // Analytics properties
  analyticsEnabled: boolean;
  meetingAnalytics: MeetingAnalytics;
  // Breakout room properties
  breakoutRooms: BreakoutRoom[];
  currentBreakoutRoom: string | null;
  joinRoom: (roomId: string, userName: string, isHost?: boolean, interests?: string[]) => void;
  leaveRoom: () => void;
  sendMessage: (text: string, type?: 'public' | 'private', recipient?: string) => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => void;
  kickUser: (userId: string) => void;
  banUser: (userId: string) => void;
  muteUser: (userId: string) => void;
  lockRoom: (locked: boolean) => void;
  approveJoin: (userId: string, approved: boolean) => void;
  lockAllParticipants: () => void;
  unlockAllParticipants: () => void;
  grantRecordingPermission: (userId: string) => void;
  revokeRecordingPermission: (userId: string) => void;
  startRecording: () => void;
  stopRecording: () => void;
  inviteUser: (userId: string) => void;
  toggleInterpreter: () => void;
  toggleVirtualBackground: () => void;
  // Analytics functions
  toggleAnalytics: () => void;
  analyzeSentiment: (text: string) => SentimentData;
  updateParticipationMetrics: (userId: string, userName: string, activityType: 'message' | 'speech') => void;
  generateMeetingSummary: () => void;
  // Breakout room functions
  createBreakoutRooms: () => void;
  joinBreakoutRoom: (breakoutRoomId: string) => void;
  leaveBreakoutRoom: () => void;
  deleteBreakoutRoom: (breakoutRoomId: string) => void;
}

const VideoContext = createContext<VideoContextProps | null>(null);

// For development, we'll use a mock server URL
// In production, this would be your actual signaling server
const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_SERVER_URL || 'http://localhost:5000';

export const VideoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [participants, setParticipants] = useState<Map<string, Participant>>(new Map());
  const [peers, setPeers] = useState<Map<string, Peer.Instance>>(new Map());
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [videoEnabled, setVideoEnabled] = useState<boolean>(true);
  const [screenShareEnabled, setScreenShareEnabled] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserName, setCurrentUserName] = useState<string>('');
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('participant');
  const [roomLocked, setRoomLocked] = useState<boolean>(false);
  const [joinRequests, setJoinRequests] = useState<Participant[]>([]);
  const [recordingEnabled, setRecordingEnabled] = useState<Map<string, boolean>>(new Map());
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [interpreterEnabled, setInterpreterEnabled] = useState<boolean>(false);
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [virtualBackgroundEnabled, setVirtualBackgroundEnabled] = useState<boolean>(false);
  const [processedStream, setProcessedStream] = useState<MediaStream | null>(null);

  // Analytics state
  const [analyticsEnabled, setAnalyticsEnabled] = useState<boolean>(false);
  const [meetingAnalytics, setMeetingAnalytics] = useState<MeetingAnalytics>({
    meetingStartTime: null,
    totalDuration: 0,
    sentimentHistory: [],
    participationMetrics: new Map(),
    overallSentiment: 0,
    engagementLevel: 'low',
    keyTopics: [],
    summary: ''
  });
  const [talkTimeTracking, setTalkTimeTracking] = useState<Map<string, number>>(new Map());
  const [lastTalkTime, setLastTalkTime] = useState<Map<string, Date>>(new Map());

  // Breakout room state
  const [breakoutRooms, setBreakoutRooms] = useState<BreakoutRoom[]>([]);
  const [currentBreakoutRoom, setCurrentBreakoutRoom] = useState<string | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Handle media stream initialization
  const initializeMediaDevices = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoEnabled,
        audio: audioEnabled
      });
      setLocalStream(stream);
      return stream;
    } catch (err) {
      setError('Failed to access media devices. Please check permissions.');
      console.error('Error accessing media devices:', err);
      return null;
    }
  };

  // Join a room
  const joinRoom = async (roomId: string, userName: string, isHost = false) => {
    setIsConnecting(true);
    setError(null);

    try {
      const stream = await initializeMediaDevices();
      if (!stream || !socket) {
        setIsConnecting(false);
        return;
      }

      setCurrentRoomId(roomId);
      setCurrentUserName(userName);
      setCurrentUserRole(isHost ? 'admin' : 'participant');

      // Inform the server that we're joining a room
      socket.emit('join-room', { roomId, userName, isHost });

      // If user is host, grant recording permission to self
      if (isHost && socket && socket.id) {
        setRecordingEnabled(prev => {
          const updated = new Map(prev);
          updated.set(socket.id!, true);
          return updated;
        });
      }

      // Handle new user joining
      socket.on('user-joined', ({ userId, userName, role = 'participant' }) => {
        console.log(`User joined: ${userName} (${userId}) - Role: ${role}`);

        // Add to participants list
        setParticipants(prev => {
          const updated = new Map(prev);
          updated.set(userId, { id: userId, name: userName, role });
          return updated;
        });

        // Create a new peer connection
        const peer = new Peer({
          initiator: true,
          trickle: false,
          stream
        });

        // When we have a signal to send
        peer.on('signal', (signal) => {
          socket.emit('signal', { userId, signal });
        });

        // When we receive a remote stream
        peer.on('stream', (remoteStream) => {
          setRemoteStreams(prev => {
            const updated = new Map(prev);
            updated.set(userId, remoteStream);
            return updated;
          });
        });

        // Store the peer connection
        setPeers(prev => {
          const updated = new Map(prev);
          updated.set(userId, peer);
          return updated;
        });
      });

      // Handle receiving a signal
      socket.on('signal', ({ userId, signal }) => {
        const peer = peers.get(userId);
        
        if (peer) {
          // Existing peer, just signal
          peer.signal(signal);
        } else {
          // New peer connection needed
          const newPeer = new Peer({
            initiator: false,
            trickle: false,
            stream
          });

          newPeer.on('signal', (mySignal) => {
            socket.emit('signal', { userId, signal: mySignal });
          });

          newPeer.on('stream', (remoteStream) => {
            setRemoteStreams(prev => {
              const updated = new Map(prev);
              updated.set(userId, remoteStream);
              return updated;
            });
          });

          newPeer.signal(signal);

          setPeers(prev => {
            const updated = new Map(prev);
            updated.set(userId, newPeer);
            return updated;
          });
        }
      });

      // Handle user leaving
      socket.on('user-left', ({ userId }) => {
        // Clean up peer connection
        const peer = peers.get(userId);
        if (peer) {
          peer.destroy();
        }

        // Remove from peers
        setPeers(prev => {
          const updated = new Map(prev);
          updated.delete(userId);
          return updated;
        });

        // Remove from remote streams
        setRemoteStreams(prev => {
          const updated = new Map(prev);
          updated.delete(userId);
          return updated;
        });

        // Remove from participants
        setParticipants(prev => {
          const updated = new Map(prev);
          updated.delete(userId);
          return updated;
        });
      });

      setIsConnecting(false);
    } catch (err) {
      console.error('Error joining room:', err);
      setError('Failed to join room. Please try again.');
      setIsConnecting(false);
    }
  };

  // Leave the current room
  const leaveRoom = () => {
    if (socket && currentRoomId) {
      socket.emit('leave-room', { roomId: currentRoomId });
    }

    // Clean up all peer connections
    peers.forEach(peer => {
      peer.destroy();
    });

    // Reset state
    setPeers(new Map());
    setRemoteStreams(new Map());
    setParticipants(new Map());
    setCurrentRoomId(null);

    // Stop local stream tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
      });
      setLocalStream(null);
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  // Toggle screen sharing
  const toggleScreenShare = async () => {
    if (!localStream) return;

    if (screenShareEnabled) {
      // Switch back to camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        // Replace tracks in all peer connections
        peers.forEach(peer => {
          stream.getTracks().forEach(track => {
            const sender = (peer as any)._senders.find((s: any) => s.track.kind === track.kind);
            if (sender) {
              sender.replaceTrack(track);
            }
          });
        });

        // Update local stream
        setLocalStream(stream);
        setScreenShareEnabled(false);
      } catch (err) {
        console.error('Error switching back to camera:', err);
      }
    } else {
      // Switch to screen sharing
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });
        
        // Replace video track in all peer connections
        peers.forEach(peer => {
          const videoTrack = stream.getVideoTracks()[0];
          const sender = (peer as any)._senders.find((s: any) => s.track.kind === 'video');
          if (sender && videoTrack) {
            sender.replaceTrack(videoTrack);
          }
        });

        // Update local stream
        const newStream = new MediaStream([
          ...localStream.getAudioTracks(),
          ...stream.getVideoTracks()
        ]);
        setLocalStream(newStream);
        setScreenShareEnabled(true);

        // Handle when user stops sharing screen
        stream.getVideoTracks()[0].onended = () => {
          toggleScreenShare();
        };
      } catch (err) {
        console.error('Error sharing screen:', err);
      }
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      leaveRoom();
    };
  }, []);

  const sendMessage = (text: string, type: 'public' | 'private' = 'public', recipient?: string) => {
    if (!socket || !currentUserName) return;
    const message: Message = {
      id: Math.random().toString(36).substr(2, 9),
      sender: currentUserName,
      text,
      timestamp: new Date(),
      type,
      recipient
    };
    setMessages(prev => [...prev, message]);
    socket.emit('message', { roomId: currentRoomId, message });
  };

  useEffect(() => {
    if (!socket) return;
    socket.on('message', ({ message }) => {
      setMessages(prev => [...prev, message]);
    });

    // Admin event listeners
    socket.on('user-kicked', ({ userId }) => {
      if (userId === socket.id) {
        // Current user was kicked
        leaveRoom();
        setError('You have been kicked from the room.');
      } else {
        // Remove kicked user
        setParticipants(prev => {
          const updated = new Map(prev);
          updated.delete(userId);
          return updated;
        });
      }
    });

    socket.on('user-banned', ({ userId }) => {
      if (userId === socket.id) {
        leaveRoom();
        setError('You have been banned from the room.');
      } else {
        setParticipants(prev => {
          const updated = new Map(prev);
          updated.delete(userId);
          return updated;
        });
      }
    });

    socket.on('user-muted', ({ userId }) => {
      setParticipants(prev => {
        const updated = new Map(prev);
        const participant = updated.get(userId);
        if (participant) {
          updated.set(userId, { ...participant, muted: true });
        }
        return updated;
      });
    });

    socket.on('room-locked', ({ locked }) => {
      setRoomLocked(locked);
    });

    socket.on('join-request', ({ userId, userName }) => {
      setJoinRequests(prev => [...prev, { id: userId, name: userName, role: 'participant' }]);
    });
  }, [socket]);

  // Admin functions
  const kickUser = (userId: string) => {
    if (socket && currentRoomId) {
      socket.emit('kick-user', { roomId: currentRoomId, userId });
    }
  };

  const banUser = (userId: string) => {
    if (socket && currentRoomId) {
      socket.emit('ban-user', { roomId: currentRoomId, userId });
    }
  };

  const muteUser = (userId: string) => {
    if (socket && currentRoomId) {
      socket.emit('mute-user', { roomId: currentRoomId, userId });
    }
  };

  const lockRoom = (locked: boolean) => {
    if (socket && currentRoomId) {
      socket.emit('lock-room', { roomId: currentRoomId, locked });
    }
  };

  const approveJoin = (userId: string, approved: boolean) => {
    if (socket && currentRoomId) {
      socket.emit('approve-join', { roomId: currentRoomId, userId, approved });
      // Remove from join requests
      setJoinRequests(prev => prev.filter(req => req.id !== userId));
    }
  };

  const lockAllParticipants = () => {
    if (socket && currentRoomId) {
      // Emit bulk mute and disable video for all participants
      socket.emit('lock-all-participants', { roomId: currentRoomId });
      // Update local state to reflect all participants are muted and video disabled
      setParticipants(prev => {
        const updated = new Map(prev);
        updated.forEach((participant, userId) => {
          if (userId !== socket.id) { // Don't mute/disable self
            updated.set(userId, { ...participant, muted: true });
          }
        });
        return updated;
      });
      // Also disable local video
      if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = false;
          setVideoEnabled(false);
        }
      }
    }
  };

  const unlockAllParticipants = () => {
    if (socket && currentRoomId) {
      // Emit bulk unmute and enable video for all participants
      socket.emit('unlock-all-participants', { roomId: currentRoomId });
      // Update local state to reflect all participants are unmuted
      setParticipants(prev => {
        const updated = new Map(prev);
        updated.forEach((participant, userId) => {
          updated.set(userId, { ...participant, muted: false });
        });
        return updated;
      });
      // Also enable local video
      if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = true;
          setVideoEnabled(true);
        }
      }
    }
  };

  // Recording functions
  const grantRecordingPermission = (userId: string) => {
    if (socket && currentRoomId) {
      setRecordingEnabled(prev => {
        const updated = new Map(prev);
        updated.set(userId, true);
        return updated;
      });
      socket.emit('grant-recording-permission', { roomId: currentRoomId, userId });
    }
  };

  const revokeRecordingPermission = (userId: string) => {
    if (socket && currentRoomId) {
      setRecordingEnabled(prev => {
        const updated = new Map(prev);
        updated.set(userId, false);
        return updated;
      });
      socket.emit('revoke-recording-permission', { roomId: currentRoomId, userId });
    }
  };

  const startRecording = () => {
    if (!localStream || !recordingEnabled.get(socket?.id || '')) return;

    try {
      const recorder = new MediaRecorder(localStream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recording-${new Date().toISOString()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setRecordedChunks([]);
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);

      if (socket && currentRoomId) {
        socket.emit('recording-started', { roomId: currentRoomId });
      }
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording. Please check your browser compatibility.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);

      if (socket && currentRoomId) {
        socket.emit('recording-stopped', { roomId: currentRoomId });
      }
    }
  };

  // Invite user function
  const inviteUser = (userId: string) => {
    // For now, this function can be used to send invites via external means
    // In a real implementation, this could send an email, SMS, or push notification
    // For this demo, we'll just log it and could potentially emit a socket event
    console.log(`Inviting user: ${userId}`);
    if (socket && currentRoomId) {
      // Emit an invite event that could be handled by the server
      socket.emit('invite-user', { roomId: currentRoomId, userId });
    }
  };

  // Toggle interpreter
  const toggleInterpreter = () => {
    setInterpreterEnabled(prev => !prev);
  };

  // Handle processed stream from virtual background processor
  const handleProcessedStream = (stream: MediaStream | null) => {
    if (stream && virtualBackgroundEnabled) {
      // Replace the video track in all peer connections with the processed stream
      peers.forEach(peer => {
        const videoTrack = stream.getVideoTracks()[0];
        const sender = (peer as any)._senders.find((s: any) => s.track.kind === 'video');
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack);
        }
      });
      setProcessedStream(stream);
    } else {
      // Switch back to original stream
      if (localStream) {
        peers.forEach(peer => {
          const videoTrack = localStream.getVideoTracks()[0];
          const sender = (peer as any)._senders.find((s: any) => s.track.kind === 'video');
          if (sender && videoTrack) {
            sender.replaceTrack(videoTrack);
          }
        });
      }
      if (processedStream) {
        processedStream.getTracks().forEach(track => track.stop());
        setProcessedStream(null);
      }
    }
  };

  // Toggle virtual background
  const toggleVirtualBackground = () => {
    setVirtualBackgroundEnabled(prev => !prev);
  };

  // Analytics functions
  const toggleAnalytics = () => {
    setAnalyticsEnabled(prev => !prev);
  };

  // Simple sentiment analysis (placeholder - in production, use AI service)
  const analyzeSentiment = (text: string): SentimentData => {
    // Simple keyword-based sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like', 'happy', 'excited', 'yes', 'agree', 'perfect'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'sad', 'angry', 'no', 'disagree', 'problem', 'issue', 'worried'];

    const lowerText = text.toLowerCase();
    let score = 0;
    let positiveCount = 0;
    let negativeCount = 0;

    positiveWords.forEach(word => {
      if (lowerText.includes(word)) positiveCount++;
    });

    negativeWords.forEach(word => {
      if (lowerText.includes(word)) negativeCount++;
    });

    if (positiveCount > 0 || negativeCount > 0) {
      score = (positiveCount - negativeCount) / (positiveCount + negativeCount);
    }

    return {
      timestamp: new Date(),
      score: Math.max(-1, Math.min(1, score)), // Clamp between -1 and 1
      confidence: Math.min(1, (positiveCount + negativeCount) / 10), // Simple confidence based on keyword matches
      source: 'message',
      text
    };
  };

  // Update participation metrics
  const updateParticipationMetrics = (userId: string, userName: string, activityType: 'message' | 'speech') => {
    setMeetingAnalytics(prev => {
      const updated = { ...prev };
      const metrics = updated.participationMetrics.get(userId) || {
        userId,
        userName,
        talkTime: talkTimeTracking.get(userId) || 0,
        messageCount: 0,
        engagementScore: 0,
        lastActivity: new Date(),
        sentimentAverage: 0
      };

      if (activityType === 'message') {
        metrics.messageCount++;
      }

      metrics.lastActivity = new Date();
      metrics.engagementScore = Math.min(100, metrics.messageCount * 10 + (metrics.talkTime / 60) * 5);

      updated.participationMetrics.set(userId, metrics);
      return updated;
    });
  };

  // Generate meeting summary
  const generateMeetingSummary = () => {
    const { sentimentHistory, participationMetrics } = meetingAnalytics;
    const totalMessages = messages.length;
    const avgSentiment = sentimentHistory.length > 0
      ? sentimentHistory.reduce((sum, s) => sum + s.score, 0) / sentimentHistory.length
      : 0;

    const topParticipants = Array.from(participationMetrics.values())
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, 3);

    const summary = `Meeting Summary:
- Duration: ${Math.floor(meetingAnalytics.totalDuration / 60)} minutes
- Total messages: ${totalMessages}
- Average sentiment: ${avgSentiment > 0 ? 'Positive' : avgSentiment < 0 ? 'Negative' : 'Neutral'}
- Most active participants: ${topParticipants.map(p => p.userName).join(', ')}
- Key topics discussed: ${meetingAnalytics.keyTopics.join(', ') || 'Various topics'}`;

    setMeetingAnalytics(prev => ({ ...prev, summary }));
  };

  // Speech recognition effect
  useEffect(() => {
    if (!interpreterEnabled) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US'; // Can be made configurable

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setTranscribedText(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      // Don't set fatal error for 'no-speech' as it's expected when no one is speaking
      if (event.error !== 'no-speech') {
        setError('Speech recognition error: ' + event.error);
      }
    };

    recognition.onend = () => {
      if (interpreterEnabled) {
        // Restart if still enabled
        recognition.start();
      }
    };

    recognition.start();

    return () => {
      recognition.stop();
    };
  }, [interpreterEnabled]);

  // Breakout room functions
  const createBreakoutRooms = () => {
    if (!socket || !currentRoomId || currentUserRole !== 'admin') return;

    // Group participants by interests
    const interestGroups = new Map<string, Participant[]>();
    participants.forEach((participant) => {
      const interests = participant.interests || [];
      const key = interests.length > 0 ? interests[0] : 'general';
      if (!interestGroups.has(key)) {
        interestGroups.set(key, []);
      }
      interestGroups.get(key)!.push(participant);
    });

    // Create breakout rooms
    const newBreakoutRooms: BreakoutRoom[] = [];
    interestGroups.forEach((groupParticipants, interest) => {
      const roomId = `breakout-${interest}-${Date.now()}`;
      const room: BreakoutRoom = {
        id: roomId,
        name: `${interest.charAt(0).toUpperCase() + interest.slice(1)} Discussion`,
        interests: [interest],
        participants: new Map(groupParticipants.map(p => [p.id, p]))
      };
      newBreakoutRooms.push(room);
    });

    setBreakoutRooms(newBreakoutRooms);

    // Emit to server
    socket.emit('create-breakout-rooms', { roomId: currentRoomId, breakoutRooms: newBreakoutRooms });
  };

  const joinBreakoutRoom = (breakoutRoomId: string) => {
    if (!socket || !currentRoomId) return;

    const room = breakoutRooms.find(r => r.id === breakoutRoomId);
    if (!room) return;

    setCurrentBreakoutRoom(breakoutRoomId);

    // Update participant in main room
    setParticipants(prev => {
      const updated = new Map(prev);
      const participant = updated.get(socket.id!);
      if (participant) {
        updated.set(socket.id!, { ...participant, currentBreakoutRoom: breakoutRoomId });
      }
      return updated;
    });

    // Emit to server
    socket.emit('join-breakout-room', { roomId: currentRoomId, breakoutRoomId });
  };

  const leaveBreakoutRoom = () => {
    if (!socket || !currentRoomId || !currentBreakoutRoom) return;

    setCurrentBreakoutRoom(null);

    // Update participant in main room
    setParticipants(prev => {
      const updated = new Map(prev);
      const participant = updated.get(socket.id!);
      if (participant) {
        updated.set(socket.id!, { ...participant, currentBreakoutRoom: null });
      }
      return updated;
    });

    // Emit to server
    socket.emit('leave-breakout-room', { roomId: currentRoomId, breakoutRoomId: currentBreakoutRoom });
  };

  const deleteBreakoutRoom = (breakoutRoomId: string) => {
    if (!socket || !currentRoomId || currentUserRole !== 'admin') return;

    setBreakoutRooms(prev => prev.filter(room => room.id !== breakoutRoomId));

    // Move participants back to main room
    setParticipants(prev => {
      const updated = new Map(prev);
      updated.forEach((participant, userId) => {
        if (participant.currentBreakoutRoom === breakoutRoomId) {
          updated.set(userId, { ...participant, currentBreakoutRoom: null });
        }
      });
      return updated;
    });

    // Emit to server
    socket.emit('delete-breakout-room', { roomId: currentRoomId, breakoutRoomId });
  };

  const value = {
    localStream: processedStream || localStream,
    remoteStreams,
    participants,
    messages,
    audioEnabled,
    videoEnabled,
    screenShareEnabled,
    isConnecting,
    error,
    currentUserRole,
    roomLocked,
    joinRequests,
    recordingEnabled,
    isRecording,
    interpreterEnabled,
    transcribedText,
    virtualBackgroundEnabled,
    socket,
    // Analytics properties
    analyticsEnabled,
    meetingAnalytics,
    // Breakout room properties
    breakoutRooms,
    currentBreakoutRoom,
    joinRoom,
    leaveRoom,
    sendMessage,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    kickUser,
    banUser,
    muteUser,
    lockRoom,
    approveJoin,
    lockAllParticipants,
    unlockAllParticipants,
    grantRecordingPermission,
    revokeRecordingPermission,
    startRecording,
    stopRecording,
    inviteUser,
    toggleInterpreter,
    toggleVirtualBackground,
    // Analytics functions
    toggleAnalytics,
    analyzeSentiment,
    updateParticipationMetrics,
    generateMeetingSummary,
    // Breakout room functions
    createBreakoutRooms,
    joinBreakoutRoom,
    leaveBreakoutRoom,
    deleteBreakoutRoom
  };

  return (
    <VideoContext.Provider value={value}>
      <VirtualBackgroundProcessor
        inputStream={localStream}
        enabled={virtualBackgroundEnabled}
        onProcessedStream={handleProcessedStream}
      />
      {children}
    </VideoContext.Provider>
  );
};

export const useVideo = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideo must be used within a VideoProvider');
  }
  return context;
};