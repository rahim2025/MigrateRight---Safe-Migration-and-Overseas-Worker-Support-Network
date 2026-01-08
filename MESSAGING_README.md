# 💬 MigrateRight Messaging System

## Overview

Real-time messaging system enabling direct communication between workers/migrants and recruitment agencies.

---

## ✨ Features

### 🔥 Real-time Messaging
- Instant message delivery via Socket.io
- Typing indicators
- Read receipts  
- Connection status indicator
- Auto-scroll to new messages

### 📱 User Experience
- Clean, modern chat interface
- Conversation list with previews
- Unread message badges
- Date-grouped messages
- Responsive mobile design
- Loading & error states

### 🔒 Security
- JWT authentication required
- Role-based access control
- Private conversations only
- Secure WebSocket connections

---

## 🚀 Quick Start

### Start a Conversation
1. Browse agencies at `/agencies`
2. Click **"Message Agency"** button
3. Start chatting!

### Access Messages
Navigate to `/messages` to view all your conversations

---

## 🛠️ Technical Stack

### Backend
- **Node.js** + Express
- **Socket.io** for real-time
- **MongoDB** for storage
- **JWT** for authentication

### Frontend
- **React** + Vite
- **Socket.io-client**
- **React Router** for navigation
- **Context API** for state

---

## 📁 Project Structure

```
backend/
├── models/
│   ├── Message.js
│   └── Conversation.js
├── controllers/
│   └── message.controller.js
├── routes/
│   └── message.routes.js
└── config/
    └── socket.js

frontend/
├── pages/Messages/
│   ├── Messages.jsx
│   └── Messages.css
├── services/
│   └── messageService.js
└── context/
    └── SocketContext.jsx
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/messages/conversations/:agencyId` | Start conversation |
| GET | `/api/messages/conversations` | Get all conversations |
| GET | `/api/messages/conversations/:id/messages` | Get messages |
| POST | `/api/messages/send` | Send message |
| GET | `/api/messages/unread-count` | Get unread count |

---

## 🎨 UI Components

### Messages Page
- **Sidebar**: Conversation list with search
- **Main Area**: Message thread with input
- **Header**: Participant info and actions

### Message Card
- Gradient design for sent messages (purple)
- Gray background for received messages
- Timestamps and read status
- Avatar icons for participants

---

## 🧪 Testing

Run these tests before deployment:

```bash
# Backend tests
npm test

# Frontend tests
cd frontend && npm test

# Integration tests
npm run test:e2e
```

### Manual Testing Checklist
- [ ] User can message agency
- [ ] Real-time updates work
- [ ] Typing indicators display
- [ ] Read receipts update
- [ ] Unread counts accurate
- [ ] Mobile responsive
- [ ] Error handling works

---

## 📖 Documentation

- [Implementation Guide](./docs/MESSAGING_SYSTEM_IMPLEMENTATION.md)
- [Quick Start Guide](./docs/MESSAGING_QUICK_START.md)
- [Implementation Summary](./MESSAGING_IMPLEMENTATION_SUMMARY.md)

---

## 🔮 Roadmap

### Coming Soon
- [ ] File attachments
- [ ] Message search
- [ ] Export conversations
- [ ] Voice messages
- [ ] Video calls

---

## 🐛 Troubleshooting

### Messages not appearing?
1. Check internet connection
2. Verify green connection indicator (●)
3. Refresh page
4. Log out and back in

### Can't send messages?
1. Ensure you're logged in
2. Check recipient is an agency
3. Verify message isn't empty
4. Try refreshing the page

---

## 📞 Support

Need help? 
- Check [Quick Start Guide](./docs/MESSAGING_QUICK_START.md)
- View [Implementation Details](./docs/MESSAGING_SYSTEM_IMPLEMENTATION.md)
- Contact support team

---

## 📄 License

Part of MigrateRight Platform - Safe Migration & Overseas Worker Support Network

---

**Built with ❤️ for safer migration**
