import {
  createListPlugin,
  createTodoListPlugin,
  ELEMENT_LI,
  ELEMENT_LIC,
  ELEMENT_TODO_LI,
  ELEMENT_UL,
} from '@udecode/plate-list';
import { createPlateUIEditor } from 'www/src/lib/plate/create-plate-ui-editor';

import { serializeHtml } from '../../serializeHtml';

it('serialize elements using useSlateStatic', () => {
  const plugins = [
    createTodoListPlugin(),
    createListPlugin({
      overrideByKey: {
        [ELEMENT_UL]: {
          type: 'unordered-list',
        },
        [ELEMENT_LI]: {
          type: 'list-item',
        },
        [ELEMENT_LIC]: {
          type: 'list-item-child',
        },
      },
    }),
  ];
  const editor = createPlateUIEditor({ plugins });
  const render = serializeHtml(editor, {
    nodes: [
      {
        type: ELEMENT_TODO_LI,
        checked: true,
        children: [{ text: 'Slide to the right.' }],
      },
      {
        type: 'unordered-list',
        children: [
          {
            type: 'list-item',
            children: [
              {
                type: 'list-item-child',
                children: [{ text: 'Level 3' }],
              },
            ],
          },
        ],
      },
    ],
  });

  expect(render).toContain('type="button" role="checkbox"');
});
