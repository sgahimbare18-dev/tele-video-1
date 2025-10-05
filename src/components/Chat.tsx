import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Typography, TextField, Button, List, ListItem, ListItemText, Switch, FormControlLabel, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
  type: 'public' | 'private';
  recipient?: string;
}

interface ChatProps {
  messages: Message[];
  onSendMessage: (text: string, type?: 'public' | 'private', recipient?: string) => void;
  onClose: () => void;
  participants: Map<string, { id: string; name: string; role: string }>;
  currentUserName: string;
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
  display: flex;
  flex-direction: column;
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

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 16px;
`;

const MessageItem = styled(ListItem)`
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const MessageSender = styled.span`
  font-weight: bold;
  color: #4fc3f7;
`;

const MessageText = styled.span`
  margin-left: 8px;
`;

const MessageTime = styled.span`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin-left: 8px;
`;

const InputContainer = styled.div`
  display: flex;
  gap: 8px;
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

const SendButton = styled(Button)`
  background-color: #4fc3f7;
  color: white;

  &:hover {
    background-color: #29b6f6;
  }
`;

const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, onClose, participants, currentUserName }) => {
  const [inputText, setInputText] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim(), isPrivate ? 'private' : 'public', isPrivate ? selectedRecipient : undefined);
      setInputText('');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <Sidebar>
      <Header>
        <Typography variant="h6">Chat</Typography>
        <CloseButton onClick={onClose}>×</CloseButton>
      </Header>
      <MessagesContainer>
        <List>
          {messages.map((message) => (
            <MessageItem key={message.id}>
              <ListItemText
                primary={
                  <>
                    <MessageSender>{message.sender}:</MessageSender>
                    {message.type === 'private' && (
                      <span style={{ color: '#ff9800', fontSize: '0.75rem', marginLeft: '4px' }}>
                        (Private to {message.recipient})
                      </span>
                    )}
                    <MessageText>{message.text}</MessageText>
                    <MessageTime>
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </MessageTime>
                  </>
                }
              />
            </MessageItem>
          ))}
        </List>
        <div ref={messagesEndRef} />
      </MessagesContainer>
      <div style={{ marginBottom: '16px' }}>
        <FormControlLabel
          control={
            <Switch
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              color="primary"
            />
          }
          label="Private Message"
          style={{ color: 'white' }}
        />
        {isPrivate && (
          <FormControl fullWidth size="small" style={{ marginTop: '8px' }}>
            <InputLabel style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Recipient</InputLabel>
            <Select
              value={selectedRecipient}
              onChange={(e) => setSelectedRecipient(e.target.value)}
              style={{ color: 'white', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              label="Recipient"
            >
              {Array.from(participants.values())
                .filter(p => p.name !== currentUserName)
                .map((participant) => (
                  <MenuItem key={participant.id} value={participant.name}>
                    {participant.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        )}
      </div>
      <InputContainer>
        <StyledTextField
          variant="outlined"
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          size="small"
        />
        <SendButton
          variant="contained"
          onClick={handleSend}
          disabled={!inputText.trim()}
        >
          <SendIcon />
        </SendButton>
      </InputContainer>
    </Sidebar>
  );
};

export default Chat;
