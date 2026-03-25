import { createSlateEditor } from '../editor';
import { AstPlugin } from './AstPlugin';

describe('AstPlugin', () => {
  it('declares the slate fragment mime type', () => {
    const editor = createSlateEditor();

    expect(editor.getPlugin(AstPlugin).parser.format).toBe(
      'application/x-slate-fragment'
    );
  });

  it('decodes and parses serialized slate fragments', () => {
    const editor = createSlateEditor();
    const fragment = [{ children: [{ text: 'alpha' }], type: 'p' }];
    const data = window.btoa(encodeURIComponent(JSON.stringify(fragment)));

    expect(
      editor.getPlugin(AstPlugin).parser.deserialize?.({
        data,
      } as any)
    ).toEqual(fragment);
  });

  it('returns undefined when the decoded payload is not valid json', () => {
    const editor = createSlateEditor();

    expect(
      editor.getPlugin(AstPlugin).parser.deserialize?.({
        data: window.btoa('%7Bbroken'),
      } as any)
    ).toBeUndefined();
  });
});
