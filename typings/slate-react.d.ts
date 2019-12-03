import { Editor, Node, NodeEntry, Range } from 'slate';
import {
  RenderDecorationProps,
  RenderElementProps,
  RenderMarkProps,
} from 'slate-react';

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
    style?: Record<string, any>;
    renderDecoration?: (props: RenderDecorationProps) => JSX.Element;

    renderElement?: (props: RenderElementProps) => JSX.Element;
    renderMark?: (props: RenderMarkProps) => JSX.Element;
  }

  type EditableType = (props: EditableProps) => JSX.Element;

  type PluginEditor = (editor: Editor) => Editor;

  interface Plugin {
    [key: string]: any;
    editor?: PluginEditor;
    renderElement?: (props: RenderElementProps) => JSX.Element | undefined;
    renderMark?: (props: RenderMarkProps) => JSX.Element | undefined;
    onKeyDown?: (e: any, editor: Editor) => void;
  }
}
