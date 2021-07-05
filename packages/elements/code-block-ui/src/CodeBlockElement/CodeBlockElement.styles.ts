import { createStyles, StyledElementProps } from '@udecode/slate-plugins-ui';

export const getCodeBlockElementStyles = (props: StyledElementProps) =>
  createStyles(
    { prefixClassNames: 'CodeBlockElement', ...props },
    {
      root: [
        {
          fontSize: '16px',
          padding: '12px 16px',
          backgroundColor: 'rgb(247, 246, 243)',
          borderRadius: '3px',
          whiteSpace: 'pre-wrap',
          fontFamily:
            'SFMono-Regular, Consolas, Monaco, "Liberation Mono", Menlo, Courier, monospace;',
          tabSize: '2',
          lineHeight: 'normal',
        },
      ],
    }
  );
