import { NextResponse } from 'next/server';

import { plateInitRegistryItem } from '@/lib/plate-init';

export function GET() {
  return NextResponse.json(plateInitRegistryItem);
}
