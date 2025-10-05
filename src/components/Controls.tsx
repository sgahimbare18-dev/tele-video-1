import React from 'react';
import styled from 'styled-components';
import {
  Mic, MicOff, Videocam, VideocamOff,
  ScreenShare, StopScreenShare, Chat,
  PeopleAlt, CallEnd, Settings, AdminPanelSettings, PersonAdd,
  FiberManualRecord, Stop, RecordVoiceOver, BlurOn
} from '@mui/icons-material';

interface ControlsProps {
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenShareEnabled: boolean;
  virtualBackgroundEnabled: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleVirtualBackground: () => void;
  onOpenChat: () => void;
  onOpenParticipants: () => void;
  onEndCall: () => void;
  onOpenSettings: () => void;
  currentUserRole?: 'admin' | 'moderator' | 'participant';
  onOpenAdminPanel?: () => void;
  onOpenInvite?: () => void;
  isRecording: boolean;
  recordingEnabled: Map<string, boolean>;
  currentUserId?: string;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onToggleInterpreter: () => void;
}

const ControlsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  background-color: rgba(26, 26, 46, 0.8);
  border-radius: 12px;
  margin-top: 16px;
  backdrop-filter: blur(10px);
`;

const ControlButton = styled.button<{ danger?: boolean; disabled?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin: 0 8px;
  border: none;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  background-color: ${props => {
    if (props.danger) return '#e74c3c';
    if (props.disabled) return 'rgba(255, 255, 255, 0.05)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  color: ${props => props.disabled ? 'rgba(255, 255, 255, 0.3)' : 'white'};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => {
      if (props.danger) return '#c0392b';
      if (props.disabled) return 'rgba(255, 255, 255, 0.05)';
      return 'rgba(255, 255, 255, 0.2)';
    }};
    transform: ${props => props.disabled ? 'none' : 'scale(1.05)'};
  }

  &:active {
    transform: ${props => props.disabled ? 'none' : 'scale(0.95)'};
  }
`;

const Controls: React.FC<ControlsProps> = ({
  audioEnabled,
  videoEnabled,
  screenShareEnabled,
  virtualBackgroundEnabled,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleVirtualBackground,
  onOpenChat,
  onOpenParticipants,
  onEndCall,
  onOpenSettings,
  currentUserRole,
  onOpenAdminPanel,
  onOpenInvite,
  isRecording,
  recordingEnabled,
  currentUserId,
  onStartRecording,
  onStopRecording,
  onToggleInterpreter
}) => {
  const canModerate = currentUserRole === 'admin' || currentUserRole === 'moderator';
  const canRecord = currentUserId ? recordingEnabled.get(currentUserId) : false;

  return (
    <ControlsContainer>
      <ControlButton onClick={onToggleAudio}>
        {audioEnabled ? <Mic /> : <MicOff />}
      </ControlButton>
      <ControlButton onClick={onToggleVideo}>
        {videoEnabled ? <Videocam /> : <VideocamOff />}
      </ControlButton>
      <ControlButton onClick={onToggleScreenShare}>
        {screenShareEnabled ? <StopScreenShare /> : <ScreenShare />}
      </ControlButton>
      <ControlButton onClick={onToggleVirtualBackground}>
        <BlurOn />
      </ControlButton>
      <ControlButton onClick={onOpenChat}>
        <Chat />
      </ControlButton>
      <ControlButton onClick={onOpenParticipants}>
        <PeopleAlt />
      </ControlButton>
      {canModerate && onOpenAdminPanel && (
        <ControlButton onClick={onOpenAdminPanel}>
          <AdminPanelSettings />
        </ControlButton>
      )}
      {onOpenInvite && (
        <ControlButton onClick={onOpenInvite}>
          <PersonAdd />
        </ControlButton>
      )}
      <ControlButton
        onClick={canRecord ? (isRecording ? onStopRecording : onStartRecording) : undefined}
        danger={isRecording}
        disabled={!canRecord}
      >
        {isRecording ? <Stop /> : <FiberManualRecord />}
      </ControlButton>
      <ControlButton onClick={onToggleInterpreter}>
        <RecordVoiceOver />
      </ControlButton>
      <ControlButton danger onClick={onEndCall}>
        <CallEnd />
      </ControlButton>
      <ControlButton onClick={onOpenSettings}>
        <Settings />
      </ControlButton>
    </ControlsContainer>
  );
};

export default Controls;