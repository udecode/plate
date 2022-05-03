import { Range } from 'slate';
import { EditableProps } from 'slate-react/dist/components/editable';
import { Value } from './TEditor';
import { ENodeEntry } from './TNodeEntry';
import { RenderElementFn } from './TRenderElementProps';
import { RenderLeafFn } from './TRenderLeafProps';

export type TEditableProps<V extends Value> = Omit<
  EditableProps,
  'decorate' | 'renderElement' | 'renderLeaf'
> & {
  decorate?: (entry: ENodeEntry<V>) => Range[];
  renderElement?: RenderElementFn<V>;
  renderLeaf?: RenderLeafFn<V>;
};
