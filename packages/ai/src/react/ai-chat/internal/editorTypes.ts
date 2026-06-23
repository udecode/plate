import type { MarkdownConfig } from '@platejs/markdown';
import type {
  BlockSelectionConfig,
  CursorOverlayConfig,
} from '@platejs/selection/react';
import type { BaseSuggestionConfig } from '@platejs/suggestion';
import type { InferApi, SlateEditor } from 'platejs';
import type { PlateEditor } from 'platejs/react';

import type { AIChatPluginConfig } from '../AIChatPlugin';

export type AIChatEditorConfig =
  | AIChatPluginConfig
  | BaseSuggestionConfig
  | BlockSelectionConfig
  | CursorOverlayConfig
  | MarkdownConfig;

type AIChatApi = UnionToIntersection<InferApi<AIChatEditorConfig>>;

type UnionToIntersection<T> = (
  T extends unknown
    ? (value: T) => void
    : never
) extends (value: infer I) => void
  ? I
  : never;

export type AIChatPlateEditor = PlateEditor & {
  api: PlateEditor['api'] & AIChatApi;
};

export type AIChatSlateEditor = SlateEditor & {
  api: SlateEditor['api'] & AIChatApi;
};
