import { createTodoListPlugin } from '@/nodes/list/src/todo-list/createTodoListPlugin';
import { createPlateUIEditor } from '@/plate/createPlateUIEditor';
import { serializeHtml } from '@/serializers/html/src/serializeHtml';

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
    `<div class="slate-TodoListElement slate-TodoListElement-rootChecked slate-action_item"><div contenteditable="false" class="slate-TodoListElement-checkboxWrapper"><input type="checkbox" class="slate-TodoListElement-checkbox" checked=""/></div><span class="slate-TodoListElement-text" contenteditable="true">Slide to the right.</span></div>`
  );
});
