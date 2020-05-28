import { createEditor } from 'slate';
import { onKeyDownPlugins } from 'components/EditablePlugins/utils';

const event = {} as Event;

it('should ', () => {
  const editor = createEditor();
  const onKeyDown = jest.fn();
  onKeyDownPlugins(editor, [{ onKeyDown }], [onKeyDown])(event);

  expect(onKeyDown).toHaveBeenCalledTimes(2);
});
