import { ClassName, RootStyleSet } from '@udecode/slate-plugins-ui-fluent';

export const getTableElementStyles = ({
  className,
}: ClassName): RootStyleSet => ({
  root: [
    {
      // Insert css properties
      margin: '10px 0',
      borderCollapse: 'collapse',
      width: '100%',
    },
    className,
  ],
});
