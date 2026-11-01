import { createTestEditor } from '../__tests__/createTestEditor';
import { serializeMd } from '../serializer/serializeMd';
import { deserializeMd } from './deserializeMd';

describe('code block line endings', () => {
  const editor = createTestEditor();

  it.each([
    ['CRLF', '```js\r\nconst a = 1;\r\nconst b = 2;\r\n```\r\n'],
    ['CR', '```js\rconst a = 1;\rconst b = 2;\r```\r'],
  ])('matches the LF value for %s input', (_name, input) => {
    const lf = '```js\nconst a = 1;\nconst b = 2;\n```\n';
    const value = deserializeMd(editor, input);

    expect(value).toEqual(deserializeMd(editor, lf));
    expect(JSON.stringify(value)).not.toContain('\r');
    expect(serializeMd(editor, { value })).toBe(lf);
  });
});
