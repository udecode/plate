import { DeserializeHtml } from 'deserializers/types';
import { Editor, NodeEntry, Range } from 'slate';
import { RenderElementProps, RenderLeafProps } from 'slate-react';

export type Decorate = (entry: NodeEntry) => Range[];
export type OnDOMBeforeInput = (event: Event, editor: Editor) => void;
export type RenderElement = (
  props: RenderElementProps
) => JSX.Element | undefined;
export type RenderLeaf = (props: RenderLeafProps) => JSX.Element;
export type OnKeyDown = (e: any, editor: Editor, props?: any) => void;

export interface SlatePlugin {
  decorate?: Decorate;
  onDOMBeforeInput?: OnDOMBeforeInput;
  renderElement?: RenderElement;
  renderLeaf?: RenderLeaf;
  onKeyDown?: OnKeyDown;
  deserialize?: DeserializeHtml;
}
