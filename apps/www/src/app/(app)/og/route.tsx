import { ImageResponse } from 'next/og';

async function loadAssets(): Promise<
  { data: Buffer; name: string; style: 'normal'; weight: 400 | 600 }[]
> {
  const [
    { base64Font: normal },
    { base64Font: mono },
    { base64Font: semibold },
  ] = await Promise.all([
    import('./geist-regular-otf.json').then((mod) => mod.default || mod),
    import('./geistmono-regular-otf.json').then((mod) => mod.default || mod),
    import('./geist-semibold-otf.json').then((mod) => mod.default || mod),
  ]);

  return [
    {
      data: Buffer.from(normal, 'base64'),
      name: 'Geist',
      style: 'normal' as const,
      weight: 400 as const,
    },
    {
      data: Buffer.from(mono, 'base64'),
      name: 'Geist Mono',
      style: 'normal' as const,
      weight: 400 as const,
    },
    {
      data: Buffer.from(semibold, 'base64'),
      name: 'Geist',
      style: 'normal' as const,
      weight: 600 as const,
    },
  ];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');
  const description = searchParams.get('description');

  // eslint-disable-next-line unicorn/no-single-promise-in-promise-methods
  const [fonts] = await Promise.all([loadAssets()]);

  return new ImageResponse(
    (
      <div
        style={{ fontFamily: 'Geist Sans' }}
        tw="flex h-full w-full bg-black text-white"
      >
        <div tw="flex border absolute border-stone-700 border-dashed inset-y-0 left-16 w-[1px]" />
        <div tw="flex border absolute border-stone-700 border-dashed inset-y-0 right-16 w-[1px]" />
        <div tw="flex border absolute border-stone-700 inset-x-0 h-[1px] top-16" />
        <div tw="flex border absolute border-stone-700 inset-x-0 h-[1px] bottom-16" />
        <div tw="flex absolute flex-row bottom-24 right-24 text-white">
          <svg
            fill="none"
            height={48}
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width={48}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M5 12h14"></path>
          </svg>
        </div>
        <div tw="flex flex-col absolute w-[896px] justify-center inset-32">
          <div
            style={{
              fontSize: title && title.length > 20 ? 64 : 80,
              fontWeight: 600,
              letterSpacing: '-0.04em',
              textWrap: 'balance',
            }}
            tw="tracking-tight flex-grow-1 flex flex-col justify-center leading-[1.1]"
          >
            {title}
          </div>
          <div
            style={{
              fontWeight: 500,
              textWrap: 'balance',
            }}
            tw="text-[40px] leading-[1.5] flex-grow-1 text-stone-400"
          >
            {description}
          </div>
        </div>
      </div>
    ),
    {
      fonts,
      height: 628,
      width: 1200,
    }
  );
}
