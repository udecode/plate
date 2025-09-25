import {
  type UseVirtualFloatingOptions,
  useVirtualFloating,
} from '@platejs/floating';
import { useEditorPlugin } from 'platejs/react';

import { LinkPlugin } from '../../LinkPlugin';

export const useVirtualFloatingLink = ({
  editorId,
  ...floatingOptions
}: { editorId: string } & UseVirtualFloatingOptions) => {
  const { setOption } = useEditorPlugin(LinkPlugin);

  return useVirtualFloating({
    onOpenChange: (open) => {
      setOption('openEditorId', open ? editorId : null);
    },
    ...floatingOptions,
  });
};
