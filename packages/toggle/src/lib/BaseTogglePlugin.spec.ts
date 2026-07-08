import { createSlateEditor } from 'platejs';

import { BaseTogglePlugin } from './BaseTogglePlugin';

describe('BaseTogglePlugin', () => {
  it('tracks open ids and respects explicit force overrides', () => {
    const editor = createSlateEditor({
      plugins: [BaseTogglePlugin],
    });

    expect(editor.plugin(BaseTogglePlugin).getOptions().openIds).toEqual(new Set());

    editor.getApi(BaseTogglePlugin).toggle.toggleIds(['a', 'b']);

    expect(
      [...(editor.plugin(BaseTogglePlugin).getOptions().openIds ?? new Set())].sort()
    ).toEqual(['a', 'b']);

    editor.getApi(BaseTogglePlugin).toggle.toggleIds(['b'], false);

    expect([
      ...(editor.plugin(BaseTogglePlugin).getOptions().openIds ?? new Set()),
    ]).toEqual(['a']);

    editor.getApi(BaseTogglePlugin).toggle.toggleIds(['a', 'c'], true);

    expect(
      [...(editor.plugin(BaseTogglePlugin).getOptions().openIds ?? new Set())].sort()
    ).toEqual(['a', 'c']);
  });
});
