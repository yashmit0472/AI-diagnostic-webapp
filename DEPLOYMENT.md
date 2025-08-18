# 🚀 Deployment Guide

## Local Development

### Option 1: Run Everything Together
```bash
./run_app.sh
```

### Option 2: Run Separately
```bash
# Terminal 1 - Backend
./run_backend.sh

# Terminal 2 - Frontend  
./run_frontend.sh
```

## Cloud Deployment

### 1. Vercel (Recommended)
```bash
npm i -g vercel
vercel --prod
```

### 2. Heroku
```bash
heroku create your-app-name
git push heroku main
```

### 3. Docker
```bash
docker build -t ai-diagnostic .
docker run -p 5000:5000 ai-diagnostic
```

### 4. Netlify
- Deploy frontend: Drag `frontend/public` folder to Netlify
- Deploy backend: Use Netlify Functions or external service

## Environment Variables

Set these if needed:
- `FLASK_ENV=production`
- `PORT=5000`

## Health Check

Visit these URLs after deployment:
- Frontend: `https://your-domain.com`
- Backend: `https://your-domain.com/api/health`
