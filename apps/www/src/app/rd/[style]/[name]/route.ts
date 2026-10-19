import { createRegistryResponse } from '@/lib/registry-response';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string; style: string }> }
) {
  const { name, style } = await params;
  const payload = await createRegistryResponse({
    directory: 'rd',
    fileName: name,
    origin: new URL(request.url).origin,
    style,
  });

  if (!payload) return new Response('Not found', { status: 404 });

  return Response.json(payload, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
