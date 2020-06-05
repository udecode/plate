import { Editor, Node, NodeEntry, Range } from 'slate';
import { RenderElementProps, RenderLeafProps } from 'slate-react';

/**
 * Decorations are another type of text-level formatting.
 * They are similar to regular old custom properties,
 * except each one applies to a Range of the document instead of being
 * associated with a given text node.
 * However, decorations are computed at render-time based on the content itself.
 * This is helpful for dynamic formatting like syntax highlighting or search
 * keywords, where changes to the content (or some external data) has the
 * potential to change the formatting.
 */
export type Decorate = (entry: NodeEntry) => Range[];
export type OnDOMBeforeInput = (event: Event, editor: Editor) => void;

/**
 * To customize the rendering of each element components.
 * Element properties are for contiguous, semantic elements in the document.
 */
export type RenderElement = (
  props: RenderElementProps
) => JSX.Element | undefined;

/**
 * To customize the rendering of each leaf.
 * When text-level formatting is rendered, the characters are grouped into
 * "leaves" of text that each contain the same formatting applied to them.
 * Text properties are for non-contiguous, character-level formatting.
 */
export type RenderLeaf = (props: RenderLeafProps) => JSX.Element;

// Handler when we press a key.
export type OnKeyDown = (e: any, editor: Editor, options?: any) => void;

export type DeserializeElement = Record<
  string,
  (
    el: HTMLElement
  ) =>
    | {
        type: string;
        [key: string]: any;
      }
    | undefined
>;

export type DeserializeLeafValue = (
  el: HTMLElement
) => Record<string, any> | undefined | false;

type DeserializeLeaf = Record<string, DeserializeLeafValue>;

export interface DeserializeHtml {
  element?: DeserializeElement;
  leaf?: DeserializeLeaf;
}

/**
 * Each plugin fields will be combined by role.
 *
 * To render `Editable`:
 * - decorate
 * - renderElement
 * - renderLeaf
 * - onDOMBeforeInput
 * - onKeyDown
 *
 * To deserialize HTML:
 * - deserialize
 */
export interface SlatePlugin {
  decorate?: Decorate;
  deserialize?: DeserializeHtml;
  inlineTypes?: string[];
  renderElement?: RenderElement;
  renderLeaf?: RenderLeaf;
  voidTypes?: string[];
  onDOMBeforeInput?: OnDOMBeforeInput;
  onKeyDown?: OnKeyDown | null;
}

export interface QueryOptions {
  // Condition on the node to be valid.
  filter?: (entry: NodeEntry<Node>) => boolean;
  // List of types that are valid. If empty or undefined - allow all.
  allow?: string[];
  // List of types that are invalid.
  exclude?: string[];
}
