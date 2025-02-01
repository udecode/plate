import { formatJson, isValidJson } from './jsonFormatter';

describe('JsonFormatter', () => {
  it('should detect valid JSON', () => {
    const json = '{ "name": "ChatGPT", "type": "AI" }';
    const isValid = isValidJson(json);
    expect(isValid).toBe(true);
  });

  it('should detect invalid JSON', () => {
    const json = '{ name: "ChatGPT", type: AI }';
    const isValid = isValidJson(json);
    expect(isValid).toBe(false);
  });

  it('should format JSON', () => {
    const json = '{"name":"ChatGPT","type":"AI"}';
    const formattedJson = formatJson(json);
    const expected = `{
  "name": "ChatGPT",
  "type": "AI"
}`;
    expect(formattedJson).toBe(expected);
  });

  it('should not format invalid JSON', () => {
    const json = '{ name: "ChatGPT", type: AI }';
    const formattedJson = formatJson(json);
    expect(formattedJson).toBe(json);
  });
});
