import { CSSProperties } from 'react';
import { HotkeyPlugin, PlateEditor, RenderFunction } from '@udecode/plate-core';

export type TransformNodeValueOptions<TValue> = {
  listOptions: ListPlugin<TValue>;
  value: unknown;
  currentValue: unknown;
};

export type ListMarkOptions<TValue = any> = {
  /**
   * Node key to map to the styles.
   */
  nodeKey: string;

  /**
   * Style key to override.
   * @default nodeKey
   */
  styleKey?: keyof CSSProperties;

  /**
   * Transformation function that will be used to transform the value from the text
   * if not provided the value will be used as is
   * `value` the value on the element
   * `currentValue` this will hold the current value of the styleKey
   * for scenarios when multiple plugin were to handle the same styleKey
   * @default undefined
   */
  transformNodeValue?: (
    editor: PlateEditor,
    options: TransformNodeValueOptions<TValue>
  ) => TValue;
};

export interface ListPlugin<TValue = any> extends HotkeyPlugin {
  /**
   * Valid children types for list items, in addition to p and ul types.
   */
  validLiChildrenTypes?: string[];

  /**
   * Enables custom ordering, this is required for formatted numbering
   * It will be enable if marks are provided
   */
  enableOrdering?: boolean;

  /**
   * Render for the number element,
   * @default ({order}) => order.join('.')
   */
  onRenderMarker?: RenderFunction<{
    order: number[];
    options: ListPlugin<TValue>;
  }>;

  /**
   * List of supported marks
   */
  marks?: ListMarkOptions<TValue>[];
}

export interface ListNormalizerOptions<TValue = any>
  extends Pick<ListPlugin<TValue>, 'validLiChildrenTypes'> {}
