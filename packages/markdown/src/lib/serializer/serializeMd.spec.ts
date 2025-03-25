import { createTestEditor } from './__tests__/createTestEditor';
import { testValue } from './__tests__/testValue';
import { serializeMd } from './serializeMd';

describe('serializeMd', () => {
  it('should serialize a simple paragraph', () => {
    const editor = createTestEditor();
    const result = serializeMd(editor as any, { value: testValue });
    expect(result).toMatchSnapshot();
  });
});
