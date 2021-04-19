import { SPEditor } from '../SPEditor';
import { Decorate } from './Decorate';
import { Deserialize } from './Deserialize';
import { OnChange } from './OnChange';
import { OnDOMBeforeInput } from './OnDOMBeforeInput';
import { OnKeyDown } from './OnKeyDown';
import { RenderElement } from './RenderElement';
import { RenderLeaf } from './RenderLeaf';
import { Serialize } from './Serialize';
import { WithOverride } from './WithOverride';

export interface SlatePluginKey {
  /**
   * Custom plugin key to be used when creating multiple same plugins with different options.
   * @default options.type
   */
  pluginKey?: string;
}

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
  inlineTypes?: (editor: SPEditor) => string[];

  /**
   * Void element types
   */
  voidTypes?: (editor: SPEditor) => string[];

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
  deserialize?: Deserialize;

  /**
   * @see {@link SerializeHtml}
   */
  serialize?: Serialize;

  pluginKeys?: string | string[];
}
