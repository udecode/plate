import { Range } from 'slate';
import { EditableProps } from 'slate-react/dist/components/editable';
import { Value } from '../editor/TEditor';
import { ENodeEntry } from '../node/TNodeEntry';
import { RenderElementFn } from './TRenderElementProps';
import { RenderLeafFn } from './TRenderLeafProps';

export type TEditableProps<V extends Value = Value> = Omit<
  EditableProps,
  'decorate' | 'renderElement' | 'renderLeaf'
> & {
  decorate?: (entry: ENodeEntry<V>) => Range[];
  renderElement?: RenderElementFn<V>;
  renderLeaf?: RenderLeafFn<V>;
};
