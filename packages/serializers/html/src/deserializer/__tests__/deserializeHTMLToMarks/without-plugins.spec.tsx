import { createPlateEditor } from '../../../../../../plate/src/utils/createPlateEditor';
import { deserializeHTMLToMarks } from '../../utils/deserializeHTMLToMarks';

const input = {
  plugins: [{}],
  element: document.createElement('strong'),
  children: [{ text: 'test' }],
};

const output = [{ text: 'test' }];

it('should be', () => {
  expect(deserializeHTMLToMarks(createPlateEditor(), input)).toEqual(output);
});
