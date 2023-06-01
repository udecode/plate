import { createPlugins, createTablePlugin, Plate } from '@udecode/plate';
import { useVariant } from './useVariant';

import { createPlateUI } from '@/plate/createPlateUI';

export function TableApp() {
  const {
    initialTableWidth,
    colSizes,
    readOnly = false,
    disableMarginLeft = false,
  } = useVariant({
    auto: {
      initialTableWidth: undefined,
      colSizes: undefined,
    },
    fixed: {
      initialTableWidth: 500,
      colSizes: [350, 150],
    },
    readOnly: {
      initialTableWidth: 500,
      colSizes: [350, 150],
      readOnly: true,
    },
    disableMarginLeft: {
      initialTableWidth: 500,
      colSizes: [350, 150],
      disableMarginLeft: true,
    },
  });

  const plugins = createPlugins(
    [
      createTablePlugin({
        options: {
          initialTableWidth,
          disableMarginLeft,
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

  return (
    <Plate
      plugins={plugins}
      initialValue={initialValue}
      editableProps={{ readOnly }}
    />
  );
}
