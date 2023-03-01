import { Range } from 'slate';
import { EditableProps } from 'slate-react/dist/components/editable';
import { Value } from '../../../slate-utils/src/slate/editor/TEditor';
import { ENodeEntry } from '../../../slate-utils/src/slate/node/TNodeEntry';
import { RenderLeafFn } from '../../../slate-utils/src/slate/types/TRenderLeafProps';
import { RenderElementFn } from './TRenderElementProps';

export type TEditableProps<V extends Value = Value> = Omit<
  EditableProps,
  'decorate' | 'renderElement' | 'renderLeaf'
> & {
  decorate?: (entry: ENodeEntry<V>) => Range[];
  renderElement?: RenderElementFn<V>;
  renderLeaf?: RenderLeafFn<V>;
};
