import { createTestEditor } from './__test__/createTestEditor';
import { testValue } from './__test__/testValue';
import { serializeMd } from './serializeMd';

describe('serializeMd', () => {
  it('should serialize a simple paragraph', () => {
    const editor = createTestEditor();
    const result = serializeMd(editor as any, { value: testValue });
    expect(result).toMatchSnapshot();
  });
});
