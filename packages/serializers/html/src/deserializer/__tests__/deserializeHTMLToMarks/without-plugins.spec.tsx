import { createPlateUIEditor } from '../../../../../../plate/src/utils/createPlateUIEditor';
import { deserializeHTMLToMarks } from '../../utils/deserializeHTMLToMarks';

const input = {
  element: document.createElement('strong'),
  children: [{ text: 'test' }],
};

const output = [{ text: 'test' }];

it('should be', () => {
  expect(
    deserializeHTMLToMarks(
      createPlateUIEditor({
        plugins: [{ key: 'a' }],
      }),
      input
    )
  ).toEqual(output);
});
