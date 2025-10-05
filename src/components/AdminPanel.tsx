import React from 'react';
import styled from 'styled-components';
import {
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Box,
  Divider,
  Chip
} from '@mui/material';
import BreakoutRoomPanel from './BreakoutRoomPanel';

interface Participant {
  id: string;
  name: string;
  role: 'admin' | 'moderator' | 'participant';
  muted?: boolean;
  banned?: boolean;
}

interface AdminPanelProps {
  roomLocked: boolean;
  joinRequests: Participant[];
  recordingEnabled: Map<string, boolean>;
  isRecording: boolean;
  onToggleRoomLock: (locked: boolean) => void;
  onApproveJoin: (userId: string, approved: boolean) => void;
  onLockAllParticipants: () => void;
  onUnlockAllParticipants: () => void;
  onGrantRecordingPermission: (userId: string) => void;
  onRevokeRecordingPermission: (userId: string) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onClose: () => void;
}

const Sidebar = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 350px;
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

const Section = styled(Paper)`
  padding: 16px;
  margin-bottom: 16px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
`;

const AdminPanel: React.FC<AdminPanelProps> = ({
  roomLocked,
  joinRequests,
  recordingEnabled,
  isRecording,
  onToggleRoomLock,
  onApproveJoin,
  onLockAllParticipants,
  onUnlockAllParticipants,
  onGrantRecordingPermission,
  onRevokeRecordingPermission,
  onStartRecording,
  onStopRecording,
  onClose
}) => {
  return (
    <Sidebar>
      <Header>
        <Typography variant="h6">Admin Panel</Typography>
        <CloseButton onClick={onClose}>×</CloseButton>
      </Header>

      <Section>
        <Typography variant="h6" gutterBottom>Room Settings</Typography>
        <FormControlLabel
          control={
            <Switch
              checked={roomLocked}
              onChange={(e) => onToggleRoomLock(e.target.checked)}
              color="primary"
            />
          }
          label="Lock Room (Require approval for new joins)"
          sx={{ color: 'white' }}
        />
      </Section>

      {joinRequests.length > 0 && (
        <Section>
          <Typography variant="h6" gutterBottom>Join Requests</Typography>
          <List>
            {joinRequests.map((request) => (
              <ListItem key={request.id} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
                  <ListItemAvatar>
                    <Avatar>{request.name.charAt(0).toUpperCase()}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1">{request.name}</Typography>
                        <Chip
                          label={request.role}
                          size="small"
                          color="default"
                          variant="outlined"
                        />
                      </Box>
                    }
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'flex-end' }}>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    onClick={() => onApproveJoin(request.id, true)}
                  >
                    Approve
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => onApproveJoin(request.id, false)}
                  >
                    Reject
                  </Button>
                </Box>
              </ListItem>
            ))}
          </List>
        </Section>
      )}

      <Section>
        <Typography variant="h6" gutterBottom>Quick Actions</Typography>
        <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.7)' }}>
          Use the Participants panel for individual user management (kick, ban, mute).
        </Typography>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />
        <Button
          variant="contained"
          color="error"
          fullWidth
          onClick={onLockAllParticipants}
          sx={{ mb: 1 }}
        >
          Lock All Participants
        </Button>
        <Button
          variant="contained"
          color="warning"
          fullWidth
          onClick={onUnlockAllParticipants}
        >
          Unlock All Participants
        </Button>
      </Section>

      <Section>
        <Typography variant="h6" gutterBottom>Recording Controls</Typography>
        <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.7)' }}>
          Manage recording permissions and control session recording.
        </Typography>
        <Divider sx={{ my: 2, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />
        {isRecording ? (
          <Button
            variant="contained"
            color="error"
            fullWidth
            onClick={onStopRecording}
            sx={{ mb: 1 }}
          >
            Stop Recording
          </Button>
        ) : (
          <Button
            variant="contained"
            color="success"
            fullWidth
            onClick={onStartRecording}
            sx={{ mb: 1 }}
          >
            Start Recording
          </Button>
        )}
        <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.7)' }}>
          Recording Status: {isRecording ? 'Recording' : 'Not Recording'}
        </Typography>
      </Section>

      <Section>
        <BreakoutRoomPanel />
      </Section>
    </Sidebar>
  );
};

export default AdminPanel;
