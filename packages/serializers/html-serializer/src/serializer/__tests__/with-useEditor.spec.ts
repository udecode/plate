import { getSlateClass } from '@udecode/slate-plugins-common';
import { CLASS_TODO_LIST_CHECKED } from '../../../../../elements/list/src/todo-list/constants';
import { ELEMENT_TODO_LI } from '../../../../../elements/list/src/todo-list/defaults';
import { useTodoListPlugin } from '../../../../../elements/list/src/todo-list/useTodoListPlugin';
import { createEditorPlugins } from '../../../../../slate-plugins/src/utils/createEditorPlugins';
import { serializeHTMLFromNodes } from '../serializeHTMLFromNodes';

it('serialize elements using useSlateStatic', () => {
  const plugins = [useTodoListPlugin()];
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
