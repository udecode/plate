import { Decorate } from './Decorate';
import { DeserializeHtml } from './DeserializeHtml';
import { OnDOMBeforeInput } from './OnDOMBeforeInput';
import { OnKeyDown } from './OnKeyDown';
import { RenderElement } from './RenderElement';
import { RenderLeaf } from './RenderLeaf';
import { SerializeHtml } from './SerializeHtml';

/**
 * Slate plugin interface built on top of Slate and Editable.
 */
export interface SlatePlugin {
  deserialize?: DeserializeHtml;

  serialize?: SerializeHtml;

  inlineTypes?: string[];

  voidTypes?: string[];

  /**
   * @see {@link Decorate}
   */
  decorate?: Decorate;

  /**
   * Dependencies of `decorate`
   */
  decorateDeps?: any[];

  /**
   * @see {@link RenderElement}
   */
  renderElement?: RenderElement;

  /**
   * Dependencies for `renderElement`
   */
  renderElementDeps?: any[];

  /**
   * @see {@link RenderLeaf}
   */
  renderLeaf?: RenderLeaf;

  /**
   * Dependencies for `renderLeaf`
   */
  renderLeafDeps?: any[];

  /**
   * @see {@link OnDOMBeforeInput}
   */
  onDOMBeforeInput?: OnDOMBeforeInput;

  /**
   * Dependencies for `onDOMBeforeInput`
   */
  onDOMBeforeInputDeps?: any[];

  /**
   * @see {@link OnKeyDown}
   */
  onKeyDown?: OnKeyDown | null;

  /**
   * Dependencies for `onKeyDown`
   */
  onKeyDownDeps?: any[];
}
