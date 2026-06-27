import type { JSX } from 'react';

import type { NodeEntry, Range } from '@platejs/plite';
import type { DOMRange } from '@platejs/plite-dom';

import type { BaseEditor } from '../editor';
import type { RenderElementFn } from './RenderElementProps';
import type { RenderLeafFn } from './RenderLeafProps';
import type { RenderTextFn } from './RenderTextProps';

/** `EditableProps` are passed to the <Editable> component. */
export type EditableProps = {
  as?: React.ElementType;
  disableDefaultStyles?: boolean;
  placeholder?: string;
  readOnly?: boolean;
  renderElement?: RenderElementFn;
  renderLeaf?: RenderLeafFn;
  renderText?: RenderTextFn;
  role?: string;
  style?: React.CSSProperties;
  decorate?: (entry: NodeEntry) => Range[];
  renderPlaceholder?: (props: {
    attributes: {
      contentEditable: boolean;
      'data-plite-placeholder': boolean;
      ref: React.RefCallback<any>;
      style: React.CSSProperties;
      dir?: 'rtl';
    };
    children: any;
  }) => JSX.Element;
  scrollSelectionIntoView?: (editor: BaseEditor, domRange: DOMRange) => void;
  onDOMBeforeInput?: (event: InputEvent) => void;
} & React.TextareaHTMLAttributes<HTMLDivElement>;
