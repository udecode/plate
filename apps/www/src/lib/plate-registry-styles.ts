import { PRESET_BASES, PRESET_STYLES } from 'shadcn/preset';

export const PLATE_REGISTRY_BASES = ['base', 'radix'] as const;
export const PLATE_REGISTRY_STYLE_NAMES = [
  'nova',
  'vega',
  'maia',
  'lyra',
  'mira',
  'luma',
  'sera',
  'rhea',
] as const;

export type PlateRegistryBase = (typeof PLATE_REGISTRY_BASES)[number];
export type PlateRegistryStyleName =
  (typeof PLATE_REGISTRY_STYLE_NAMES)[number];
export type PlateRegistryStyle =
  `${PlateRegistryBase}-${PlateRegistryStyleName}`;

export const PLATE_DEFAULT_REGISTRY_BASE: PlateRegistryBase = 'base';
export const PLATE_DEFAULT_REGISTRY_STYLE = 'base-nova';

const REVIEWED_UNSERVED_BASES = new Set(['aria']);

const upstreamDrift: Array<[message: string, names: readonly string[]]> = [
  [
    'Plate registry bases are missing upstream',
    PLATE_REGISTRY_BASES.filter((base) => !PRESET_BASES.includes(base)),
  ],
  [
    'Upstream registry bases require Plate review',
    PRESET_BASES.filter(
      (base) =>
        !PLATE_REGISTRY_BASES.some((served) => served === base) &&
        !REVIEWED_UNSERVED_BASES.has(base)
    ),
  ],
  [
    'Plate registry styles are missing upstream',
    PLATE_REGISTRY_STYLE_NAMES.filter(
      (style) => !PRESET_STYLES.includes(style)
    ),
  ],
  [
    'Upstream registry styles require Plate review',
    PRESET_STYLES.filter(
      (style) => !PLATE_REGISTRY_STYLE_NAMES.includes(style)
    ),
  ],
];
const upstreamProblems = upstreamDrift
  .filter(([, names]) => names.length > 0)
  .map(([message, names]) => `${message}: ${names.join(', ')}`);

if (upstreamProblems.length > 0) {
  throw new Error(upstreamProblems.join('. '));
}

const BASE_DEFAULT_STYLES: Record<PlateRegistryBase, PlateRegistryStyleName> = {
  base: 'nova',
  radix: 'nova',
};

// shadcn keeps its pre-preset styles on Radix.
const LEGACY_RADIX_STYLES = new Set(['default', 'new-york', 'new-york-v4']);

const PRESET_STYLE_REGEX = /^([^-]+)-([a-z0-9]+)$/;

export function servesLucideIcons(style: string) {
  return LEGACY_RADIX_STYLES.has(style);
}

export function getPlateRegistryStyle(style: string): {
  base: PlateRegistryBase;
  style: PlateRegistryStyleName;
} | null {
  if (LEGACY_RADIX_STYLES.has(style)) {
    return { base: 'radix', style: BASE_DEFAULT_STYLES.radix };
  }

  const [, baseName, styleName] = PRESET_STYLE_REGEX.exec(style) ?? [];
  const base = PLATE_REGISTRY_BASES.find((name) => name === baseName);

  if (!base) return null;

  return {
    base,
    style:
      PLATE_REGISTRY_STYLE_NAMES.find((name) => name === styleName) ??
      BASE_DEFAULT_STYLES[base],
  };
}
