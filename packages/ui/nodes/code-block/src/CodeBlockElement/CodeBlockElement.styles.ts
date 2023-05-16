import { TCodeBlockElement } from '@udecode/plate-code-block';
import { Value } from '@udecode/plate-common';
import {
  createStyles,
  PlateElementProps,
} from '@udecode/plate-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';

export const getCodeBlockElementStyles = <V extends Value>(
  props: PlateElementProps<V, TCodeBlockElement>
) =>
  createStyles(
    { prefixClassNames: 'CodeBlockElement', ...props },
    {
      root: [
        tw`whitespace-pre-wrap py-3 px-4`,
        css`
          font-size: 16px;
          font-family: SFMono-Regular, Consolas, Monaco, 'Liberation Mono',
            Menlo, Courier, monospace;
          tab-size: 2;
          line-height: normal;
          border-radius: 3px;
          background-color: rgb(247, 246, 243);
        `,
      ],
    }
  );
