import {
  useVirtualFloating,
  UseVirtualFloatingOptions,
} from '@udecode/plate-floating';

import { floatingLinkActions } from './floatingLinkStore';

export const useVirtualFloatingLink = ({
  editorId,
  ...floatingOptions
}: { editorId: string } & UseVirtualFloatingOptions) => {
  return useVirtualFloating({
    onOpenChange: (open) =>
      floatingLinkActions.openEditorId(open ? editorId : null),
    ...floatingOptions,
  });
};
