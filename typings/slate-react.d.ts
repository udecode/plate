import 'slate-react'
import { Editor, NodeEntry, Range, Node } from 'slate'
import {
  CustomDecorationProps,
  CustomElementProps,
  CustomMarkProps,
} from 'slate-react/lib/components/custom'

declare module 'slate-react' {
  type SlateType = (props: {
    editor: Editor
    children: JSX.Element | JSX.Element[]
    defaultValue?: Node[]
    onChange?: (children: Node[], operations: Operation[]) => void
  }) => JSX.Element

  interface EditableProps extends React.TextareaHTMLAttributes<HTMLDivElement> {
    [key: string]: any
    decorate?: (entry: NodeEntry) => Range[]
    onDOMBeforeInput?: (event: Event) => void
    placeholder?: string
    readOnly?: boolean
    role?: string
    style?: Record<string, any>
    renderDecoration?: (props: CustomDecorationProps) => JSX.Element

    renderElement?: (props: CustomElementProps) => JSX.Element
    renderMark?: (props: CustomMarkProps) => JSX.Element
  }

  type EditableType = (props: EditableProps) => JSX.Element

  type PluginEditor = (editor: Editor) => Editor

  interface Plugin {
    [key: string]: any
    editor?: PluginEditor
    renderElement?: (props: CustomElementProps) => JSX.Element | undefined
    renderMark?: (props: CustomMarkProps) => JSX.Element | undefined
    onKeyDown?: (e: any, editor: Editor) => void
  }
}
