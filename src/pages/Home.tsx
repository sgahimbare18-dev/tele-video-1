import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button, TextField, Typography, Paper, Container } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { VideoCall, People, Lock, LockOpen } from '@mui/icons-material';

const HomeContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
`;

const LogoIcon = styled(VideoCall)`
  font-size: 3rem;
  margin-right: 1rem;
  color: #6200ee;
`;

const StyledPaper = styled(Paper)`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 500px;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
`;

const Form = styled.form`
  width: 100%;
  margin-top: 1rem;
`;

const FormField = styled.div`
  margin-bottom: 1.5rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 1rem;
`;

const FeatureList = styled.div`
  margin-top: 3rem;
  width: 100%;
  max-width: 500px;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const FeatureIcon = styled.div`
  margin-right: 1rem;
  color: #6200ee;
`;

const Home: React.FC = () => {
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for roomId in URL query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const roomIdFromUrl = searchParams.get('roomId');
    if (roomIdFromUrl) {
      setRoomId(roomIdFromUrl);
    }
  }, [location.search]);

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId && userName) {
      navigate(`/room/${roomId}`, { state: { userName } });
    }
  };

  const handleCreateRoom = () => {
    if (userName) {
      // Generate a random room ID
      const newRoomId = Math.random().toString(36).substring(2, 7);
      navigate(`/room/${newRoomId}`, { state: { userName, isHost: true } });
    }
  };

  return (
    <HomeContainer>
      <StyledPaper elevation={3}>
        <Logo>
          <LogoIcon />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Tele-Video
          </Typography>
        </Logo>

        <Typography variant="h6" gutterBottom>
          {isCreatingRoom ? 'Create a New Meeting' : 'Join a Meeting'}
        </Typography>

        <Form onSubmit={handleJoinRoom}>
          <FormField>
            <TextField
              fullWidth
              label="Your Name"
              variant="outlined"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
          </FormField>

          {!isCreatingRoom && (
            <FormField>
              <TextField
                fullWidth
                label="Room ID"
                variant="outlined"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                required
              />
            </FormField>
          )}

          <ButtonContainer>
            {isCreatingRoom ? (
              <>
                <Button 
                  variant="outlined" 
                  onClick={() => setIsCreatingRoom(false)}
                >
                  Back
                </Button>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleCreateRoom}
                  disabled={!userName}
                >
                  Create Room
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outlined" 
                  onClick={() => setIsCreatingRoom(true)}
                >
                  Create New
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={!roomId || !userName}
                >
                  Join Room
                </Button>
              </>
            )}
          </ButtonContainer>
        </Form>
      </StyledPaper>

      <FeatureList>
        <Typography variant="h6" gutterBottom>
          Next-Generation Video Conferencing
        </Typography>
        
        <FeatureItem>
          <FeatureIcon>
            <People />
          </FeatureIcon>
          <Typography>Seamless 1:1 calls and group meetings</Typography>
        </FeatureItem>
        
        <FeatureItem>
          <FeatureIcon>
            <Lock />
          </FeatureIcon>
          <Typography>End-to-end encryption for secure communication</Typography>
        </FeatureItem>
        
        <FeatureItem>
          <FeatureIcon>
            <LockOpen />
          </FeatureIcon>
          <Typography>Innovative collaboration features</Typography>
        </FeatureItem>
      </FeatureList>
    </HomeContainer>
  );
};

export default Home;