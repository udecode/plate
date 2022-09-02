import { createStyles } from '@udecode/plate-styled-components';
import tw from 'twin.macro';
import { ThreadCommentEditingProps } from './ThreadCommentEditing.types';

export const getThreadCommentEditingStyles = (
  props: ThreadCommentEditingProps
) => {
  const buttonStyle = tw`relative inline-block text-center whitespace-nowrap outline-none align-middle rounded shadow-none box-border font-medium text-sm leading-4 select-none cursor-pointer px-4 w-20`;

  return createStyles(
    {
      prefixClassNames: 'ThreadCommentEditing',
      ...props,
    },
    {
      root: [
        tw`font-normal text-black whitespace-normal text-sm cursor-default relative bg-white p-3 block pt-0 text-left`,
      ],
      buttons: [
        tw`flex gap-2 font-normal text-black whitespace-normal text-sm cursor-pointer text-left pt-2 ml-auto mr-4 w-min`,
      ],
      commentButton: [buttonStyle, tw`h-6 bg-blue-600 text-white`],
      cancelButton: [
        buttonStyle,
        tw`bg-white h-6 text-red-600 box-border border border-red-600`,
      ],
    }
  );
};
