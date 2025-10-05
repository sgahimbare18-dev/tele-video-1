import React from 'react';
import styled from 'styled-components';
import { Typography } from '@mui/material';
import VideoPlayer from './VideoPlayer';

interface Participant {
  id: string;
  stream: MediaStream;
  name: string;
}

interface ParticipantGridProps {
  participants: Participant[];
  localStream: MediaStream | null;
}

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
  grid-auto-rows: 1fr;
  gap: 8px;
  width: 100%;
  height: 100%;
`;

const ParticipantContainer = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
`;

const ParticipantName = styled.div`
  position: absolute;
  bottom: 16px;
  left: 16px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  z-index: 5;
`;

const ParticipantGrid: React.FC<ParticipantGridProps> = ({ participants, localStream }) => {
  // Limit to 9 video streams for performance in large groups
  const maxVideos = 9;
  const displayedParticipants = participants.slice(0, maxVideos);
  const additionalCount = participants.length - maxVideos;

  return (
    <GridContainer>
      {displayedParticipants.map((participant) => (
        <ParticipantContainer key={participant.id}>
          <VideoPlayer stream={participant.stream} />
          <ParticipantName>{participant.name}</ParticipantName>
        </ParticipantContainer>
      ))}
      {localStream && (
        <ParticipantContainer>
          <VideoPlayer stream={localStream} muted isLocal />
          <ParticipantName>You</ParticipantName>
        </ParticipantContainer>
      )}
      {additionalCount > 0 && (
        <ParticipantContainer style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#333' }}>
          <Typography variant="h6" style={{ color: 'white' }}>
            +{additionalCount} more participants (audio only)
          </Typography>
        </ParticipantContainer>
      )}
    </GridContainer>
  );
};

export default ParticipantGrid;