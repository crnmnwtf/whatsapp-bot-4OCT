import { Server } from 'socket.io';
import { sendMessage, onIncomingMessage, isBotInitialized, takeScreenshot, getDemoMode, checkWhatsAppStatus, getActiveChats } from './whatsapp';
import { db } from './db';

export const setupSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);
    
    // Handle WhatsApp message sending
    socket.on('send_message', async ({ number, message }: { number: string; message: string }) => {
      try {
        if (!isBotInitialized()) {
          socket.emit('error_send', { error: 'WhatsApp bot not initialized' });
          return;
        }

        console.log(`📤 Socket: Sending message to ${number}`);
        await sendMessage(number, message);
        
        // Store message in database
        await db.message.create({
          data: {
            fromJid: 'bot',
            toJid: number,
            body: message,
            direction: 'out'
          }
        });

        socket.emit('message_sent', { number, message, timestamp: new Date().toISOString() });
        
        // Broadcast to all connected clients
        io.emit('message_broadcast', {
          from: 'bot',
          to: number,
          body: message,
          direction: 'out',
          timestamp: new Date().toISOString()
        });
        
        console.log('✅ Socket: Message sent successfully');
        
      } catch (error) {
        console.error('❌ Socket: Send failed:', error);
        socket.emit('error_send', { error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    // Handle screenshot request
    socket.on('get_screenshot', async () => {
      try {
        if (!isBotInitialized()) {
          socket.emit('error_screenshot', { error: 'WhatsApp bot not initialized' });
          return;
        }
        
        console.log('📸 Socket: Taking screenshot...');
        const screenshot = await takeScreenshot();
        socket.emit('screenshot', { 
          image: `data:image/png;base64,${screenshot}`,
          timestamp: new Date().toISOString()
        });
        console.log('✅ Socket: Screenshot captured');
      } catch (error) {
        console.error('❌ Socket: Screenshot failed:', error);
        socket.emit('error_screenshot', { error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    // Handle bot status request
    socket.on('get_status', async () => {
      try {
        const whatsappStatus = isBotInitialized() ? await checkWhatsAppStatus() : false;
        const activeChats = isBotInitialized() ? await getActiveChats() : [];
        
        socket.emit('status', { 
          initialized: isBotInitialized(),
          demoMode: getDemoMode(),
          whatsappConnected: whatsappStatus,
          activeChats: activeChats,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('❌ Socket: Status check failed:', error);
        socket.emit('status', { 
          initialized: isBotInitialized(),
          demoMode: getDemoMode(),
          whatsappConnected: false,
          activeChats: [],
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle get active chats request
    socket.on('get_chats', async () => {
      try {
        if (!isBotInitialized()) {
          socket.emit('error_chats', { error: 'WhatsApp bot not initialized' });
          return;
        }
        
        console.log('💬 Socket: Getting active chats...');
        const chats = await getActiveChats();
        socket.emit('chats', { 
          chats: chats,
          timestamp: new Date().toISOString()
        });
        console.log(`✅ Socket: Retrieved ${chats.length} active chats`);
      } catch (error) {
        console.error('❌ Socket: Get chats failed:', error);
        socket.emit('error_chats', { error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id);
    });

    // Send welcome message with detailed status
    const welcomeText = getDemoMode() 
      ? '🤖 Welcome to WhatsApp Bot Dashboard! Running in demo mode - features are simulated for demonstration.'
      : '🚀 Welcome to WhatsApp Bot Dashboard! Ready to automate your WhatsApp messages.';
      
    socket.emit('message', {
      text: welcomeText,
      senderId: 'system',
      timestamp: new Date().toISOString(),
    });

    // Send initial status
    socket.emit('status', { 
      initialized: isBotInitialized(),
      demoMode: getDemoMode(),
      timestamp: new Date().toISOString()
    });
  });

  // Set up incoming message handler
  onIncomingMessage(async (msg) => {
    try {
      console.log('📨 Socket: Broadcasting incoming message:', msg);
      
      // Store incoming message in database
      await db.message.create({
        data: {
          fromJid: msg.from,
          toJid: 'bot',
          body: msg.body,
          direction: 'in'
        }
      });

      // Broadcast to all connected clients
      io.emit('incoming_message', {
        ...msg,
        timestamp: new Date().toISOString()
      });
      
      console.log('✅ Socket: Incoming message broadcasted successfully');
    } catch (error) {
      console.error('❌ Socket: Failed to store incoming message:', error);
    }
  });

  console.log('🔌 Socket.io server setup complete');
};