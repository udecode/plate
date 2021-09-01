import { createStyles } from '@udecode/plate-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { ImageElementStyleProps } from './ImageElement.types';

export const getImageElementStyles = (props: ImageElementStyleProps) =>
  createStyles(
    { prefixClassNames: 'ImageElement', ...props },
    {
      root: [tw`py-2.5`],
      figure: [tw`m-0 relative`],
      img: [
        tw`block max-w-full px-0 cursor-pointer`,
        tw`maxHeight[20em] borderRadius[3px]`,
        props.focused &&
          props.selected &&
          tw`boxShadow[0 0 0 1px rgb(59,130,249)]`,
      ],
      resizeWrapper: [tw`mx-auto`],
      captionInput: [
        tw`w-full text-center border-none focus:outline-none mt-2`,
        css`
          :focus {
            ::placeholder {
              opacity: 0;
            }
          }
        `,
      ],
      handle: [
        css`
          ${tw`flex flex-col justify-center items-end absolute select-none`}
          ${tw`w-6 h-full top-0 -right-3 z-10 -mr-3 pr-3`}
        
          ::after {
            ${tw`opacity-0`}
            ${props.focused && props.selected && tw`opacity-100`}
            ${tw`group-hover:opacity-100`}
            ${tw`flex`}
            ${tw`bg-gray-400`}
                
            content: ' ';
            width: 3px;
            height: 64px;
            border-radius: 6px;
          }

          :hover,
          :focus,
          :active {
            ::after {
              ${tw`bg-blue-500`}
            }
          }
        `,
      ],
    }
  );
