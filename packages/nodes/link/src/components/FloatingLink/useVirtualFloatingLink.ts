import {
  flip,
  offset,
  useVirtualFloating,
  UseVirtualFloatingOptions,
} from '@udecode/plate-floating';
import { floatingLinkActions } from './floatingLinkStore';

export const useVirtualFloatingLink = (
  floatingOptions?: UseVirtualFloatingOptions
) => {
  return useVirtualFloating({
    placement: 'bottom-start',
    onOpenChange: floatingLinkActions.open,
    middleware: [
      offset(12),
      flip({
        padding: 96,
      }),
    ],
    ...floatingOptions,
  });
};
