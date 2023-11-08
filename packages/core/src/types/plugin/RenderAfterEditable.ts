import { TEditableProps } from '../slate-react/TEditableProps';

export type RenderAfterEditable = (
  editableProps: TEditableProps
) => React.ReactElement | null;
