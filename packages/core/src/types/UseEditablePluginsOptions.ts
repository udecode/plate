import * as React from 'react';
import { Decorate } from './Decorate';
import { OnDOMBeforeInput } from './OnDOMBeforeInput';
import { OnKeyDown } from './OnKeyDown';
import { RenderElement } from './RenderElement';
import { RenderLeaf } from './RenderLeaf';
import { SlatePlugin } from './SlatePlugin';

// TODO: duplicate

export interface UseEditablePluginsOptions
  extends Omit<
    React.TextareaHTMLAttributes<HTMLDivElement>,
    'value' | 'onChange' | 'onKeyDown'
  > {
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

  /**
   * The plugins are applied in the order they are specified.
   */
  plugins?: SlatePlugin[];

  as?: React.ElementType;

  [key: string]: any;
}
