import { formatCode, isValidSyntax } from './formatter';

describe('JsonFormatter', () => {
  it('should detect valid JSON', () => {
    const json = '{ "name": "ChatGPT", "type": "AI" }';
    const isValid = isValidSyntax(json, 'json');
    expect(isValid).toBe(true);
  });

  it('should detect invalid JSON', () => {
    const json = '{ name: "ChatGPT", type: AI }';
    const isValid = isValidSyntax(json, 'json');
    expect(isValid).toBe(false);
  });

  it('should format JSON', () => {
    const json = '{"name":"ChatGPT","type":"AI"}';
    const formattedJson = formatCode(json, 'json');
    const expected = `{
  "name": "ChatGPT",
  "type": "AI"
}`;
    expect(formattedJson).toBe(expected);
  });

  it('should not format invalid JSON', () => {
    const json = '{ name: "ChatGPT", type: AI }';
    const formattedJson = formatCode(json, 'json');
    expect(formattedJson).toBe(json);
  });
});
