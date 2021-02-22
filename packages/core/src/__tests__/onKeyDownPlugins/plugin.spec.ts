import { createEditor } from 'slate';
import { onKeyDownPlugins } from '../../utils';

const event = {} as Event;

it('should', () => {
  const editor = createEditor();
  const onKeyDown = jest.fn();
  onKeyDownPlugins(editor, [onKeyDown])(event);

  expect(onKeyDown).toHaveBeenCalledTimes(1);
});
