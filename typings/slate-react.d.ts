import { Editor, Node, NodeEntry, Range } from 'slate';
import { RenderElementProps, RenderLeafProps } from 'slate-react';

declare module 'slate-react' {
  type SlateType = (props: {
    editor: Editor;
    children: JSX.Element | JSX.Element[];
    defaultValue?: Node[];
    onChange?: (children: Node[], operations: Operation[]) => void;
  }) => JSX.Element;

  interface EditableProps extends React.TextareaHTMLAttributes<HTMLDivElement> {
    [key: string]: any;
    decorate?: (entry: NodeEntry) => Range[];
    onDOMBeforeInput?: (event: Event) => void;
    placeholder?: string;
    readOnly?: boolean;
    role?: string;
    style?: React.CSSProperties;
    renderElement?: (props: RenderElementProps) => JSX.Element;
    renderLeaf?: (props: RenderLeafProps) => JSX.Element;
  }

  type EditableType = (props: EditableProps) => JSX.Element;

  type PluginEditor = (editor: Editor) => Editor;

  type Decorate = (entry: NodeEntry, pluginProps?: any) => Range[];
  type OnDOMBeforeInput = (event: Event, editor: Editor) => void;
  type RenderElement = (props: RenderElementProps) => JSX.Element | undefined;
  type RenderLeaf = (props: RenderLeafProps) => JSX.Element;

  interface OnKeyDownProps {
    [key: string]: any;
    editor: Editor;
  }
  type OnKeyDown = (e: any, props: OnKeyDownProps) => void;

  interface Plugin {
    editor?: PluginEditor;
    decorate?: Decorate;
    onDOMBeforeInput?: OnDOMBeforeInput;
    renderElement?: RenderElement;
    renderLeaf?: RenderLeaf;
    onKeyDown?: OnKeyDown;
  }
}
