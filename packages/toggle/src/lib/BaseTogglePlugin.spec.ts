import { createSlateEditor } from 'platejs';

import { BaseTogglePlugin } from './BaseTogglePlugin';

describe('BaseTogglePlugin', () => {
  it('tracks open ids and respects explicit force overrides', () => {
    const editor = createSlateEditor({
      plugins: [BaseTogglePlugin],
    });

    expect(editor.getOptions(BaseTogglePlugin).openIds).toEqual(new Set());

    editor.getApi(BaseTogglePlugin).toggle.toggleIds(['a', 'b']);

    expect(
      [...(editor.getOptions(BaseTogglePlugin).openIds ?? new Set())].sort()
    ).toEqual(['a', 'b']);

    editor.getApi(BaseTogglePlugin).toggle.toggleIds(['b'], false);

    expect([
      ...(editor.getOptions(BaseTogglePlugin).openIds ?? new Set()),
    ]).toEqual(['a']);

    editor.getApi(BaseTogglePlugin).toggle.toggleIds(['a', 'c'], true);

    expect(
      [...(editor.getOptions(BaseTogglePlugin).openIds ?? new Set())].sort()
    ).toEqual(['a', 'c']);
  });
});
