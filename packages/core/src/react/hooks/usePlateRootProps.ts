import React from 'react';

import type { PliteProps } from '@platejs/plite-react';

import { getPlateEditorInstanceKey } from '../internal/getPlateEditorInstanceKey';
import { useEditor } from '../stores';

interface PlateRootProps extends Omit<PliteProps, 'children'> {
  key: React.Key;
}

/** Get the Plite root props stored in a Plate store. */
export const usePlateRootProps = ({ id }: { id?: string }): PlateRootProps => {
  const editor = useEditor({ id });

  return React.useMemo(
    () => ({
      key: getPlateEditorInstanceKey(editor),
      editor,
    }),
    [editor]
  );
};
