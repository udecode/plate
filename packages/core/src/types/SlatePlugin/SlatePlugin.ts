import { Editor } from 'slate';
import { Decorate } from './Decorate';
import { DeserializeHtml } from './DeserializeHtml';
import { OnChange } from './OnChange';
import { OnDOMBeforeInput } from './OnDOMBeforeInput';
import { OnKeyDown } from './OnKeyDown';
import { RenderElement } from './RenderElement';
import { RenderLeaf } from './RenderLeaf';
import { SerializeHtml } from './SerializeHtml';
import { WithOverride } from './WithOverride';

/**
 * Slate plugin interface built on top of Slate and Editable.
 */
export interface SlatePlugin {
  /**
   * Editor method overriders
   */
  withOverrides?: WithOverride | WithOverride[];

  /**
   * @see {@link OnChange}
   */
  onChange?: OnChange;

  /**
   * Inline element types
   */
  inlineTypes?: (editor: Editor) => string[];

  /**
   * Void element types
   */
  voidTypes?: (editor: Editor) => string[];

  /**
   * @see {@link Decorate}
   */
  decorate?: Decorate;

  /**
   * @see {@link RenderElement}
   */
  renderElement?: RenderElement;

  /**
   * @see {@link RenderLeaf}
   */
  renderLeaf?: RenderLeaf;

  /**
   * @see {@link OnKeyDown}
   */
  onKeyDown?: OnKeyDown | null;

  /**
   * @see {@link OnDOMBeforeInput}
   */
  onDOMBeforeInput?: OnDOMBeforeInput;

  /**
   * @see {@link DeserializeHtml}
   */
  deserialize?: DeserializeHtml;

  /**
   * @see {@link SerializeHtml}
   */
  serialize?: SerializeHtml;

  pluginKeys?: string | string[];
  // pluginKeys?: T | T[];
}

// /**
// * Dependencies of `decorate`
// */
// decorateDeps?: any[];
//
// /**
// * Dependencies for `renderElement`
// */
// renderElementDeps?: any[];
//
// /**
// * Dependencies for `renderLeaf`
// */
// renderLeafDeps?: any[];
//
// /**
// * Dependencies for `onDOMBeforeInput`
// */
// onDOMBeforeInputDeps?: any[];
//
//
//
// /**
// * Dependencies for `onKeyDown`
// */
// onKeyDownDeps?: any[];
