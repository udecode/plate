import { PlateEditor } from '../../PlateEditor';
import { GetNodeProps } from '../../PlatePluginOptions/GetNodeProps';
import { PlatePluginKey } from '../PlatePluginKey';
import { Decorate } from './Decorate';
import { DOMHandlers } from './DOMHandlers';
import { InjectComponent } from './InjectComponent';
import { OnChange } from './OnChange';
import { OverridePropsPlugin } from './OverridePropsPlugin';
import { PlatePluginComponent } from './PlatePluginComponent';
import { WithOverride } from './WithOverride';

/**
 * Plate plugin interface built on top of Slate and Editable.
 */
export type PlatePlugin<T = {}, P = {}> = Required<PlatePluginKey> &
  Partial<DOMHandlers<T>> &
  OverridePropsPlugin &
  P & {
    /**
     * React component rendering a slate element or leaf.
     * @default DefaultElement | DefaultLeaf
     */
    component?: PlatePluginComponent;

    /**
     * @see {@link Decorate}
     */
    decorate?: Decorate<T, P>;

    /**
     * `Plate` will pass its return value as a component prop `nodeProps`.
     * @see {@link GetNodeProps}
     */
    getNodeProps?: GetNodeProps;

    /**
     * Inject child component around any node children.
     */
    injectChildComponent?: InjectComponent;

    /**
     * Inject parent component around any node `component`.
     */
    injectParentComponent?: InjectComponent;

    /**
     * Whether it's an element plugin (`renderElement`).
     */
    isElement?: boolean;

    /**
     * Whether the element is inline.
     */
    isInline?: boolean;

    /**
     * Whether it's a leaf plugin (`renderLeaf`).
     */
    isLeaf?: boolean;

    /**
     * Whether the element is void.
     */
    isVoid?: boolean;

    /**
     * @see {@link OnChange}
     */
    onChange?: OnChange<T, P>;

    /**
     * Nested plugins supported.
     * Plate flats all the plugins into `editor.plugins`.
     */
    plugins?: PlatePlugin<T, P>[];

    /**
     * Element or mark type.
     * @default key
     */
    type?: string;

    /**
     * The returned value will be merged to the plugin.
     */
    withEditor?: (
      editor: PlateEditor<T>,
      plugin: PlatePlugin<T, P>
    ) => Partial<PlatePlugin<T, P>>;

    /**
     * Editor method overriders.
     */
    withOverrides?: WithOverride<T, P>;
  };
