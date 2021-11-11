import { Decorate } from './Decorate';
import { Deserialize } from './Deserialize';
import { DOMHandlers } from './DOMHandlers';
import { InjectComponent } from './InjectComponent';
import { OnChange } from './OnChange';
import { OverrideProps } from './OverrideProps';
import { Serialize } from './Serialize';
import { WithOverride } from './WithOverride';

export interface PlatePluginKey {
  /**
   * Custom plugin key to be used when creating multiple same plugins with different options.
   * @default options.type
   */
  key?: string;
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
  key?: string;

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
    PlatePluginEditor<T> {}

export interface PlatePluginElement<T = {}> extends PlatePluginNode<T> {
  /**
   * Whether the element is inline.
   */
  isInline?: boolean;

  /**
   * Whether it's an element plugin (`renderElement`).
   */
  isElement?: boolean;

  /**
   * Whether the element is void.
   */
  isVoid?: boolean;
}

export interface PlatePluginLeaf<T = {}> extends PlatePluginNode<T> {
  /**
   * Whether it's a leaf plugin (`renderLeaf`).
   */
  isLeaf?: boolean;
}
