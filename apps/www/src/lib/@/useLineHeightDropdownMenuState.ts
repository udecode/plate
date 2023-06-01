import { getPluginInjectProps, KEY_LINE_HEIGHT } from '@udecode/plate';
import { useEventPlateId } from '@udecode/plate-common';

import { useMyPlateEditorRef } from '@/types/plate.types';

export const useLineHeightDropdownMenuState = () => {
  const editor = useMyPlateEditorRef(useEventPlateId());

  const { validNodeValues: values = [] } = getPluginInjectProps(
    editor,
    KEY_LINE_HEIGHT
  );

  return { values };
};
