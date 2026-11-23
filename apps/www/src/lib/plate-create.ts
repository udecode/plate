import {
  DEFAULT_PRESET_CONFIG,
  decodePreset,
  encodePreset,
  PRESET_BASE_COLORS,
  PRESET_FONT_HEADINGS,
  PRESET_FONTS,
  PRESET_RADII,
  PRESET_THEMES,
  type PresetConfig,
} from 'shadcn/preset';

import {
  type PlateRegistryBase,
  PLATE_DEFAULT_REGISTRY_BASE,
  PLATE_REGISTRY_BASES,
  PLATE_REGISTRY_STYLE_NAMES,
} from './plate-registry-styles';

export const PLATE_CREATE_EDITORS = [
  {
    name: 'editor-ai',
    title: 'AI editor',
    description: 'Full editor with AI, comments, and collaboration.',
  },
  {
    name: 'editor-basic',
    title: 'Basic editor',
    description: 'A focused rich-text editor with the core toolbars.',
  },
  {
    name: 'editor-select',
    title: 'Select editor',
    description: 'A compact editor for forms and structured input.',
  },
] as const;

export type PlateCreateEditor = (typeof PLATE_CREATE_EDITORS)[number]['name'];

export const PLATE_DEFAULT_CREATE_EDITOR: PlateCreateEditor = 'editor-ai';

export type PlateCreateConfig = PresetConfig & {
  base: PlateRegistryBase;
  editor: PlateCreateEditor;
};

type BaseColor = PresetConfig['baseColor'];
type Theme = PresetConfig['theme'];

const isBaseColor = (value: string) =>
  PRESET_BASE_COLORS.some((baseColor) => baseColor === value);

function getPlateCreateThemes(baseColor: BaseColor): Theme[] {
  return PRESET_THEMES.filter(
    (theme) => theme === baseColor || !isBaseColor(theme)
  );
}

function getPlateCreateRadius({
  radius,
  style,
}: PresetConfig): PresetConfig['radius'] {
  if (style === 'lyra' || style === 'sera') return 'none';
  if (style === 'rhea' && radius === 'large') return 'default';

  return radius;
}

// shadcn's create page normalizes its params with these pairings before it
// encodes them, so Plate writes the same code that page writes.
function normalizePlateCreateConfig(
  config: PlateCreateConfig
): PlateCreateConfig {
  const themes = getPlateCreateThemes(config.baseColor);
  const fits = (color: string | undefined) =>
    themes.some((theme) => theme === color);

  return {
    ...config,
    chartColor: fits(config.chartColor) ? config.chartColor : config.baseColor,
    fontHeading:
      config.fontHeading === config.font ? 'inherit' : config.fontHeading,
    menuAccent: config.menuColor.endsWith('-translucent')
      ? 'subtle'
      : config.menuAccent,
    radius: getPlateCreateRadius(config),
    theme: fits(config.theme) ? config.theme : config.baseColor,
  };
}

export function createPlateCreateConfig(
  config: Partial<PlateCreateConfig> = {}
): PlateCreateConfig {
  return normalizePlateCreateConfig({
    ...DEFAULT_PRESET_CONFIG,
    base: PLATE_DEFAULT_REGISTRY_BASE,
    editor: PLATE_DEFAULT_CREATE_EDITOR,
    ...config,
  });
}

export const PLATE_DEFAULT_CREATE_CONFIG = createPlateCreateConfig();

export function readPlateCreateConfig({
  base,
  editor,
  preset,
}: Record<string, unknown>): PlateCreateConfig {
  return createPlateCreateConfig({
    ...(typeof preset === 'string' ? decodePreset(preset) : null),
    ...(typeof base === 'string' && isPlateCreateBase(base) ? { base } : null),
    ...(typeof editor === 'string' && isPlateCreateEditor(editor)
      ? { editor }
      : null),
  });
}

export function getPlateCreatePreset({
  base: _base,
  editor: _editor,
  ...preset
}: PlateCreateConfig) {
  return encodePreset(preset);
}

export function getPlateCreateCommand(
  config: PlateCreateConfig = PLATE_DEFAULT_CREATE_CONFIG
) {
  return `npx shadcn@latest create @plate/${config.editor} --preset ${getPlateCreatePreset(config)} --base ${config.base}`;
}

export function getShadcnCreateUrl(config: PlateCreateConfig) {
  return `https://ui.shadcn.com/create?preset=${getPlateCreatePreset(config)}&base=${config.base}`;
}

export function getPlateCreateOptions(config: PlateCreateConfig) {
  return {
    baseColor: PRESET_BASE_COLORS,
    font: PRESET_FONTS,
    fontHeading: PRESET_FONT_HEADINGS,
    radius: [
      ...new Set(
        PRESET_RADII.map((radius) =>
          getPlateCreateRadius({ ...config, radius })
        )
      ),
    ],
    style: PLATE_REGISTRY_STYLE_NAMES,
    theme: getPlateCreateThemes(config.baseColor),
  };
}

const getPlateCreateSearch = (config: PlateCreateConfig) =>
  new URLSearchParams({
    base: config.base,
    editor: config.editor,
    preset: getPlateCreatePreset(config),
  });

export function getPlateCreatePath(config: PlateCreateConfig) {
  return `/create?${getPlateCreateSearch(config)}`;
}

export function getPlateCreatePreviewPath(config: PlateCreateConfig) {
  return `/create-preview?${getPlateCreateSearch(config)}`;
}

export function isPlateCreateEditor(value: string): value is PlateCreateEditor {
  return PLATE_CREATE_EDITORS.some((editor) => editor.name === value);
}

export function isPlateCreateBase(value: string): value is PlateRegistryBase {
  return PLATE_REGISTRY_BASES.includes(value as PlateRegistryBase);
}
