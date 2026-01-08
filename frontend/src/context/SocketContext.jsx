import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    // Only connect if user is authenticated
    if (user && token) {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const newSocket = io(API_URL, {
        auth: {
          token: token,
        },
        transports: ['websocket', 'polling'],
      });

      newSocket.on('connect', () => {
        console.log('✅ Socket connected:', newSocket.id);
        setConnected(true);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnected(false);
      });

      setSocket(newSocket);

      // Cleanup on unmount or when user changes
      return () => {
        console.log('🔌 Disconnecting socket');
        newSocket.disconnect();
      };
    } else {
      // Disconnect if user logs out
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
    }
  }, [user, token]);

  const joinConversation = (conversationId) => {
    if (socket && connected) {
      socket.emit('join_conversation', conversationId);
    }
  };

  const leaveConversation = (conversationId) => {
    if (socket && connected) {
      socket.emit('leave_conversation', conversationId);
    }
  };

  const sendTyping = (conversationId, receiverId) => {
    if (socket && connected) {
      socket.emit('typing', { conversationId, receiverId });
    }
  };

  const sendStopTyping = (conversationId, receiverId) => {
    if (socket && connected) {
      socket.emit('stop_typing', { conversationId, receiverId });
    }
  };

  const sendMessageRead = (messageId, senderId) => {
    if (socket && connected) {
      socket.emit('message_read', { messageId, senderId });
    }
  };

  const value = {
    socket,
    connected,
    joinConversation,
    leaveConversation,
    sendTyping,
    sendStopTyping,
    sendMessageRead,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export default SocketContext;
