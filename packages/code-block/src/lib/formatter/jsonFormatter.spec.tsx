import { createEditor } from '@udecode/plate';
import { createPlateEditor } from '@udecode/plate/react';

import { formatCode, isValidSyntax } from './formatter';

describe('JsonFormatter', () => {
  it('should detect valid JSON', () => {
    const json = '{ "name": "ChatGPT", "type": "AI" }';
    const isValid = isValidSyntax(json);
    expect(isValid).toBe(true);
  });

  it('should detect invalid JSON', () => {
    const editor = createEditor();
    const plateEditor = createPlateEditor({ editor });
    const json = '{ name: "ChatGPT", type: AI }';
    const isValid = isValidSyntax(json);
    expect(isValid).toBe(false);
  });

  it('should format JSON', () => {
    const editor = createEditor();
    const plateEditor = createPlateEditor({ editor });
    const json = '{"name":"ChatGPT","type":"AI"}';
    const formattedJson = formatCode(json);
    const expected = `{
  "name": "ChatGPT",
  "type": "AI"
}`;
    expect(formattedJson).toBe(expected);
  });

  it('should not format invalid JSON', () => {
    const editor = createEditor();
    const plateEditor = createPlateEditor({ editor });
    const json = '{ name: "ChatGPT", type: AI }';
    const formattedJson = formatCode(json);
    expect(formattedJson).toBe(json);
  });
});
