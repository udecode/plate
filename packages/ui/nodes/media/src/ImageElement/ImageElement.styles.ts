import { ResizableProps } from '@udecode/plate-media/dist/resizable/Resizable';
import { createStyles } from '@udecode/plate-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';
import {
  ImageElementPropsCaption,
  ImageElementStyleProps,
} from './ImageElement.types';

export const getResizableCss = ({
  focused,
  selected,
  align,
}: {
  focused?: boolean;
  selected?: boolean;
  align?: ResizableProps['align'];
} = {}) => {
  const handle = css`
    ${tw`flex flex-col justify-center absolute select-none w-6 h-full top-0 z-10`}

    ::after {
      ${tw`opacity-0`};
      ${focused && selected && tw`opacity-100`};
      ${tw`group-hover:opacity-100`};
      ${tw`flex`};
      ${tw`bg-gray-400`};

      content: ' ';
      width: 3px;
      height: 64px;
      border-radius: 6px;
    }

    :hover,
    :focus,
    :active {
      ::after {
        ${tw`bg-blue-500`};
      }
    }
  `;

  const resizable = [
    align === 'center' && tw`mx-auto`,
    align === 'right' && tw`ml-auto`,
  ];

  const handleLeft = [...handle, tw`-left-3 -ml-3 pl-3`];
  const handleRight = [...handle, tw`items-end -right-3 -mr-3 pr-3`];

  return {
    resizable,
    handleLeft,
    handleRight,
  };
};

export const getCaptionCss = ({
  align,
  caption,
}: {
  align?: ResizableProps['align'];
  caption?: ImageElementPropsCaption;
} = {}) => {
  return {
    figcaption: [
      align === 'center' && tw`mx-auto`,
      align === 'right' && tw`ml-auto`,
    ],
    caption: [
      tw`w-full border-none focus:outline-none mt-2 p-0 resize-none`,
      caption?.align === 'center' && tw`text-center`,
      caption?.align === 'right' && tw`text-right`,
      css`
        font: inherit;
        color: inherit;
        background-color: inherit;

        :focus {
          ::placeholder {
            opacity: 0;
          }
        }
      `,
    ],
  };
};

export const getImageElementStyles = (props: ImageElementStyleProps) => {
  const {
    focused,
    selected,
    align = 'center',
    caption = {
      align: 'center',
    },
  } = props;

  return createStyles(
    { prefixClassNames: 'ImageElement', ...props },
    {
      root: [tw`py-2.5`],

      figure: [tw`m-0 relative`],

      img: [
        tw`block max-w-full px-0 cursor-pointer w-full`,
        tw`rounded-[3px] object-cover`,
        focused && selected && tw`shadow-[0 0 0 1px rgb(59,130,249)]`,
      ],

      ...getCaptionCss({ caption, align }),
      ...getResizableCss({ selected, focused, align }),
    }
  );
};
