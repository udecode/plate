import { IStyleFunctionOrObject } from '@uifabric/utilities';
import { Element } from 'slate';
import { RenderElementProps } from 'slate-react';
import {
  Deserialize,
  RenderNodeOptions,
  RenderNodePropsOptions,
  RootProps,
} from '../../common/types/PluginOptions.types';
import {
  StyledComponentStyleProps,
  StyledComponentStyles,
} from '../../components/StyledComponent/StyledComponent.types';

export const ListHotkey = {
  TAB: 'Tab',
  ENTER: 'Enter',
  DELETE_BACKWARD: 'Backspace',
};

// Data of Element node
export interface ListNodeData {}
// Element node
export interface ListNode extends Element, ListNodeData {}

// renderElement options given as props
export interface ListRenderElementPropsOptions {
  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<
    StyledComponentStyleProps,
    StyledComponentStyles
  >;
}

// renderElement props
export interface ListElementProps
  extends RenderElementProps,
    RenderNodePropsOptions,
    ListRenderElementPropsOptions {
  element: ListNode;
}

export type ListKeyOption = 'ul' | 'ol' | 'li' | 'p';

// Plugin options
export type ListPluginOptionsValues = RenderNodeOptions &
  RootProps<ListRenderElementPropsOptions> &
  Deserialize;
export type ListPluginOptionsKeys = keyof ListPluginOptionsValues;
export type ListPluginOptions<
  Value extends ListPluginOptionsKeys = ListPluginOptionsKeys
> = Partial<Record<ListKeyOption, Pick<ListPluginOptionsValues, Value>>>;

// renderElement options
export type ListRenderElementOptionsKeys = ListPluginOptionsKeys;
export interface ListRenderElementOptions
  extends ListPluginOptions<ListRenderElementOptionsKeys> {}

// deserialize options
export interface ListDeserializeOptions
  extends ListPluginOptions<'type' | 'rootProps' | 'deserialize'> {}

export interface ListOnKeyDownOptions extends ListPluginOptions<'type'> {}
export interface ListOptions extends ListPluginOptions<'type'> {}
