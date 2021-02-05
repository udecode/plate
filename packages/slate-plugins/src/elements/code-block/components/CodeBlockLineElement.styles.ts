import {
  CodeBlockLineElementStyleProps,
  CodeBlockLineElementStyles,
} from '../types';

export const getCodeBlockLineElementStyles = ({
  className,
}: CodeBlockLineElementStyleProps): CodeBlockLineElementStyles => {
  return {
    root: [
      {
        // Insert css properties
        fontSize: '16px',
        backgroundColor: 'rgb(247, 246, 243)',
        whiteSpace: 'pre-wrap',
        fontFamily:
          'SFMono-Regular, Consolas, Monaco, "Liberation Mono", Menlo, Courier, monospace;',
        tabSize: '2',
        lineHeight: 'normal',
      },
      className,
    ],
  };
};
