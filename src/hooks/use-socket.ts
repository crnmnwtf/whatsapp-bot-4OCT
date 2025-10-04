'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  from: string;
  body: string;
  timestamp?: string;
  direction?: 'in' | 'out';
}

interface ChatInfo {
  name: string;
  lastMessage: string;
}

interface SocketState {
  connected: boolean;
  messages: Message[];
  status: { 
    initialized: boolean; 
    demoMode?: boolean;
    whatsappConnected?: boolean;
    activeChats?: ChatInfo[];
    error?: string;
    timestamp?: string;
  } | null;
  screenshot: string | null;
  error: string | null;
  chats: ChatInfo[];
}

export function useSocket() {
  const [state, setState] = useState<SocketState>({
    connected: false,
    messages: [],
    status: null,
    screenshot: null,
    error: null,
    chats: []
  });

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const socket = io('/', {
      path: '/api/socketio',
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to server');
      setState(prev => ({ ...prev, connected: true }));
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setState(prev => ({ ...prev, connected: false }));
    });

    // WhatsApp events
    socket.on('message_sent', (data: { number: string; message: string; timestamp?: string }) => {
      setState(prev => ({
        ...prev,
        messages: [
          {
            from: 'bot',
            body: `Sent to ${data.number}: ${data.message}`,
            timestamp: data.timestamp || new Date().toISOString(),
            direction: 'out'
          },
          ...prev.messages
        ]
      }));
    });

    socket.on('incoming_message', (msg: Message) => {
      setState(prev => ({
        ...prev,
        messages: [msg, ...prev.messages]
      }));
    });

    socket.on('message_broadcast', (msg: Message) => {
      setState(prev => ({
        ...prev,
        messages: [msg, ...prev.messages]
      }));
    });

    socket.on('status', (status: SocketState['status']) => {
      setState(prev => ({ 
        ...prev, 
        status,
        chats: status?.activeChats || prev.chats
      }));
    });

    socket.on('chats', (data: { chats: ChatInfo[]; timestamp: string }) => {
      setState(prev => ({ 
        ...prev, 
        chats: data.chats
      }));
    });

    socket.on('screenshot', (data: { image: string; timestamp?: string }) => {
      setState(prev => ({ ...prev, screenshot: data.image }));
    });

    socket.on('error_send', (error: { error: string }) => {
      setState(prev => ({
        ...prev,
        error: error.error,
        messages: [
          {
            from: 'system',
            body: `Error: ${error.error}`,
            timestamp: new Date().toISOString()
          },
          ...prev.messages
        ]
      }));
    });

    socket.on('error_screenshot', (error: { error: string }) => {
      setState(prev => ({ ...prev, error: error.error }));
    });

    socket.on('error_chats', (error: { error: string }) => {
      setState(prev => ({ ...prev, error: error.error }));
    });

    socket.on('message', (msg: { text: string; senderId: string; timestamp: string }) => {
      setState(prev => ({
        ...prev,
        messages: [
          {
            from: msg.senderId,
            body: msg.text,
            timestamp: msg.timestamp
          },
          ...prev.messages
        ]
      }));
    });

    // Request initial status
    socket.emit('get_status');

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = (number: string, message: string) => {
    if (socketRef.current) {
      socketRef.current.emit('send_message', { number, message });
    }
  };

  const getScreenshot = () => {
    if (socketRef.current) {
      socketRef.current.emit('get_screenshot');
    }
  };

  const getStatus = () => {
    if (socketRef.current) {
      socketRef.current.emit('get_status');
    }
  };

  const getChats = () => {
    if (socketRef.current) {
      socketRef.current.emit('get_chats');
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return {
    ...state,
    sendMessage,
    getScreenshot,
    getStatus,
    getChats,
    clearError
  };
}