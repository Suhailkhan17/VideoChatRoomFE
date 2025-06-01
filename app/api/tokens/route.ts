
import { NextRequest, NextResponse } from 'next/server';
import { createToken } from '@/livekit';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roomName = searchParams.get('roomName');
  const userName = searchParams.get('userName');

  if (!roomName || !userName) {
    return NextResponse.json({ error: 'Missing roomName or userName' }, { status: 400 });
  }

  const token = createToken(roomName, userName);
  return NextResponse.json({ token });
}