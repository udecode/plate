const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = escapeXml(searchParams.get('title') || 'Plate');
  const description = escapeXml(searchParams.get('description') || '');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="628" viewBox="0 0 1200 628" role="img" aria-label="${title}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b0b0b" />
      <stop offset="100%" stop-color="#111827" />
    </linearGradient>
  </defs>
  <rect width="1200" height="628" fill="url(#bg)" />
  <rect x="64" y="64" width="1072" height="500" fill="none" stroke="#334155" stroke-width="2" />
  <text x="120" y="240" fill="#f8fafc" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto" font-size="72" font-weight="700">${title}</text>
  <text x="120" y="340" fill="#cbd5f5" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto" font-size="36" font-weight="500">${description}</text>
</svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
