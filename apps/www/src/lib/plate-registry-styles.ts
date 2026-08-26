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

const unsupportedBases = PLATE_REGISTRY_BASES.filter(
  (base) => !PRESET_BASES.includes(base)
);
const unsupportedStyles = PLATE_REGISTRY_STYLE_NAMES.filter(
  (style) => !PRESET_STYLES.includes(style)
);
const unreviewedStyles = PRESET_STYLES.filter(
  (style) => !PLATE_REGISTRY_STYLE_NAMES.includes(style)
);

if (unsupportedBases.length > 0) {
  throw new Error(
    `Plate registry bases are missing upstream: ${unsupportedBases.join(', ')}`
  );
}

if (unsupportedStyles.length > 0 || unreviewedStyles.length > 0) {
  throw new Error(
    [
      unsupportedStyles.length > 0
        ? `Plate registry styles are missing upstream: ${unsupportedStyles.join(', ')}`
        : null,
      unreviewedStyles.length > 0
        ? `Upstream registry styles require Plate review: ${unreviewedStyles.join(', ')}`
        : null,
    ]
      .filter(Boolean)
      .join('. ')
  );
}

const LEGACY_RADIX_STYLES = ['new-york', 'new-york-v4'] as const;

export const PLATE_REGISTRY_STYLES = [
  ...PLATE_REGISTRY_BASES.flatMap((base) =>
    PLATE_REGISTRY_STYLE_NAMES.map((style) => `${base}-${style}`)
  ),
  ...LEGACY_RADIX_STYLES,
] as const;

const plateRegistryStyleBases = new Map<string, PlateRegistryBase>([
  ...PLATE_REGISTRY_BASES.flatMap((base) =>
    PLATE_REGISTRY_STYLE_NAMES.map(
      (style) => [`${base}-${style}`, base] as const
    )
  ),
  ...LEGACY_RADIX_STYLES.map((style) => [style, 'radix'] as const),
]);

export function getPlateRegistryStyleBase(style: string) {
  return plateRegistryStyleBases.get(style) ?? null;
}

export function getPlateRegistryStyle(style: string): {
  base: PlateRegistryBase;
  style: PlateRegistryStyleName;
} | null {
  if (
    LEGACY_RADIX_STYLES.includes(style as (typeof LEGACY_RADIX_STYLES)[number])
  ) {
    return { base: 'radix', style: 'nova' };
  }

  const separatorIndex = style.indexOf('-');
  const base = style.slice(0, separatorIndex) as PlateRegistryBase;
  const styleName = style.slice(separatorIndex + 1) as PlateRegistryStyleName;

  if (
    !PLATE_REGISTRY_BASES.includes(base) ||
    !PLATE_REGISTRY_STYLE_NAMES.includes(styleName)
  ) {
    return null;
  }

  return { base, style: styleName };
}
