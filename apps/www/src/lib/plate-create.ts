import {
  type PlateRegistryBase,
  type PlateRegistryStyleName,
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
export const PLATE_DEFAULT_CREATE_STYLE: PlateRegistryStyleName = 'nova';

export const PLATE_PRESET_CODES = {
  nova: 'b0',
  vega: 'bIkeymG',
  maia: 'bbVJxYW',
  lyra: 'buFywKm',
  mira: 'b1D0dv72',
  luma: 'b1VlIttI',
  sera: 'b1oVxsfY',
  rhea: 'b27GcrRo',
} as const satisfies Record<PlateRegistryStyleName, string>;

export function getPlateCreateCommand({
  base = PLATE_DEFAULT_REGISTRY_BASE,
  editor = PLATE_DEFAULT_CREATE_EDITOR,
  style = PLATE_DEFAULT_CREATE_STYLE,
}: {
  base?: PlateRegistryBase;
  editor?: PlateCreateEditor;
  style?: PlateRegistryStyleName;
} = {}) {
  return `npx shadcn@latest create @plate/${editor} --preset ${PLATE_PRESET_CODES[style]} --base ${base}`;
}

export function getShadcnCreateUrl(style: PlateRegistryStyleName) {
  return `https://ui.shadcn.com/create?preset=${PLATE_PRESET_CODES[style]}`;
}

export function isPlateCreateEditor(value: string): value is PlateCreateEditor {
  return PLATE_CREATE_EDITORS.some((editor) => editor.name === value);
}

export function isPlateCreateBase(value: string): value is PlateRegistryBase {
  return PLATE_REGISTRY_BASES.includes(value as PlateRegistryBase);
}

export function isPlateCreateStyle(
  value: string
): value is PlateRegistryStyleName {
  return PLATE_REGISTRY_STYLE_NAMES.includes(value as PlateRegistryStyleName);
}
