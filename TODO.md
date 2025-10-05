# Tele Video App Feature Implementation TODO

## 1. Upgrade Message Button for Private/Public Messages
- [x] Update Message interface in VideoContext.tsx to include `type: 'public' | 'private'` and `recipient?: string`
- [x] Modify Chat.tsx to add a toggle switch for message type (Public/Private)
- [x] Add recipient selector dropdown in Chat.tsx when private mode is selected
- [x] Update sendMessage function in VideoContext.tsx to handle private messages (emit to specific user via socket)
- [x] Add socket event listener for private messages in VideoContext.tsx
- [x] Update message display in Chat.tsx to show private indicators

## 2. Implement Meeting Invite Feature
- [x] Add invite button to Controls.tsx
- [x] Create invite modal/component with room link generation
- [x] Add inviteUser function in VideoContext.tsx to handle invites
- [x] Update ParticipantsList.tsx to include invite option for each participant
- [x] Implement invite link sharing functionality (copy to clipboard)

## 3. Implement Meeting Recording with Admin Permissions
- [x] Add recording state to VideoContext.tsx: `recordingEnabled: Map<string, boolean>`, `isRecording: boolean`
- [x] Add grantRecordingPermission and revokeRecordingPermission functions in VideoContext.tsx
- [x] Update AdminPanel.tsx to include recording permissions section with user list and grant/revoke buttons
- [x] Add recording button to Controls.tsx, visible to all but enabled only if user has permission
- [x] Implement recording logic using MediaRecorder API in VideoContext.tsx
- [x] Add startRecording and stopRecording functions
- [x] Handle recording of local stream and option to record all participants
- [x] Add socket events for recording permissions and status updates

## 4. Testing and Integration
- [ ] Test private messaging functionality
- [ ] Test meeting invite feature
- [ ] Test recording permissions and functionality
- [ ] Ensure all new features work with existing WebRTC and socket infrastructure
- [ ] Update UI components for consistency and responsiveness

## 5. Sign Language Interpreter Integration
- [x] Install Three.js dependencies (@react-three/fiber, @react-three/drei, three)
- [ ] Add speech recognition state to VideoContext (interpreterEnabled, transcribedText)
- [ ] Implement Web Speech API in VideoContext for continuous speech recognition
- [ ] Create SignLanguageInterpreter component with 3D scene
- [ ] Add basic sign language animations/models for letters/words
- [ ] Add interpreter toggle button in Controls.tsx
- [ ] Integrate SignLanguageInterpreter in Room.tsx
- [ ] Test speech recognition accuracy
- [ ] Test real-time performance during video calls
- [ ] Optimize 3D animations for performance

## 6. Deployment
- [x] Create Socket.IO signaling server (server.js and package.json)
- [x] Create deployment instructions (DEPLOYMENT.md)
- [x] Build React app for production (`npm run build`)
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Deploy backend to Heroku/Railway
- [ ] Configure production environment variables
- [ ] Test deployed application
- [ ] Update README.md with deployment info
