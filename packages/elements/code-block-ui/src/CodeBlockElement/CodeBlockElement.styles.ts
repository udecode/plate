import { ClassName, RootStyleSet } from '@udecode/slate-plugins-ui-fluent';

export const getCodeBlockElementStyles = ({
  className,
}: ClassName): RootStyleSet => ({
  root: [
    {
      // Insert css properties
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
    className,
  ],
});
