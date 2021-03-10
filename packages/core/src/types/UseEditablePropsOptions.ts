import { EditableProps } from 'slate-react/dist/components/editable';
import { Decorate } from './Decorate';
import { OnDOMBeforeInput } from './OnDOMBeforeInput';
import { OnKeyDown } from './OnKeyDown';
import { RenderElement } from './RenderElement';
import { RenderLeaf } from './RenderLeaf';
import { UseSlatePluginsEffectsOptions } from './UseSlatePluginsEffectsOptions';

/**
 * Options related to Editable component
 */
export interface UseEditablePropsOptions
  extends Pick<UseSlatePluginsEffectsOptions, 'id' | 'plugins' | 'components'> {
  /**
   * @see {@link Decorate}
   */
  decorate?: Decorate[];

  /**
   * Dependencies of `decorate`
   */
  decorateDeps?: any[];

  /**
   * @see {@link RenderElement}
   */
  renderElement?: RenderElement[];

  /**
   * Dependencies for `renderElement`
   */
  renderElementDeps?: any[];

  /**
   * @see {@link RenderLeaf}
   */
  renderLeaf?: RenderLeaf[];

  /**
   * Dependencies for `renderLeaf`
   */
  renderLeafDeps?: any[];

  /**
   * @see {@link OnDOMBeforeInput}
   */
  onDOMBeforeInput?: OnDOMBeforeInput[];

  /**
   * Dependencies for `onDOMBeforeInput`
   */
  onDOMBeforeInputDeps?: any[];

  /**
   * @see {@link OnKeyDown}
   */
  onKeyDown?: OnKeyDown[];

  /**
   * Dependencies for `onKeyDown`
   */
  onKeyDownDeps?: any[];

  editableProps?: EditableProps;
}
