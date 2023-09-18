import { RenderLeafFn, TNodeEntry } from '@udecode/slate';
import { Range } from 'slate';
import { EditableProps } from 'slate-react/dist/components/editable';

import { PlateId } from '../../stores/index';
import { RenderElementFn } from './TRenderElementProps';

/**
 * `EditableProps` are passed to the <Editable> component.
 */
export type TEditableProps = Omit<
  EditableProps,
  'id' | 'decorate' | 'renderElement' | 'renderLeaf'
> & {
  id?: PlateId;
  decorate?: (entry: TNodeEntry) => Range[];
  renderElement?: RenderElementFn;
  renderLeaf?: RenderLeafFn;
};
