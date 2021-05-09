import { SPEditor } from '../SPEditor';
import { Decorate } from './Decorate';
import { Deserialize } from './Deserialize';
import { DOMHandlers } from './DOMHandlers';
import { OnChange } from './OnChange';
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
export interface SlatePlugin<T extends SPEditor = SPEditor>
  extends Partial<DOMHandlers<T>> {
  /**
   * @see {@link Decorate}
   */
  decorate?: Decorate<T>;

  /**
   * @see {@link DeserializeHtml}
   */
  deserialize?: Deserialize<T>;

  /**
   * Inline element types.
   */
  inlineTypes?: (editor: T) => string[];

  /**
   * @see {@link OnChange}
   */
  onChange?: OnChange<T>;

  /**
   * Plugin keys to support configuration.
   */
  pluginKeys?: string | string[];

  /**
   * @see {@link RenderElement}
   */
  renderElement?: RenderElement<T>;

  /**
   * @see {@link RenderLeaf}
   */
  renderLeaf?: RenderLeaf<T>;

  /**
   * @see {@link SerializeHtml}
   */
  serialize?: Serialize;

  /**
   * Void element types.
   */
  voidTypes?: (editor: T) => string[];

  /**
   * Editor method overriders.
   */
  withOverrides?: WithOverride | WithOverride[];
}
