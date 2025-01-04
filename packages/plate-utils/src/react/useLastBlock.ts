import { useEditorSelector } from '@udecode/plate-core/react';

export const useLastBlock = ({
  deps,
  enabled,
}: {
  enabled: boolean;
  deps?: React.DependencyList;
}) => {
  return useEditorSelector(
    (editor) => (enabled ? editor.api.blocks().at(-1)![0] : null),
    [enabled, ...(deps || [])]
  );
};
