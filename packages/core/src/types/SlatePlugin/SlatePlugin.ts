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
export interface SlatePlugin<T extends SPEditor = SPEditor> {
  /**
   * Editor method overriders
   */
  withOverrides?: WithOverride | WithOverride[];

  /**
   * @see {@link OnChange}
   */
  onChange?: OnChange<T>;

  /**
   * Inline element types
   */
  inlineTypes?: (editor: T) => string[];

  /**
   * Void element types
   */
  voidTypes?: (editor: T) => string[];

  /**
   * @see {@link Decorate}
   */
  decorate?: Decorate<T>;

  /**
   * @see {@link RenderElement}
   */
  renderElement?: RenderElement<T>;

  /**
   * @see {@link RenderLeaf}
   */
  renderLeaf?: RenderLeaf<T>;

  /**
   * @see {@link OnKeyDown}
   */
  onKeyDown?: OnKeyDown<T> | null;

  /**
   * @see {@link OnDOMBeforeInput}
   */
  onDOMBeforeInput?: OnDOMBeforeInput<T>;

  /**
   * @see {@link DeserializeHtml}
   */
  deserialize?: Deserialize<T>;

  /**
   * @see {@link SerializeHtml}
   */
  serialize?: Serialize;

  pluginKeys?: string | string[];
}
