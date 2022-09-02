import { createStyles } from '@udecode/plate-styled-components';
import tw from 'twin.macro';
import { AssignedToHeaderStyleProps } from './AssignedToHeader.types';

export const getAssignedToHeaderStyles = (
  props: AssignedToHeaderStyleProps
) => {
  const { isAssignedToLoggedInUser } = props;

  return createStyles(
    {
      prefixClassNames: 'AssignedToHeader',
      ...props,
    },
    {
      root: [
        tw`flex items-center rounded-t-lg p-3 border-b-2 border-gray-600`,
        isAssignedToLoggedInUser
          ? tw`bg-blue-600 text-white`
          : tw`bg-blue-200 text-gray-400`,
      ],
      avatar: [tw`mr-2`],
      assignedTo: [tw`flex items-center content-center gap-1`],
      assignedToLabel: [tw`text-xs`],
      assignedToDisplayName: [tw`text-sm font-medium`],
      done: [tw`flex items-center content-center ml-auto gap-2`],
    }
  );
};
