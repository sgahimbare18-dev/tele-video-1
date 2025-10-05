# Deployment Instructions for Tele-Video App

This document provides step-by-step instructions to deploy the Tele-Video App frontend and backend signaling server.

---

## Frontend Deployment (React App)

### 1. Build the React App for Production

In the `tele-video-app` directory, run:

```bash
npm run build
```

This will create an optimized production build in the `build` folder.

### 2. Choose a Hosting Platform

You can host the frontend on platforms like:

- Vercel
- Netlify
- GitHub Pages
- Any static file hosting service

### 3. Deploy to Vercel (Recommended)

1. Sign up for a Vercel account at https://vercel.com
2. Install Vercel CLI: `npm install -g vercel`
3. In the `tele-video-app` directory, run: `vercel`
4. Follow the prompts to deploy
5. Set environment variable: `REACT_APP_SOCKET_SERVER_URL=https://your-backend-url.com`

### 4. Deploy to Netlify

1. Sign up for a Netlify account at https://netlify.com
2. Drag and drop the `build` folder to the Netlify dashboard
3. Set environment variable in Netlify dashboard: `REACT_APP_SOCKET_SERVER_URL=https://your-backend-url.com`

---

## Backend Deployment (Socket.IO Signaling Server)

### 1. Prepare the Server

The backend is in the `server` directory.

Install dependencies:

```bash
cd server
npm install
```

### 2. Deploy to Heroku

1. Sign up for Heroku at https://heroku.com
2. Install Heroku CLI
3. In the `server` directory:
   ```bash
   heroku create your-app-name
   git init
   git add .
   git commit -m "Initial commit"
   heroku git:remote -a your-app-name
   git push heroku main
   ```
4. The server will be running at `https://your-app-name.herokuapp.com`

### 3. Deploy to Railway

1. Sign up for Railway at https://railway.app
2. Connect your GitHub repo or deploy manually
3. Railway will auto-detect Node.js and deploy
4. Get the deployment URL

### 4. Other Options

- DigitalOcean App Platform
- AWS Elastic Beanstalk
- Google Cloud Run

---

## Environment Configuration

### Frontend (.env file in tele-video-app)

Create `.env` file:

```
REACT_APP_SOCKET_SERVER_URL=https://your-backend-deployment-url.com
```

### Backend (Environment Variables)

Set in your hosting platform:

- `PORT` (usually auto-set by platform)

---

## Testing the Deployment

1. Open the frontend URL
2. Create a room
3. Open another browser/incognito window
4. Join the same room
5. Test video/audio sharing

---

## Troubleshooting

- Ensure CORS is configured correctly on the backend
- Check that the signaling server URL is correct
- Verify that ports are open (5000 for dev, platform-assigned for prod)
- Check browser console for WebRTC errors

---

## Security Considerations

- Use HTTPS in production
- Implement authentication if needed
- Rate limiting on the signaling server
- Validate room IDs and user inputs
