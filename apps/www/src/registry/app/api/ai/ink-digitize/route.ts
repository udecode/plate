import { createGateway } from '@ai-sdk/gateway';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import {
  DEFAULT_INK_DIGITIZE_MODEL,
  inkDigitizeRequestSchema,
  runInkDigitize,
} from './ink-digitize-route';

export async function POST(req: NextRequest) {
  let raw: unknown;

  try {
    raw = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON request body.' },
      { status: 400 }
    );
  }

  const key =
    typeof raw === 'object' && raw !== null && 'apiKey' in raw
      ? (raw as { apiKey?: unknown }).apiKey
      : undefined;
  const apiKey =
    (typeof key === 'string' ? key.trim() : '') ||
    process.env.AI_GATEWAY_API_KEY?.trim() ||
    '';

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing AI Gateway API key.' },
      { status: 401 }
    );
  }

  const parsed = inkDigitizeRequestSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid ink digitize request.' },
      { status: 400 }
    );
  }

  const gatewayProvider = createGateway({ apiKey });
  const model = gatewayProvider(
    parsed.data.model ?? DEFAULT_INK_DIGITIZE_MODEL
  );

  try {
    const result = await runInkDigitize(parsed.data, model);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 422 });
    }

    return NextResponse.json(result.reading);
  } catch (error) {
    const statusCandidate =
      typeof error === 'object' && error !== null && 'statusCode' in error
        ? (error as { statusCode?: unknown }).statusCode
        : undefined;
    const status =
      typeof statusCandidate === 'number' &&
      statusCandidate >= 400 &&
      statusCandidate <= 599
        ? statusCandidate
        : 500;
    const message =
      error instanceof Error && error.message.trim().length > 0
        ? error.message
        : 'Failed to digitize ink marks.';

    return NextResponse.json({ error: message }, { status });
  }
}
