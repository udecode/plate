import { createBasePlateEditor } from 'platejs';
import { createPlateEditor } from 'platejs/react';

import { BaseTogglePlugin } from './BaseTogglePlugin';

describe('BaseTogglePlugin', () => {
  it('tracks open ids and respects explicit force overrides', () => {
    const editor = createBasePlateEditor({
      plugins: [BaseTogglePlugin],
    });

    expect(editor.getOptions(BaseTogglePlugin).openIds).toEqual(new Set());

    editor.api.toggle.toggleIds(['a', 'b']);

    expect(
      [...(editor.getOptions(BaseTogglePlugin).openIds ?? new Set())].sort()
    ).toEqual(['a', 'b']);

    editor.api.toggle.toggleIds(['b'], false);

    expect([
      ...(editor.getOptions(BaseTogglePlugin).openIds ?? new Set()),
    ]).toEqual(['a']);

    editor.api.toggle.toggleIds(['a', 'c'], true);

    expect(
      [...(editor.getOptions(BaseTogglePlugin).openIds ?? new Set())].sort()
    ).toEqual(['a', 'c']);
  });

  it('tracks open ids on the Plite runtime route', () => {
    const editor = createPlateEditor({
      plugins: [BaseTogglePlugin],
    });
    const getOpenIds = () =>
      editor.getOptions<{ openIds?: Set<string> }>(BaseTogglePlugin).openIds ??
      new Set<string>();

    editor.api.toggle.toggleIds(['a', 'b']);

    expect([...getOpenIds()].sort()).toEqual(['a', 'b']);

    editor.api.toggle.toggleIds(['b'], false);

    expect([...getOpenIds()]).toEqual(['a']);

    editor.api.toggle.toggleIds(['a', 'c'], true);

    expect([...getOpenIds()].sort()).toEqual(['a', 'c']);
  });
});
