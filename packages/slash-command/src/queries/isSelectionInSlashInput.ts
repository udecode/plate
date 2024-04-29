import { PlateEditor, Value } from '@udecode/plate-common';

import { findSlashInput } from '.';

export const isSelectionInSlashInput = <V extends Value>(
  editor: PlateEditor<V>
) => findSlashInput(editor) !== undefined;
