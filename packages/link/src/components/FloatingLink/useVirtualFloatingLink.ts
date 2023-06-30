import {
  UseVirtualFloatingOptions,
  flip,
  offset,
  useVirtualFloating,
} from '@udecode/plate-floating';

import { floatingLinkActions } from './floatingLinkStore';

export const useVirtualFloatingLink = ({
  editorId,
  ...floatingOptions
}: { editorId: string } & UseVirtualFloatingOptions) => {
  return useVirtualFloating({
    placement: 'bottom-start',
    onOpenChange: (open) =>
      floatingLinkActions.openEditorId(open ? editorId : null),
    middleware: [
      offset(12),
      flip({
        padding: 96,
      }),
    ],
    ...floatingOptions,
  });
};
