import React from 'react';
import styled from 'styled-components';
import { Typography, Button, TextField, Box, IconButton } from '@mui/material';
import { Close, ContentCopy } from '@mui/icons-material';

interface InviteModalProps {
  roomId: string;
  onClose: () => void;
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1200;
`;

const ModalContent = styled.div`
  background-color: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(10px);
  color: white;
  padding: 24px;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const CloseButton = styled(IconButton)`
  color: white !important;
`;

const LinkContainer = styled(Box)`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const StyledTextField = styled(TextField)`
  flex: 1;

  .MuiInputBase-root {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .MuiInputBase-input {
    color: white;
  }

  .MuiOutlinedInput-notchedOutline {
    border-color: rgba(255, 255, 255, 0.3);
  }

  &:hover .MuiOutlinedInput-notchedOutline {
    border-color: rgba(255, 255, 255, 0.5);
  }

  &.Mui-focused .MuiOutlinedInput-notchedOutline {
    border-color: #4fc3f7;
  }
`;

const CopyButton = styled(Button)`
  background-color: #4fc3f7;
  color: white;

  &:hover {
    background-color: #29b6f6;
  }
`;

const InviteModal: React.FC<InviteModalProps> = ({ roomId, onClose }) => {
  const roomLink = `${window.location.origin}/?roomId=${roomId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(roomLink);
      // You could add a toast notification here
      alert('Room link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = roomLink;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        alert('Room link copied to clipboard!');
      } catch (fallbackErr) {
        console.error('Fallback copy failed: ', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <Header>
          <Typography variant="h6">Invite Participants</Typography>
          <CloseButton onClick={onClose}>
            <Close />
          </CloseButton>
        </Header>

        <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.7)' }}>
          Share this link to invite others to join the meeting:
        </Typography>

        <LinkContainer>
          <StyledTextField
            variant="outlined"
            value={roomLink}
            InputProps={{
              readOnly: true,
            }}
            size="small"
          />
          <CopyButton
            variant="contained"
            onClick={copyToClipboard}
            startIcon={<ContentCopy />}
          >
            Copy
          </CopyButton>
        </LinkContainer>

        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Anyone with this link can join the meeting.
        </Typography>
      </ModalContent>
    </ModalOverlay>
  );
};

export default InviteModal;
