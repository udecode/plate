import {
  ELEMENT_LI,
  ELEMENT_LIC,
  ELEMENT_TODO_LI,
  ELEMENT_UL,
  createListPlugin,
  createTodoListPlugin,
} from '@udecode/plate-list';
import { createPlateUIEditor } from 'www/src/lib/plate/create-plate-ui-editor';

import { serializeHtml } from '../../serializeHtml';

it('serialize elements using useSlateStatic', () => {
  const plugins = [
    createTodoListPlugin(),
    createListPlugin({
      overrideByKey: {
        [ELEMENT_LI]: {
          type: 'list-item',
        },
        [ELEMENT_LIC]: {
          type: 'list-item-child',
        },
        [ELEMENT_UL]: {
          type: 'unordered-list',
        },
      },
    }),
  ];
  const editor = createPlateUIEditor({ plugins });
  const render = serializeHtml(editor, {
    nodes: [
      {
        checked: true,
        children: [{ text: 'Slide to the right.' }],
        type: ELEMENT_TODO_LI,
      },
      {
        children: [
          {
            children: [
              {
                children: [{ text: 'Level 3' }],
                type: 'list-item-child',
              },
            ],
            type: 'list-item',
          },
        ],
        type: 'unordered-list',
      },
    ],
  });

  expect(render).toContain('type="button" role="checkbox"');
});
