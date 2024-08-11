import type { TNodeEntry } from '@udecode/slate';
import type { Range } from 'slate';
import type { EditableProps } from 'slate-react/dist/components/editable';

import type { RenderElementFn } from './TRenderElementProps';
import type { RenderLeafFn } from './TRenderLeafProps';

/** `EditableProps` are passed to the <Editable> component. */
export type TEditableProps = {
  decorate?: (entry: TNodeEntry) => Range[];
  renderElement?: RenderElementFn;
  renderLeaf?: RenderLeafFn;
} & Omit<EditableProps, 'decorate' | 'renderElement' | 'renderLeaf'>;
