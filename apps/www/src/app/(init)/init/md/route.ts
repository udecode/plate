import { buildPlateInitInstructions } from '@/lib/plate-init';

export function GET() {
  return new Response(buildPlateInitInstructions(), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}
