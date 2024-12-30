import { useMemo } from 'react';

import type { PlateEditor } from '@udecode/plate-core/react';

import { useLastBlock } from './useLastBlock';

interface UseLastBlockDOMNodeOptions {
  enabled: boolean;
  deps?: React.DependencyList;
}

export const useLastBlockDOMNode = (
  editor: PlateEditor,
  { deps, enabled }: UseLastBlockDOMNodeOptions
) => {
  const lastBlock = useLastBlock({ deps, enabled });

  const anchorElement = useMemo(
    () => (lastBlock ? editor.toDOMNode(lastBlock) : null)!,
    [editor, lastBlock]
  );

  return anchorElement;
};
