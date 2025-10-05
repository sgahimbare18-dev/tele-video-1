import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';

interface VideoPlayerProps {
  stream: MediaStream | null;
  muted?: boolean;
  isLocal?: boolean;
}

const VideoContainer = styled.div<{ isLocal: boolean }>`
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  background-color: #1a1a2e;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  ${props => props.isLocal && `
    position: absolute;
    bottom: 20px;
    right: 20px;
    width: 320px;
    height: 240px;
    z-index: 10;
  `}
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const VideoPlayer: React.FC<VideoPlayerProps> = ({ stream, muted = false, isLocal = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <VideoContainer isLocal={isLocal}>
      <Video 
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
      />
    </VideoContainer>
  );
};

export default VideoPlayer;