import { createStyles, StyledElementProps } from '@udecode/slate-plugins-ui';
import { css } from 'styled-components';
import tw from 'twin.macro';

export const getCodeBlockElementStyles = (props: StyledElementProps) =>
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
