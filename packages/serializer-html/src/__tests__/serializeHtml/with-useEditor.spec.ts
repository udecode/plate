import { createTodoListPlugin } from '@/packages/list/src/todo-list/createTodoListPlugin';
import { serializeHtml } from '@/packages/serializer-html/src/serializeHtml';
import { createPlateUIEditor } from '@/plate/create-plate-ui-editor';

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
