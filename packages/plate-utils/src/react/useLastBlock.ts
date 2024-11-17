import { useEditorSelector } from '@udecode/plate-core/react';
import { getBlocks } from '@udecode/slate-utils';

export const useLastBlock = ({
  deps,
  enabled,
}: {
  enabled: boolean;
  deps?: React.DependencyList;
}) => {
  return useEditorSelector(
    (editor) => (enabled ? getBlocks(editor).at(-1)![0] : null),
    [enabled, ...(deps || [])]
  );
};
