import { Element } from 'slate';
import { RenderElementProps } from 'slate-react';
import { RenderElementOptions } from '../../element';

export const ACTION_ITEM = 'action_item';

// Data of Element node
export interface ActionItemNodeData {
  checked: boolean;
}

// Element node
export interface ActionItemNode extends Element, ActionItemNodeData {}

// Type option
interface TypeOption {
  typeActionItem?: string;
}

// deserialize options
export interface ActionItemDeserializeOptions extends TypeOption {}

// renderElement options given as props
interface ActionItemRenderElementOptionsProps {}

// renderElement options
export interface ActionItemRenderElementOptions
  extends RenderElementOptions,
    ActionItemRenderElementOptionsProps,
    TypeOption {}

// renderElement props
export interface ActionItemRenderElementProps
  extends RenderElementProps,
    ActionItemRenderElementOptionsProps {
  element: ActionItemNode;
}

// Plugin options
export interface ActionItemPluginOptions
  extends ActionItemRenderElementOptions,
    ActionItemDeserializeOptions {}
