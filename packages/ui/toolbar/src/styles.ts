import { cn, cva } from '@udecode/plate-styled-components';

export const floatingVariants = cva('', {
  variants: {
    type: {
      root: cn(
        '!z-40 w-auto bg-white',
        'rounded-[4px] shadow-[rgb(15_15_15_/_5%)_0_0_0_1px,_rgb(15_15_15_/_10%)_0_3px_6px,_rgb(15_15_15_/_20%)_0_9px_24px]'
      ),
      row: 'flex flex-row items-center px-2 py-1',
      button: cn(),
    },
  },
});

// export const floatingRowCss = css`
//   ${tw``};
// `;
//
// export const floatingButtonCss = [...plateButtonCss, tw`px-1`];
//
// export const FloatingIconWrapper = styled.div`
//   ${tw`flex items-center px-2 text-gray-400`};
// `;
//
// export const FloatingInputWrapper = styled.div`
//   ${tw`flex items-center py-1 pr-2`};
// `;
//
// export const floatingInputCss = [
//   tw`border-none bg-transparent h-8 flex-grow p-0`,
//   tw`focus:outline-none`,
//   css`
//     line-height: 20px;
//   `,
// ];
