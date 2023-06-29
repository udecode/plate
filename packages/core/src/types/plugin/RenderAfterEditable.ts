import { Value } from '@udecode/slate';

import { TEditableProps } from '../slate-react/TEditableProps';

export type RenderAfterEditable<V extends Value = Value> = (
  editableProps: TEditableProps<V>
) => JSX.Element | null;
