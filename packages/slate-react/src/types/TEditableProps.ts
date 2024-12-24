import type { TEditor, TNodeEntry } from '@udecode/slate';
import type { Range } from 'slate';
import type { DOMRange } from 'slate-dom';

import type { RenderElementFn } from './TRenderElementProps';
import type { RenderLeafFn } from './TRenderLeafProps';

/** `EditableProps` are passed to the <Editable> component. */
export type TEditableProps = {
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
  decorate?: (entry: TNodeEntry) => Range[];
  disableDefaultStyles?: boolean;
  placeholder?: string;
  readOnly?: boolean;
  renderElement?: RenderElementFn;
  renderLeaf?: RenderLeafFn;
  role?: string;
  scrollSelectionIntoView?: (editor: TEditor, domRange: DOMRange) => void;
  style?: React.CSSProperties;
  onDOMBeforeInput?: (event: InputEvent) => void;
} & React.TextareaHTMLAttributes<HTMLDivElement>;
