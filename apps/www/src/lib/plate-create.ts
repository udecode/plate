import {
  DEFAULT_PRESET_CONFIG,
  decodePreset,
  encodePreset,
  PRESET_BASE_COLORS,
  PRESET_FONT_HEADINGS,
  PRESET_FONTS,
  PRESET_ICON_LIBRARIES,
  PRESET_MENU_ACCENTS,
  PRESET_MENU_COLORS,
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

export const PLATE_CREATE_VIEWS = ['sink', 'editor'] as const;

export type PlateCreateView = (typeof PLATE_CREATE_VIEWS)[number];

export const PLATE_DEFAULT_CREATE_VIEW: PlateCreateView = 'sink';

export const PLATE_CREATE_TEMPLATES = [
  { label: 'Next.js', value: 'next' },
  { label: 'Vite', value: 'vite' },
  { label: 'TanStack Start', value: 'start' },
  { label: 'React Router', value: 'react-router' },
  { label: 'Astro', value: 'astro' },
  { label: 'Laravel', value: 'laravel' },
] as const;

export type PlateCreateTemplate =
  (typeof PLATE_CREATE_TEMPLATES)[number]['value'];

export const PLATE_CREATE_PACKAGE_MANAGERS = [
  'pnpm',
  'npm',
  'yarn',
  'bun',
] as const;

export type PlateCreatePackageManager =
  (typeof PLATE_CREATE_PACKAGE_MANAGERS)[number];

const PACKAGE_MANAGER_RUNNERS: Record<PlateCreatePackageManager, string> = {
  bun: 'bunx --bun',
  npm: 'npx',
  pnpm: 'pnpm dlx',
  yarn: 'yarn dlx',
};

export type PlateCreateConfig = PresetConfig & {
  base: PlateRegistryBase;
  editor: PlateCreateEditor;
  rtl: boolean;
  view: PlateCreateView;
};

type BaseColor = PresetConfig['baseColor'];
type Theme = PresetConfig['theme'];

// shadcn's theme service rejects these colors and its create page dropped
// them, but its preset codec keeps them so old codes still decode.
const RETIRED_COLORS = new Set(['gray']);

const BASE_COLORS = PRESET_BASE_COLORS.filter(
  (baseColor) => !RETIRED_COLORS.has(baseColor)
);

const THEMES = PRESET_THEMES.filter((theme) => !RETIRED_COLORS.has(theme));

const isBaseColor = (value: string) =>
  BASE_COLORS.some((baseColor) => baseColor === value);

function getPlateCreateThemes(baseColor: BaseColor): Theme[] {
  return THEMES.filter((theme) => theme === baseColor || !isBaseColor(theme));
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
  const baseColor = RETIRED_COLORS.has(config.baseColor)
    ? DEFAULT_PRESET_CONFIG.baseColor
    : config.baseColor;
  const themes = getPlateCreateThemes(baseColor);
  const fits = (color: string | undefined) =>
    themes.some((theme) => theme === color);

  return {
    ...config,
    baseColor,
    chartColor: fits(config.chartColor) ? config.chartColor : baseColor,
    fontHeading:
      config.fontHeading === config.font ? 'inherit' : config.fontHeading,
    menuAccent: config.menuColor.endsWith('-translucent')
      ? 'subtle'
      : config.menuAccent,
    radius: getPlateCreateRadius(config),
    theme: fits(config.theme) ? config.theme : baseColor,
  };
}

export function createPlateCreateConfig(
  config: Partial<PlateCreateConfig> = {}
): PlateCreateConfig {
  return normalizePlateCreateConfig({
    ...DEFAULT_PRESET_CONFIG,
    base: PLATE_DEFAULT_REGISTRY_BASE,
    editor: PLATE_DEFAULT_CREATE_EDITOR,
    rtl: false,
    view: PLATE_DEFAULT_CREATE_VIEW,
    ...config,
  });
}

export const PLATE_DEFAULT_CREATE_CONFIG = createPlateCreateConfig();

export function readPlateCreateConfig({
  base,
  editor,
  preset,
  rtl,
  view,
}: Record<string, unknown>): PlateCreateConfig {
  const hasValidEditor =
    typeof editor === 'string' && isPlateCreateEditor(editor);
  const resolvedView: PlateCreateView =
    typeof view === 'string' && isPlateCreateView(view)
      ? view
      : hasValidEditor
        ? 'editor'
        : PLATE_DEFAULT_CREATE_VIEW;

  return createPlateCreateConfig({
    ...(typeof preset === 'string' ? decodePreset(preset) : null),
    ...(typeof base === 'string' && isPlateCreateBase(base) ? { base } : null),
    ...(hasValidEditor ? { editor } : null),
    ...(rtl === true || rtl === 'true' || rtl === '1' ? { rtl: true } : null),
    view: resolvedView,
  });
}

export function getPlateCreatePreset({
  base: _base,
  editor: _editor,
  rtl: _rtl,
  view: _view,
  ...preset
}: PlateCreateConfig) {
  return encodePreset(preset);
}

export function getPlateCreateCommand(
  config: PlateCreateConfig = PLATE_DEFAULT_CREATE_CONFIG,
  options?: {
    packageManager?: PlateCreatePackageManager;
    template?: PlateCreateTemplate;
  }
) {
  const runner = PACKAGE_MANAGER_RUNNERS[options?.packageManager ?? 'npm'];
  const parts = [
    `${runner} shadcn@latest create @plate/${config.editor}`,
    `--preset ${getPlateCreatePreset(config)}`,
    `--base ${config.base}`,
  ];

  if (options?.template) {
    parts.push(`--template ${options.template}`);
  }
  if (config.rtl) {
    parts.push('--rtl');
  }

  return parts.join(' ');
}

export function getPlateAddCommand(
  config: PlateCreateConfig = PLATE_DEFAULT_CREATE_CONFIG,
  options?: {
    packageManager?: PlateCreatePackageManager;
  }
) {
  const runner = PACKAGE_MANAGER_RUNNERS[options?.packageManager ?? 'npm'];

  return `${runner} shadcn@latest add @plate/${config.editor}`;
}

export function getShadcnCreateUrl(config: PlateCreateConfig) {
  const params = new URLSearchParams({
    base: config.base,
    preset: getPlateCreatePreset(config),
  });

  if (config.rtl) {
    params.set('rtl', 'true');
  }

  return `https://ui.shadcn.com/create?${params}`;
}

export function getPlateCreateOptions(config: PlateCreateConfig) {
  return {
    baseColor: BASE_COLORS,
    font: PRESET_FONTS,
    fontHeading: PRESET_FONT_HEADINGS,
    iconLibrary: PRESET_ICON_LIBRARIES,
    menuAccent: PRESET_MENU_ACCENTS,
    menuColor: PRESET_MENU_COLORS,
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

const getPlateCreateSearch = (config: PlateCreateConfig) => {
  const params = new URLSearchParams({
    base: config.base,
    editor: config.editor,
    preset: getPlateCreatePreset(config),
  });

  if (config.view === 'sink') {
    params.set('view', 'sink');
  }
  if (config.rtl) {
    params.set('rtl', 'true');
  }

  return params;
};

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

export function isPlateCreateView(value: string): value is PlateCreateView {
  return PLATE_CREATE_VIEWS.includes(value as PlateCreateView);
}
