import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import messageService from '../../services/messageService';
import './Messages.css';

const Messages = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, connected, joinConversation, leaveConversation, sendTyping, sendStopTyping } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
      setSelectedConversation(conversationId);
    }
  }, [conversationId]);

  // Socket listener for new messages - handles both conversation updates and message display
  useEffect(() => {
    if (socket && connected) {
      // Listen for new messages
      const handleNewMessage = (data) => {
        console.log('📨 New message received:', data);
        
        // Always update conversation list when a new message arrives
        loadConversations();
        
        // If the message is for the currently selected conversation, add it to the messages
        if (selectedConversation && data.message.conversationId === selectedConversation) {
          setMessages((prev) => [...prev, data.message]);
          scrollToBottom();
        }
      };

      // Listen for typing indicators
      const handleTyping = (data) => {
        if (selectedConversation && data.conversationId === selectedConversation) {
          setTypingUsers((prev) => new Set([...prev, data.userId]));
        }
      };

      const handleStopTyping = (data) => {
        if (selectedConversation && data.conversationId === selectedConversation) {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(data.userId);
            return newSet;
          });
        }
      };

      socket.on('new_message', handleNewMessage);
      socket.on('user_typing', handleTyping);
      socket.on('user_stop_typing', handleStopTyping);

      return () => {
        socket.off('new_message', handleNewMessage);
        socket.off('user_typing', handleTyping);
        socket.off('user_stop_typing', handleStopTyping);
      };
    }
  }, [socket, connected, selectedConversation]);

  // Join/leave conversation rooms
  useEffect(() => {
    if (selectedConversation && socket && connected) {
      joinConversation(selectedConversation);
      return () => {
        leaveConversation(selectedConversation);
      };
    }
  }, [selectedConversation, socket, connected]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      const { conversations } = await messageService.getConversations();
      setConversations(conversations);
      setError(null);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (convId) => {
    try {
      setLoading(true);
      const { messages } = await messageService.getMessages(convId);
      setMessages(messages);
      setError(null);
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = (convId) => {
    navigate(`/messages/${convId}`);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    try {
      setSending(true);
      const conversation = conversations.find((c) => c._id === selectedConversation);
      if (!conversation) return;

      const receiver = conversation.participants.find(
        (p) => p.userId._id !== user.id
      );

      if (!receiver) return;

      const { message } = await messageService.sendMessage({
        conversationId: selectedConversation,
        message: newMessage.trim(),
        receiverId: receiver.userId._id,
      });

      // Message will be added via socket event
      setNewMessage('');
      
      // Stop typing indicator
      if (connected) {
        sendStopTyping(selectedConversation, receiver.userId._id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (!selectedConversation || !connected) return;

    const conversation = conversations.find((c) => c._id === selectedConversation);
    if (!conversation) return;

    const receiver = conversation.participants.find(
      (p) => p.userId._id !== user.id
    );

    if (!receiver) return;

    sendTyping(selectedConversation, receiver.userId._id);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      sendStopTyping(selectedConversation, receiver.userId._id);
    }, 2000);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find((p) => p.userId._id !== user.id)?.userId;
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="messages-page">
        <div className="loading">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="messages-page">
      <div className="messages-container">
        {/* Conversations Sidebar */}
        <div className="messages-sidebar">
          <div className="sidebar-header">
            <h2>Messages</h2>
            <span className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
              {connected ? '●' : '○'}
            </span>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="conversations-list">
            {conversations.length === 0 ? (
              <div className="no-conversations">
                <p>No conversations yet</p>
                <p className="hint">Start messaging agencies to see your conversations here</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const otherParticipant = getOtherParticipant(conv);
                const isSelected = selectedConversation === conv._id;

                return (
                  <div
                    key={conv._id}
                    className={`conversation-item ${isSelected ? 'active' : ''}`}
                    onClick={() => handleConversationClick(conv._id)}
                  >
                    <div className="conversation-avatar">
                      {otherParticipant?.profileImage ? (
                        <img src={otherParticipant.profileImage} alt="" />
                      ) : (
                        <div className="avatar-placeholder">
                          {otherParticipant?.fullName?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    <div className="conversation-info">
                      <div className="conversation-header">
                        <h4>{otherParticipant?.fullName || 'Unknown'}</h4>
                        {conv.lastMessage?.createdAt && (
                          <span className="conversation-time">
                            {formatDate(conv.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <p className="last-message">
                        {conv.lastMessage?.message || 'No messages yet'}
                      </p>
                    </div>
                    {conv.myUnreadCount > 0 && (
                      <span className="unread-badge">{conv.myUnreadCount}</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Messages Content */}
        <div className="messages-content">
          {selectedConversation ? (
            <>
              {/* Messages Header */}
              <div className="messages-header">
                {(() => {
                  const conversation = conversations.find((c) => c._id === selectedConversation);
                  const otherParticipant = conversation ? getOtherParticipant(conversation) : null;
                  
                  return (
                    <>
                      <div className="header-participant">
                        <div className="participant-avatar">
                          {otherParticipant?.profileImage ? (
                            <img src={otherParticipant.profileImage} alt="" />
                          ) : (
                            <div className="avatar-placeholder">
                              {otherParticipant?.fullName?.charAt(0) || '?'}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3>{otherParticipant?.fullName || 'Unknown'}</h3>
                          <p className="participant-role">{otherParticipant?.role || ''}</p>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Messages List */}
              <div className="messages-list">
                {loading ? (
                  <div className="loading">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="no-messages">
                    <p>No messages yet</p>
                    <p className="hint">Start the conversation by sending a message</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, index) => {
                      const isSent = msg.senderId._id === user.id;
                      const showDate =
                        index === 0 ||
                        formatDate(msg.createdAt) !== formatDate(messages[index - 1].createdAt);

                      return (
                        <React.Fragment key={msg._id}>
                          {showDate && (
                            <div className="message-date">{formatDate(msg.createdAt)}</div>
                          )}
                          <div className={`message ${isSent ? 'sent' : 'received'}`}>
                            <div className="message-content">
                              <p>{msg.message}</p>
                              <span className="message-time">{formatTime(msg.createdAt)}</span>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                    {typingUsers.size > 0 && (
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="message-input-form">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  placeholder="Type your message..."
                  className="message-input"
                  disabled={sending}
                />
                <button type="submit" className="send-button" disabled={!newMessage.trim() || sending}>
                  <i className="fas fa-paper-plane"></i>
                </button>
              </form>
            </>
          ) : (
            <div className="no-conversation-selected">
              <i className="fas fa-comments"></i>
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
