import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Typography, Paper, CircularProgress } from '@mui/material';
import { useVideo } from '../contexts/VideoContext';
import VideoPlayer from '../components/VideoPlayer';
import Controls from '../components/Controls';
import ParticipantGrid from '../components/ParticipantGrid';
import Chat from '../components/Chat';
import ParticipantsList from '../components/ParticipantsList';
import Settings from '../components/Settings';
import AdminPanel from '../components/AdminPanel';
import InviteModal from '../components/InviteModal';
import TranscriptDisplay from '../components/TranscriptDisplay';

interface LocationState {
  userName: string;
  isHost?: boolean;
}

const RoomContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #121212;
  color: white;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: rgba(26, 26, 46, 0.8);
  backdrop-filter: blur(10px);
`;

const RoomInfo = styled.div`
  display: flex;
  align-items: center;
`;

const RoomId = styled(Paper)`
  padding: 8px 16px;
  margin-left: 16px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 20px;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  width: 100vw;
  height: 100vh;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const ControlsWrapper = styled.div`
  position: absolute;
  bottom: 24px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
`;

const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  
  const {
    localStream,
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
    toggleInterpreter,
    toggleVirtualBackground,
    socket
  } = useVideo();

  useEffect(() => {
    // Check if user came with proper state
    if (!state || !state.userName) {
      navigate('/');
      return;
    }

    // Join the room
    if (roomId) {
      joinRoom(roomId, state.userName, state.isHost || false);
    }

    // Clean up on unmount
    return () => {
      leaveRoom();
    }
  }, [roomId]);

  const handleEndCall = () => {
    leaveRoom();
    navigate('/');
  }

  const handleOpenChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleOpenParticipants = () => {
    setIsParticipantsOpen(!isParticipantsOpen);
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  // Convert participants Map to array for ParticipantGrid
  const participantsArray = Array.from(participants.values()).map(participant => {
    return {
      id: participant.id,
      name: participant.name,
      stream: remoteStreams.get(participant.id) as MediaStream
    };
  }).filter(p => p.stream); // Only include participants with streams

  if (isConnecting) {
    return (
      <RoomContainer>
        <LoadingContainer>
          <CircularProgress color="inherit" />
          <Typography variant="h6" style={{ marginTop: 16 }}>
            Connecting to room...
          </Typography>
        </LoadingContainer>
      </RoomContainer>
    );
  }

  if (error) {
    return (
      <RoomContainer>
        <LoadingContainer>
          <Typography variant="h6" color="error">
            {error}
          </Typography>
          <Typography variant="body1" style={{ marginTop: 16 }}>
            <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/')}>
              Return to home
            </span>
          </Typography>
        </LoadingContainer>
      </RoomContainer>
    );
  }

  // Show waiting for approval if room is locked and user is not admin
  if (roomLocked && currentUserRole !== 'admin') {
    return (
      <RoomContainer>
        <LoadingContainer>
          <Typography variant="h6">
            Room is locked. Waiting for admin approval...
          </Typography>
          <Typography variant="body1" style={{ marginTop: 16 }}>
            Please wait while the room administrator reviews your join request.
          </Typography>
        </LoadingContainer>
      </RoomContainer>
    );
  }

  return (
    <RoomContainer>
      <Header>
        <RoomInfo>
          <Typography variant="h6">Tele-Video</Typography>
          <RoomId>
            <Typography variant="body2">Room: {roomId}</Typography>
          </RoomId>
        </RoomInfo>
        <Typography variant="body2">
          {participantsArray.length + 1} participants
        </Typography>
      </Header>

      <MainContent>
        {participantsArray.length > 0 ? (
          <ParticipantGrid 
            participants={participantsArray}
            localStream={localStream}
          />
        ) : (
          <LoadingContainer>
            <Typography variant="h6">
              Waiting for others to join...
            </Typography>
            {localStream && (
              <div style={{ width: '400px', height: '300px', margin: '24px auto' }}>
                <VideoPlayer stream={localStream} muted isLocal={false} />
              </div>
            )}
          </LoadingContainer>
        )}

        <ControlsWrapper>
        <Controls
          audioEnabled={audioEnabled}
          videoEnabled={videoEnabled}
          screenShareEnabled={screenShareEnabled}
          virtualBackgroundEnabled={virtualBackgroundEnabled}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onToggleScreenShare={toggleScreenShare}
          onToggleVirtualBackground={toggleVirtualBackground}
          onOpenChat={handleOpenChat}
          onOpenParticipants={handleOpenParticipants}
          onEndCall={handleEndCall}
    onOpenSettings={handleOpenSettings}
    currentUserRole={currentUserRole}
    onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
    onOpenInvite={() => setIsInviteModalOpen(true)}
    isRecording={isRecording}
    recordingEnabled={recordingEnabled}
    currentUserId={socket?.id}
    onStartRecording={startRecording}
    onStopRecording={stopRecording}
    onToggleInterpreter={toggleInterpreter}
  />
</ControlsWrapper>
    </MainContent>

    {isChatOpen && (
      <Chat
        messages={messages}
        onSendMessage={sendMessage}
        onClose={() => setIsChatOpen(false)}
        participants={participants}
        currentUserName={state.userName}
      />
    )}

    {isParticipantsOpen && (
      <ParticipantsList
        participants={participants}
        currentUserRole={currentUserRole}
        onClose={() => setIsParticipantsOpen(false)}
        onKickUser={kickUser}
        onBanUser={banUser}
        onMuteUser={muteUser}
      />
    )}

    {isSettingsOpen && (
      <Settings
        audioEnabled={audioEnabled}
        videoEnabled={videoEnabled}
        screenShareEnabled={screenShareEnabled}
        interpreterEnabled={interpreterEnabled}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={toggleScreenShare}
        onToggleInterpreter={toggleInterpreter}
        onClose={() => setIsSettingsOpen(false)}
      />
    )}

    {isAdminPanelOpen && (
      <AdminPanel
        roomLocked={roomLocked}
        joinRequests={joinRequests}
        recordingEnabled={recordingEnabled}
        isRecording={isRecording}
        onToggleRoomLock={lockRoom}
        onApproveJoin={approveJoin}
        onLockAllParticipants={lockAllParticipants}
        onUnlockAllParticipants={unlockAllParticipants}
        onGrantRecordingPermission={grantRecordingPermission}
        onRevokeRecordingPermission={revokeRecordingPermission}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        onClose={() => setIsAdminPanelOpen(false)}
      />
    )}

    {isInviteModalOpen && roomId && (
      <InviteModal
        roomId={roomId}
        onClose={() => setIsInviteModalOpen(false)}
      />
    )}

    <TranscriptDisplay
      transcribedText={transcribedText}
      isVisible={interpreterEnabled}
      onClose={() => {}}
    />
  </RoomContainer>
);
};

export default Room;
