import type { DOMRange, Editor, NodeEntry, TRange } from '@udecode/slate';

import type { RenderElementFn } from './RenderElementProps';
import type { RenderLeafFn } from './RenderLeafProps';

import type { JSX } from "react";

/** `EditableProps` are passed to the <Editable> component. */
export type EditableProps = {
  renderPlaceholder?: (props: {
    attributes: {
      contentEditable: boolean;
      'data-slate-placeholder': boolean;
      ref: React.RefCallback<any>;
      style: React.CSSProperties;
      dir?: 'rtl';
    };
    children: any;
  }) => JSX.Element;
  as?: React.ElementType;
  decorate?: (entry: NodeEntry) => TRange[];
  disableDefaultStyles?: boolean;
  placeholder?: string;
  readOnly?: boolean;
  renderElement?: RenderElementFn;
  renderLeaf?: RenderLeafFn;
  role?: string;
  scrollSelectionIntoView?: (editor: Editor, domRange: DOMRange) => void;
  style?: React.CSSProperties;
  onDOMBeforeInput?: (event: InputEvent) => void;
} & React.TextareaHTMLAttributes<HTMLDivElement>;
