import { cacheLife } from 'next/cache';
import { z } from 'zod';

import {
  type PlateCreateConfig,
  readPlateCreateConfig,
} from '@/lib/plate-create';

const SHADCN_URL = 'https://ui.shadcn.com';

const StyleTagValueSchema = z.string().regex(/^[^;{}<>]*$/);
const CssVarsSchema = z.record(
  z.string().regex(/^(?:--)?[a-z0-9-]+$/),
  StyleTagValueSchema
);

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
    dependency: z.string().regex(/^@fontsource(?:-variable)?\/[a-z0-9-]+$/),
    family: StyleTagValueSchema,
    variable: z.string().regex(/^--font-[a-z]+$/),
  }),
});

export type PlateCreateTheme = Awaited<ReturnType<typeof getPlateCreateTheme>>;

export async function getPlateCreateTheme(
  base: PlateCreateConfig['base'],
  preset: string
) {
  'use cache';
  cacheLife('days');

  const config = readPlateCreateConfig({ base, preset });
  const init = InitSchema.parse(
    await fetchJson(`${SHADCN_URL}/init?${getInitParams(config, preset)}`)
  );
  const fetchFont = async (name: string) =>
    FontItemSchema.parse(
      await fetchJson(
        `${SHADCN_URL}/r/styles/${config.base}-${config.style}/${name}.json`
      )
    ).font;
  const fonts = await Promise.all(
    init.registryDependencies
      .filter((name) => /^font-[a-z0-9-]+$/.test(name))
      .map(fetchFont)
  );
  // shadcn's Next template loads Geist Mono as --font-mono, and only a mono
  // body font replaces it.
  const monoFont = fonts.some(({ variable }) => variable === '--font-mono')
    ? null
    : await fetchFont('font-geist-mono');

  return { cssVars: init.cssVars, fonts, monoFont };
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
