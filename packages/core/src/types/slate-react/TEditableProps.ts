import { RenderLeafFn, TNodeEntry } from '@udecode/slate';
import { Range } from 'slate';
import { EditableProps } from 'slate-react/dist/components/editable';

import { RenderElementFn } from './TRenderElementProps';

/**
 * `EditableProps` are passed to the <Editable> component.
 */
export type TEditableProps = Omit<
  EditableProps,
  'decorate' | 'renderElement' | 'renderLeaf'
> & {
  decorate?: (entry: TNodeEntry) => Range[];
  renderElement?: RenderElementFn;
  renderLeaf?: RenderLeafFn;
};
