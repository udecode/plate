import { createEditor } from 'slate';
import { onDOMBeforeInputPlugins } from 'components/EditablePlugins/utils';

const event = {} as Event;

it('should ', () => {
  const editor = createEditor();
  const onDOMBeforeInput = jest.fn();

  onDOMBeforeInputPlugins(editor, [], [])(event);
  onDOMBeforeInputPlugins(editor, [{}], [])(event);

  expect(onDOMBeforeInput).not.toHaveBeenCalled();
});
