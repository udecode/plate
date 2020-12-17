import { Editor, NodeEntry, Range } from 'slate';
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
export type Decorate = (entry: NodeEntry, editor: Editor) => Range[];

export type OnDOMBeforeInput = (event: Event, editor: Editor) => void;

/**
 * To customize the rendering of each element components.
 * Element properties are for contiguous, semantic elements in the document.
 * Return undefined in case the criteria for rendering isn't met
 */
export type RenderElement = (
  props: RenderElementProps
) => JSX.Element | undefined;

/**
 * To customize the rendering of each leaf.
 * When text-level formatting is rendered, the characters are grouped into
 * "leaves" of text that each contain the same formatting applied to them.
 * Text properties are for non-contiguous, character-level formatting.
 * RenderLeaf always returns a JSX element (even if unmodified) to support multiple marks on a node.
 */
export type RenderLeaf = (props: RenderLeafProps) => JSX.Element;

/**
 * Handler called on key down.
 * If one handler returns false, do not run the next handlers.
 */
export type OnKeyDown = (
  e: any,
  editor: Editor,
  options?: any
) => boolean | void;

export type DeserializeNode = {
  type: string;
  deserialize: (
    el: HTMLElement
  ) =>
    | {
        [key: string]: unknown;
      }
    | undefined;
  withoutChildren?: boolean;
};

export interface DeserializeHtml {
  element?: DeserializeNode[];
  leaf?: DeserializeNode[];
}

export interface SerializeHtml {
  element?: RenderElement;
  leaf?: RenderLeaf;
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
 *
 * To serialize HTML (overriding renderElement / renderLeaf):
 * - serialize
 */
export interface SlatePlugin {
  decorate?: Decorate;
  // Dependencies of `decorate`
  decorateDeps?: any[];
  deserialize?: DeserializeHtml;
  serialize?: SerializeHtml;
  inlineTypes?: string[];
  renderElement?: RenderElement;
  // Dependencies of `renderElement`
  renderElementDeps?: any[];
  renderLeaf?: RenderLeaf;
  // Dependencies of `renderLeaf`
  renderLeafDeps?: any[];
  voidTypes?: string[];
  onDOMBeforeInput?: OnDOMBeforeInput;
  // Dependencies of `onDOMBeforeInput`
  onDOMBeforeInputDeps?: any[];
  onKeyDown?: OnKeyDown | null;
  // Dependencies of `onKeyDown`
  onKeyDownDeps?: any[];
  [key: string]: any;
}
