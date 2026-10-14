import { appendFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

import { NextResponse } from 'next/server';

import { driveDirectory } from '@/lib/drive-directory';

type Visit = {
  errors: string[];
  frame: boolean;
  path: string;
  rendered?: number;
  sent: number;
  theme: 'dark' | 'light';
  webdriver: boolean;
  width: number;
};

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

function parseVisit(body: unknown, receipt: number): Visit | null {
  if (typeof body !== 'object' || body === null) return null;
  const visit = body as Record<string, unknown>;
  const { errors } = visit;

  if (
    !Array.isArray(errors) ||
    !errors.every((error) => typeof error === 'string') ||
    typeof visit.frame !== 'boolean' ||
    typeof visit.path !== 'string' ||
    (visit.rendered !== undefined &&
      (!isNumber(visit.rendered) || visit.rendered > receipt)) ||
    !isNumber(visit.sent) ||
    (visit.theme !== 'dark' && visit.theme !== 'light') ||
    typeof visit.webdriver !== 'boolean' ||
    !isNumber(visit.width)
  ) {
    return null;
  }

  return {
    errors,
    frame: visit.frame,
    path: visit.path,
    rendered: visit.rendered,
    sent: visit.sent,
    theme: visit.theme,
    webdriver: visit.webdriver,
    width: visit.width,
  };
}

export async function POST(request: Request) {
  const dir = driveDirectory();
  if (!dir) return new NextResponse(null, { status: 404 });

  const receipt = Date.now();
  const visit = parseVisit(await request.json().catch(() => null), receipt);
  if (!visit) return new NextResponse(null, { status: 400 });

  mkdirSync(dir, { recursive: true });
  appendFileSync(
    path.join(dir, 'visits.jsonl'),
    `${JSON.stringify({ at: new Date(receipt).toISOString(), ...visit })}\n`
  );

  return new NextResponse(null, { status: 204 });
}
