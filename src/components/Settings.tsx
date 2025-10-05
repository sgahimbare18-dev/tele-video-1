import React from 'react';
import styled from 'styled-components';
import { Typography, Switch, FormControlLabel, Divider } from '@mui/material';

interface SettingsProps {
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenShareEnabled: boolean;
  interpreterEnabled: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleInterpreter: () => void;
  onClose: () => void;
}

const Sidebar = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 300px;
  height: 100vh;
  background-color: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(10px);
  color: white;
  padding: 16px;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled(Typography)`
  margin-bottom: 16px;
  font-weight: 600;
`;

const StyledFormControlLabel = styled(FormControlLabel)`
  .MuiSwitch-root {
    color: #4fc3f7;
  }

  .MuiSwitch-track {
    background-color: rgba(255, 255, 255, 0.3);
  }

  .Mui-checked + .MuiSwitch-track {
    background-color: #4fc3f7;
  }

  .MuiTypography-root {
    color: white;
  }
`;

const StyledDivider = styled(Divider)`
  background-color: rgba(255, 255, 255, 0.2);
  margin: 16px 0;
`;

const Settings: React.FC<SettingsProps> = ({
  audioEnabled,
  videoEnabled,
  screenShareEnabled,
  interpreterEnabled,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleInterpreter,
  onClose
}) => {
  return (
    <Sidebar>
      <Header>
        <Typography variant="h6">Settings</Typography>
        <CloseButton onClick={onClose}>×</CloseButton>
      </Header>

      <Section>
        <SectionTitle variant="h6">Audio & Video</SectionTitle>
        <StyledFormControlLabel
          control={
            <Switch
              checked={audioEnabled}
              onChange={onToggleAudio}
              color="primary"
            />
          }
          label="Microphone"
        />
        <StyledDivider />
        <StyledFormControlLabel
          control={
            <Switch
              checked={videoEnabled}
              onChange={onToggleVideo}
              color="primary"
            />
          }
          label="Camera"
        />
        <StyledDivider />
        <StyledFormControlLabel
          control={
            <Switch
              checked={screenShareEnabled}
              onChange={onToggleScreenShare}
              color="primary"
            />
          }
          label="Screen Share"
        />
        <StyledDivider />
        <StyledFormControlLabel
          control={
            <Switch
              checked={interpreterEnabled}
              onChange={onToggleInterpreter}
              color="primary"
            />
          }
          label="Interpreter"
        />
      </Section>

      <Section>
        <SectionTitle variant="h6">About</SectionTitle>
        <Typography variant="body2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Tele-Video App v1.0.0
          <br />
          Real-time video conferencing with WebRTC
        </Typography>
      </Section>
    </Sidebar>
  );
};

export default Settings;
