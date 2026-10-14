import { DOMEditor } from 'slate-dom';

import { createEditor } from '../../create-editor';

describe('hasRange', () => {
  const editor = createEditor({
    children: [{ children: [{ text: 'abc' }], type: 'p' }] as any,
  });
  const inside = {
    anchor: { offset: 1, path: [0, 0] },
    focus: { offset: 1, path: [0, 0] },
  };
  const outside = {
    anchor: { offset: 0, path: [3, 0] },
    focus: { offset: 0, path: [3, 0] },
  };

  it('checks both points through the editor, the api and slate-dom', () => {
    expect(editor.api.hasRange(inside)).toBe(true);
    expect(editor.api.hasRange(outside)).toBe(false);
    expect((editor as any).hasRange(outside)).toBe(false);
    expect(DOMEditor.hasRange(editor as any, inside)).toBe(true);
  });

  it('returns false instead of throwing for a missing range', () => {
    expect(editor.api.hasRange(undefined as any)).toBe(false);
    expect(DOMEditor.hasRange(editor as any, null as any)).toBe(false);
  });
});
