import {
  Plate,
  PlateContent,
  createPlugins,
  createTablePlugin,
} from '@udecode/plate';

import { createPlateUI } from '@/plate/create-plate-ui';

import { useVariant } from './useVariant';

export function TableApp() {
  const {
    colSizes,
    disableMarginLeft = false,
    initialTableWidth,
    readOnly = false,
  } = useVariant({
    auto: {
      colSizes: undefined,
      initialTableWidth: undefined,
    },
    disableMarginLeft: {
      colSizes: [350, 150],
      disableMarginLeft: true,
      initialTableWidth: 500,
    },
    fixed: {
      colSizes: [350, 150],
      initialTableWidth: 500,
    },
    readOnly: {
      colSizes: [350, 150],
      initialTableWidth: 500,
      readOnly: true,
    },
  });

  const plugins = createPlugins(
    [
      createTablePlugin({
        options: {
          disableMarginLeft,
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
      children: [
        {
          children: [
            {
              children: [{ text: 'Row 1, Cell 1' }],
              type: 'th',
            },
            {
              children: [{ text: 'Row 1, Cell 2' }],
              type: 'th',
            },
          ],
          type: 'tr',
        },
        {
          children: [
            {
              children: [{ text: 'Row 2, Cell 1' }],
              type: 'td',
            },
            {
              children: [{ text: 'Row 2, Cell 2' }],
              type: 'td',
            },
          ],
          type: 'tr',
        },
      ],
      colSizes,
      type: 'table',
    },
  ];

  return (
    <Plate initialValue={initialValue} plugins={plugins}>
      <PlateContent readOnly={readOnly} />
    </Plate>
  );
}
