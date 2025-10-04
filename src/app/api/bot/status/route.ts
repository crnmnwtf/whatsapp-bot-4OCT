import { NextResponse } from 'next/server';
import { isBotInitialized } from '@/lib/whatsapp';

export async function GET() {
  try {
    const status = {
      initialized: isBotInitialized(),
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(status);
  } catch (error) {
    console.error('Failed to get bot status:', error);
    return NextResponse.json(
      { error: 'Failed to get bot status' },
      { status: 500 }
    );
  }
}