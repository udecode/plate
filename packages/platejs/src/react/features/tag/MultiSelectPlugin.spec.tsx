import { createEditor } from '../../core';
import { MultiSelectPlugin } from './MultiSelectPlugin';

it('inherits the headless tag picker commands and uniqueness rules', () => {
  const editor = createEditor({
    plugins: [MultiSelectPlugin],
    initialValue: [{ type: 'paragraph', children: [{ text: '' }] }],
  });
  const picker = editor.plugin(MultiSelectPlugin);
  picker.update.insert({ value: 'alpha' }, { at: [0, 0] });
  picker.update.insert({ value: 'alpha' }, { at: [0, 0] });
  expect(picker.read.getSelectedItems()).toEqual([{ value: 'alpha' }]);
});
