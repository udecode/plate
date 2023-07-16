import { createPlateUIEditor } from '@/plate/create-plate-ui-editor';
import { createTodoListPlugin } from '@udecode/plate-list';

import { serializeHtml } from '../../serializeHtml';

it('serialize elements using useSlateStatic', () => {
  const plugins = [createTodoListPlugin()];
  const editor = createPlateUIEditor({ plugins });
  const render = serializeHtml(editor, {
    nodes: [
      {
        type: 'action_item',
        checked: true,
        children: [{ text: 'Slide to the right.' }],
      },
    ],
  });

  expect(render).toContain('input type="checkbox"');
});
