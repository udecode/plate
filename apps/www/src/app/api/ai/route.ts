import { NextResponse } from 'next/server';

import { fakeStreamText } from './fakeStreamText';

function createStreamResponse(stream: ReadableStream) {
  return new NextResponse(stream, {
    headers: {
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Content-Type': 'text/event-stream',
      'X-Accel-Buffering': 'no',
    },
  });
}

export function POST() {
  return createStreamResponse(fakeStreamText({ streamProtocol: 'data' }));
}
