import { createStyles } from '@udecode/plate-styled-components';
import tw from 'twin.macro';
import { ThreadLinkDialogStyleProps } from './ThreadLinkDialog.types';

export const getThreadLinkDialogStyles = (props: ThreadLinkDialogStyleProps) =>
  createStyles(
    {
      prefixClassNames: 'ThreadLinkDialog',
      ...props,
    },
    {
      root: [],
      closeButton: [tw`w-8 h-8 p-2`],
      icon: [tw`relative -top-2.5 -left-1.5 w-4 h-4`],
    }
  );
