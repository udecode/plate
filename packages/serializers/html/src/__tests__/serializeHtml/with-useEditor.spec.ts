import { createTodoListPlugin } from '@/packages/nodes/list/src/todo-list/createTodoListPlugin';
import { serializeHtml } from '@/packages/serializers/html/src/serializeHtml';
import { createPlateUIEditor } from '@/plate/createPlateUIEditor';

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

  expect(render).toBe(
    `<div class="slate-action_item"><div  contenteditable="false"><input  type="checkbox" checked=""/></div><span  contenteditable="true">Slide to the right.</span></div>`
  );
});
