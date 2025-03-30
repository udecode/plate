import { basicMarksValue } from '../../../../apps/www/src/registry/default/examples/values/basic-marks-value';
import { createTestEditor } from './__tests__/createTestEditor';
import { deserializeMd } from './deserializer';
import { serializeMd } from './serializer';

const editor = createTestEditor();

describe('roundTrip', () => {
  it('should round trip basic marks', () => {
    const md = serializeMd(editor, { value: basicMarksValue });
    const slate = deserializeMd(editor, md);
    expect(slate).toEqual(basicMarksValue);
  });
});
