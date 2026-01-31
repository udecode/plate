export const CODE_DRAWING_TYPE = {
  PlantUml: 'PlantUml',
  Graphviz: 'Graphviz',
  Flowchart: 'Flowchart',
  Mermaid: 'Mermaid',
} as const;

export const CODE_DRAWING_TYPE_ARRAY = [
  {
    value: CODE_DRAWING_TYPE.PlantUml,
    label: CODE_DRAWING_TYPE.PlantUml,
  },
  {
    value: CODE_DRAWING_TYPE.Graphviz,
    label: CODE_DRAWING_TYPE.Graphviz,
  },
  {
    value: CODE_DRAWING_TYPE.Flowchart,
    label: CODE_DRAWING_TYPE.Flowchart,
  },
  {
    value: CODE_DRAWING_TYPE.Mermaid,
    label: CODE_DRAWING_TYPE.Mermaid,
  },
] as const;

export type CodeDrawingType =
  (typeof CODE_DRAWING_TYPE)[keyof typeof CODE_DRAWING_TYPE];

// View mode constants
export const VIEW_MODE = {
  Both: 'Both',
  Code: 'Code',
  Image: 'Image',
} as const;

export const VIEW_MODE_ARRAY = [
  {
    value: VIEW_MODE.Both,
    label: VIEW_MODE.Both,
  },
  {
    value: VIEW_MODE.Code,
    label: VIEW_MODE.Code,
  },
  {
    value: VIEW_MODE.Image,
    label: VIEW_MODE.Image,
  },
] as const;

export type ViewMode = (typeof VIEW_MODE)[keyof typeof VIEW_MODE];

// UI constants
export const DEFAULT_MIN_HEIGHT = 300;
export const RENDER_DEBOUNCE_DELAY = 500;
export const DOWNLOAD_FILENAME = 'code-drawing.png';
