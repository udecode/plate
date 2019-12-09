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

  interface Plugin {
    editor?: PluginEditor;
    decorate?: (entry: NodeEntry, pluginProps?: any) => Range[];
    renderElement?: (props: RenderElementProps) => JSX.Element;
    renderLeaf?: (props: RenderLeafProps) => JSX.Element;
    onKeyDown?: (e: any, editor: Editor) => void;
  }
}
