import { SPEditor } from '../SPEditor';
import { Decorate } from './Decorate';
import { Deserialize } from './Deserialize';
import { DOMHandlers } from './DOMHandlers';
import { OnChange } from './OnChange';
import { OverrideProps } from './OverrideProps';
import { RenderElement } from './RenderElement';
import { RenderLeaf } from './RenderLeaf';
import { Serialize } from './Serialize';
import { WithOverride } from './WithOverride';

export interface PlatePluginKey {
  /**
   * Custom plugin key to be used when creating multiple same plugins with different options.
   * @default options.type
   */
  pluginKey?: string;
}

/**
 * Plate plugin interface built on top of Slate and Editable.
 */
export interface PlatePlugin<T extends SPEditor = SPEditor>
  extends PlatePluginSerialize<T>,
    PlatePluginElement<T>,
    PlatePluginLeaf<T> {}

export interface PlatePluginEditor<T extends SPEditor = SPEditor>
  extends Partial<DOMHandlers<T>> {
  /**
   * @see {@link Decorate}
   */
  decorate?: Decorate<T>;

  /**
   * Plugin keys to support configuration.
   */
  pluginKeys?: string | string[];

  /**
   * @see {@link OnChange}
   */
  onChange?: OnChange<T>;

  /**
   * Overrides rendered node props (shallow merge).
   */
  overrideProps?: OverrideProps<T>;

  /**
   * Editor method overriders.
   */
  withOverrides?: WithOverride<T> | WithOverride<T>[];
}

export interface PlatePluginSerialize<T extends SPEditor = SPEditor> {
  /**
   * @see {@link DeserializeHtml}
   */
  deserialize?: Deserialize<T>;

  /**
   * @see {@link SerializeHtml}
   */
  serialize?: Serialize;
}

export interface PlatePluginNode<T extends SPEditor = SPEditor>
  extends PlatePluginSerialize<T>,
    PlatePluginEditor<T> {
  /**
   * Void element types.
   */
  voidTypes?: (editor: T) => string[];
}

export interface PlatePluginElement<T extends SPEditor = SPEditor>
  extends PlatePluginNode<T> {
  /**
   * Inline element types.
   */
  inlineTypes?: (editor: T) => string[];

  /**
   * @see {@link RenderElement}
   */
  renderElement?: RenderElement<T>;
}

export interface PlatePluginLeaf<T extends SPEditor = SPEditor>
  extends PlatePluginNode<T> {
  /**
   * @see {@link RenderLeaf}
   */
  renderLeaf?: RenderLeaf<T>;
}
