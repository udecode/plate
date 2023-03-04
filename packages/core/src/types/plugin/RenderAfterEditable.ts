import { Value } from '@udecode/slate-utils/src';
import { TEditableProps } from '../TEditableProps';

export type RenderAfterEditable<V extends Value = Value> = (
  editableProps: TEditableProps<V>
) => JSX.Element | null;
