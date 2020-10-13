import { TodoListPlugin } from '../../../elements/todo-list/TodoListPlugin';
import { serializeHTMLFromNodes } from '../serializeHTMLFromNodes';

it('serialize elements using useEditor', () => {
  const render = serializeHTMLFromNodes({
    plugins: [TodoListPlugin()],
    nodes: [
      {
        type: 'action_item',
        checked: true,
        children: [{ text: 'Slide to the right.' }],
      },
    ],
  });

  expect(render).toBe(
    '<div class="slate-todo-list slate-todo-list-checked"><div contenteditable="false" ><input type="checkbox"  checked=""/></div><span  contenteditable="true">Slide to the right.</span></div>'
  );
});
