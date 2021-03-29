import { getSlateClass } from '@udecode/slate-plugins-core';
import { CLASS_TODO_LIST_CHECKED } from '../../../../../elements/list/src/todo-list/constants';
import { createTodoListPlugin } from '../../../../../elements/list/src/todo-list/createTodoListPlugin';
import { ELEMENT_TODO_LI } from '../../../../../elements/list/src/todo-list/defaults';
import { createEditorPlugins } from '../../../../../slate-plugins/src/utils/createEditorPlugins';
import { serializeHTMLFromNodes } from '../serializeHTMLFromNodes';

it('serialize elements using useSlateStatic', () => {
  const plugins = [createTodoListPlugin()];
  const editor = createEditorPlugins({ plugins });
  const render = serializeHTMLFromNodes(editor, {
    plugins,
    nodes: [
      {
        type: 'action_item',
        checked: true,
        children: [{ text: 'Slide to the right.' }],
      },
    ],
  });

  expect(render).toBe(
    `<div class="${getSlateClass(
      ELEMENT_TODO_LI
    )} ${CLASS_TODO_LIST_CHECKED}"><div contenteditable="false" ><input type="checkbox"  checked=""/></div><span  contenteditable="true">Slide to the right.</span></div>`
  );
});
