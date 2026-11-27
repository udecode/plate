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
  const apiKey = typeof key === 'string' ? key.trim() : '';

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
  } catch {
    return NextResponse.json(
      { error: 'Failed to digitize ink marks.' },
      { status: 500 }
    );
  }
}
