import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const sendMessageSchema = z.object({
  to: z.string().min(1, 'Recipient number is required'),
  message: z.string().min(1, 'Message content is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, message } = sendMessageSchema.parse(body);

    // Save message to database
    const savedMessage = await db.message.create({
      data: {
        fromJid: 'bot',
        toJid: to,
        body: message,
        direction: 'out',
      },
    });

    // In demo mode, simulate sending
    console.log(`📤 Simulating sending message to ${to}: ${message}`);
    
    // Simulate a response after 2 seconds
    setTimeout(async () => {
      const responseMessage = await db.message.create({
        data: {
          fromJid: to,
          toJid: 'bot',
          body: `Auto-reply: Thank you for your message "${message}". This is a demo response.`,
          direction: 'in',
        },
      });

      // Emit socket event for real-time update
      try {
        const { Server } = require('socket.io');
        const io = new Server();
        io.emit('newMessage', {
          id: responseMessage.id,
          from: responseMessage.fromJid,
          body: responseMessage.body,
          direction: responseMessage.direction,
          createdAt: responseMessage.createdAt,
        });
      } catch (error) {
        console.log('Socket emission failed:', error);
      }
    }, 2000);

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully (demo mode)',
      data: {
        id: savedMessage.id,
        to: savedMessage.toJid,
        body: savedMessage.body,
        timestamp: savedMessage.createdAt,
      },
    });

  } catch (error) {
    console.error('Error sending message:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}