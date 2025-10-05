import React from 'react';
import styled from 'styled-components';
import { Typography, Avatar, List, ListItem, ListItemAvatar, ListItemText, Button, Chip, Box } from '@mui/material';

type UserRole = 'admin' | 'moderator' | 'participant';

interface Participant {
  id: string;
  name: string;
  role: UserRole;
  muted?: boolean;
  banned?: boolean;
}

interface ParticipantsListProps {
  participants: Map<string, Participant>;
  currentUserRole: UserRole;
  onClose: () => void;
  onKickUser: (userId: string) => void;
  onBanUser: (userId: string) => void;
  onMuteUser: (userId: string) => void;
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
  margin-bottom: 16px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
`;

const ParticipantsList: React.FC<ParticipantsListProps> = ({
  participants,
  currentUserRole,
  onClose,
  onKickUser,
  onBanUser,
  onMuteUser
}) => {
  const participantArray = Array.from(participants.values());

  const canModerate = currentUserRole === 'admin' || currentUserRole === 'moderator';

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'error';
      case 'moderator': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Sidebar>
      <Header>
        <Typography variant="h6">Participants ({participantArray.length})</Typography>
        <CloseButton onClick={onClose}>×</CloseButton>
      </Header>
      <List>
        {participantArray.map((participant) => (
          <ListItem key={participant.id} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
              <ListItemAvatar>
                <Avatar>{participant.name.charAt(0).toUpperCase()}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1">{participant.name}</Typography>
                    <Chip
                      label={participant.role}
                      size="small"
                      color={getRoleColor(participant.role)}
                      variant="outlined"
                    />
                    {participant.muted && (
                      <Chip label="Muted" size="small" color="secondary" variant="outlined" />
                    )}
                  </Box>
                }
              />
            </Box>
            {canModerate && participant.role !== 'admin' && (
              <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  variant="outlined"
                  color="warning"
                  onClick={() => onMuteUser(participant.id)}
                  disabled={participant.muted}
                >
                  {participant.muted ? 'Unmute' : 'Mute'}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() => onKickUser(participant.id)}
                >
                  Kick
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() => onBanUser(participant.id)}
                >
                  Ban
                </Button>
              </Box>
            )}
          </ListItem>
        ))}
      </List>
    </Sidebar>
  );
};

export default ParticipantsList;
