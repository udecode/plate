import { cacheLife } from 'next/cache';
import { z } from 'zod';

import {
  getPlateCreatePreset,
  type PlateCreateConfig,
  readPlateCreateConfig,
} from '@/lib/plate-create';

const SHADCN_URL = 'https://ui.shadcn.com';

const CssVarsSchema = z.record(z.string(), z.string());

const InitSchema = z.object({
  cssVars: z.object({
    dark: CssVarsSchema,
    light: CssVarsSchema,
    theme: CssVarsSchema.optional(),
  }),
  registryDependencies: z.array(z.string()).default([]),
});

const FontItemSchema = z.object({
  font: z.object({
    dependency: z.string(),
    family: z.string(),
    variable: z.string(),
  }),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const config = readPlateCreateConfig({
    base: searchParams.get('base'),
    preset: searchParams.get('preset'),
  });

  try {
    return Response.json(
      await getCreateTheme(config.base, getPlateCreatePreset(config)),
      { headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' } }
    );
  } catch (error) {
    return Response.json(
      {
        error: `shadcn's theme service did not answer: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 502 }
    );
  }
}

async function getCreateTheme(base: PlateCreateConfig['base'], preset: string) {
  'use cache';
  cacheLife('days');

  const config = readPlateCreateConfig({ base, preset });
  const init = InitSchema.parse(
    await fetchJson(`${SHADCN_URL}/init?${getInitParams(config, preset)}`)
  );
  const fonts = await Promise.all(
    init.registryDependencies
      .filter((name) => /^font-[a-z0-9-]+$/.test(name))
      .map(
        async (name) =>
          FontItemSchema.parse(
            await fetchJson(
              `${SHADCN_URL}/r/styles/${config.base}-${config.style}/${name}.json`
            )
          ).font
      )
  );

  return { cssVars: init.cssVars, fonts };
}

// The query shadcn's CLI sends for `create --preset`, without `track`, so a
// preview is not counted as an install.
function getInitParams(config: PlateCreateConfig, preset: string) {
  const params = new URLSearchParams({
    base: config.base,
    style: config.style,
    baseColor: config.baseColor,
    theme: config.theme,
    iconLibrary: config.iconLibrary,
    font: config.font,
    rtl: 'false',
    menuAccent: config.menuAccent,
    menuColor: config.menuColor,
    radius: config.radius,
  });

  if (config.chartColor && config.chartColor !== 'neutral') {
    params.set('chartColor', config.chartColor);
  }
  if (config.fontHeading !== 'inherit') {
    params.set('fontHeading', config.fontHeading);
  }

  params.set('preset', preset);

  return params;
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, { next: { revalidate: 86_400 } });

  if (!response.ok) {
    throw new Error(`${url} answered ${response.status}`);
  }

  return response.json();
}
