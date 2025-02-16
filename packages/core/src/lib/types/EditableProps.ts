import type { JSX } from 'react';

import type { DOMRange, Editor, NodeEntry, TRange } from '@udecode/slate';

import type { RenderElementFn } from './RenderElementProps';
import type { RenderLeafFn } from './RenderLeafProps';

/** `EditableProps` are passed to the <Editable> component. */
export type EditableProps = {
  as?: React.ElementType;
  disableDefaultStyles?: boolean;
  placeholder?: string;
  readOnly?: boolean;
  renderElement?: RenderElementFn;
  renderLeaf?: RenderLeafFn;
  role?: string;
  style?: React.CSSProperties;
  decorate?: (entry: NodeEntry) => TRange[];
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
  scrollSelectionIntoView?: (editor: Editor, domRange: DOMRange) => void;
  onDOMBeforeInput?: (event: InputEvent) => void;
} & React.TextareaHTMLAttributes<HTMLDivElement>;
