import { createEditorPlugins } from '../../../../../../plate/src/utils/createEditorPlugins';
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
