import {
  createPlateUI,
  createPlugins,
  createTablePlugin,
  Plate,
} from '@udecode/plate';
import { useVariant } from './useVariant';

export const TableApp = () => {
  const { initialTableWidth, colSizes } = useVariant({
    auto: {
      initialTableWidth: undefined,
      colSizes: undefined,
    },
    fixed: {
      initialTableWidth: 500,
      colSizes: [350, 150],
    },
  });

  const plugins = createPlugins(
    [
      createTablePlugin({
        options: {
          initialTableWidth,
        },
      }),
    ],
    {
      components: createPlateUI(),
    }
  );

  const initialValue = [
    {
      type: 'table',
      colSizes,
      children: [
        {
          type: 'tr',
          children: [
            {
              type: 'th',
              children: [{ text: 'Row 1, Cell 1' }],
            },
            {
              type: 'th',
              children: [{ text: 'Row 1, Cell 2' }],
            },
          ],
        },
        {
          type: 'tr',
          children: [
            {
              type: 'td',
              children: [{ text: 'Row 2, Cell 1' }],
            },
            {
              type: 'td',
              children: [{ text: 'Row 2, Cell 2' }],
            },
          ],
        },
      ],
    },
  ];

  return <Plate plugins={plugins} initialValue={initialValue} />;
};
