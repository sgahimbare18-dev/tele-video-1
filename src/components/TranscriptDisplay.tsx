import React from 'react';
import styled from 'styled-components';
import { Typography, Paper } from '@mui/material';

interface TranscriptDisplayProps {
  transcribedText: string;
  isVisible: boolean;
  onClose: () => void;
}

const TranscriptContainer = styled(Paper)`
  position: fixed;
  bottom: 120px;
  right: 16px;
  width: 300px;
  max-height: 200px;
  background-color: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(10px);
  color: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
`;

const TranscriptText = styled(Typography)`
  font-size: 14px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.9);
`;

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({
  transcribedText,
  isVisible,
  onClose
}) => {
  if (!isVisible) return null;

  return (
    <TranscriptContainer>
      <Header>
        <Typography variant="h6" style={{ fontSize: '16px', fontWeight: 600 }}>
          Live Transcript
        </Typography>
        <CloseButton onClick={onClose}>×</CloseButton>
      </Header>
      <TranscriptText>
        {transcribedText || 'Listening...'}
      </TranscriptText>
    </TranscriptContainer>
  );
};

export default TranscriptDisplay;
