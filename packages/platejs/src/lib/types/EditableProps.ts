import type { DOMRange } from '../../dom/plite-dom.internal';
import type { NodeEntry, Range } from '../../facade';
import type { Editor } from '../editor';
import type { RenderElementFn } from './RenderElementProps';
import type { RenderLeafFn } from './RenderLeafProps';
import type { RenderTextFn } from './RenderTextProps';

/** `EditableProps` are passed to the <Editable> component. */
export type EditableProps = {
  as?: any;
  disableDefaultStyles?: boolean;
  placeholder?: string;
  readOnly?: boolean;
  renderElement?: RenderElementFn;
  renderLeaf?: RenderLeafFn;
  renderText?: RenderTextFn;
  role?: string;
  style?: any;
  decorate?: (entry: NodeEntry) => Range[];
  domStrategy?: unknown;
  onDOMStrategyMetrics?: (metrics: unknown) => void;
  renderPlaceholder?: (props: {
    attributes: {
      contentEditable: boolean;
      'data-plite-placeholder': boolean;
      ref: (element: any) => void;
      style: any;
      dir?: 'rtl';
    };
    children: any;
  }) => any;
  scrollSelectionIntoView?: (editor: Editor, domRange: DOMRange) => void;
  onDOMBeforeInput?: (event: InputEvent) => void;
  [key: string]: unknown;
};
