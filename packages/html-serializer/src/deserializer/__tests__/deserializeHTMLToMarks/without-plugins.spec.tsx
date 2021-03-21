import { createEditorPlugins } from '../../../../../slate-plugins/src/__fixtures__/editor.fixtures';
import { deserializeHTMLToMarks } from '../../utils/deserializeHTMLToMarks';

const input = {
  plugins: [{}],
  element: document.createElement('strong'),
  children: [{ text: 'test' }],
};

const output = [{ text: 'test' }];

it('should be', () => {
  expect(deserializeHTMLToMarks(createEditorPlugins(), input)).toEqual(output);
});
