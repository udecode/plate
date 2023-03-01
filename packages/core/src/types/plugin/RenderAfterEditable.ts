import { TEditableProps, Value } from '../../../../slate-utils/src/slate/index';

export type RenderAfterEditable<V extends Value = Value> = (
  editableProps: TEditableProps<V>
) => JSX.Element | null;
