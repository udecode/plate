import { PlateEditor } from '../PlateEditor';
import { Decorate } from './Decorate';
import { Deserialize } from './Deserialize';
import { DOMHandlers } from './DOMHandlers';
import { InjectComponent } from './InjectComponent';
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
export interface PlatePlugin<T = {}>
  extends PlatePluginSerialize<T>,
    PlatePluginElement<T>,
    PlatePluginLeaf<T> {}

export interface PlatePluginEditor<T = {}> extends Partial<DOMHandlers<T>> {
  /**
   * @see {@link Decorate}
   */
  decorate?: Decorate<T>;

  /**
   * Inject child component around any node children.
   */
  injectChildComponent?: InjectComponent | InjectComponent[];

  /**
   * Inject parent component around any node `component`.
   */
  injectParentComponent?: InjectComponent | InjectComponent[];

  /**
   * @see {@link OnChange}
   */
  onChange?: OnChange<T>;

  /**
   * Overrides rendered node props (shallow merge).
   */
  overrideProps?: OverrideProps<T> | OverrideProps<T>[];

  /**
   * Plugin keys to support configuration.
   */
  pluginKeys?: string | string[];

  /**
   * Editor method overriders.
   */
  withOverrides?: WithOverride<T> | WithOverride<T>[];
}

export interface PlatePluginSerialize<T = {}> {
  /**
   * @see {@link DeserializeHtml}
   */
  deserialize?: Deserialize<T>;

  /**
   * @see {@link SerializeHtml}
   */
  serialize?: Serialize;
}

export interface PlatePluginNode<T = {}>
  extends PlatePluginSerialize<T>,
    PlatePluginEditor<T> {
  /**
   * Void element types.
   */
  voidTypes?: (editor: PlateEditor<T>) => string[];
}

export interface PlatePluginElement<T = {}> extends PlatePluginNode<T> {
  /**
   * Inline element types.
   */
  inlineTypes?: (editor: PlateEditor<T>) => string[];

  /**
   * @see {@link RenderElement}
   */
  renderElement?: RenderElement<T>;
}

export interface PlatePluginLeaf<T = {}> extends PlatePluginNode<T> {
  /**
   * @see {@link RenderLeaf}
   */
  renderLeaf?: RenderLeaf<T>;
}
