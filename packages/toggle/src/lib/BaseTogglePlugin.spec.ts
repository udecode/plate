import { createSlateEditor } from 'platejs';
import { createPlateEditor } from 'platejs/react';

import { BaseTogglePlugin } from './BaseTogglePlugin';

describe('BaseTogglePlugin', () => {
  it('tracks open ids and respects explicit force overrides', () => {
    const editor = createSlateEditor({
      plugins: [BaseTogglePlugin],
    });

    expect(editor.getOptions(BaseTogglePlugin).openIds).toEqual(new Set());

    editor.getPluginApi(BaseTogglePlugin).toggle.toggleIds(['a', 'b']);

    expect(
      [...(editor.getOptions(BaseTogglePlugin).openIds ?? new Set())].sort()
    ).toEqual(['a', 'b']);

    editor.getPluginApi(BaseTogglePlugin).toggle.toggleIds(['b'], false);

    expect([
      ...(editor.getOptions(BaseTogglePlugin).openIds ?? new Set()),
    ]).toEqual(['a']);

    editor.getPluginApi(BaseTogglePlugin).toggle.toggleIds(['a', 'c'], true);

    expect(
      [...(editor.getOptions(BaseTogglePlugin).openIds ?? new Set())].sort()
    ).toEqual(['a', 'c']);
  });

  it('tracks open ids on the Slate v2 runtime route', () => {
    const editor = createPlateEditor({
      plugins: [BaseTogglePlugin],
      runtime: 'slate-v2',
    });
    const api = editor.getPluginApi<{
      toggle: {
        toggleIds: (ids: string[], force?: boolean | null) => void;
      };
    }>(BaseTogglePlugin);
    const getOpenIds = () =>
      editor.getOptions<{ openIds?: Set<string> }>(BaseTogglePlugin).openIds ??
      new Set<string>();

    api.toggle.toggleIds(['a', 'b']);

    expect([...getOpenIds()].sort()).toEqual(['a', 'b']);

    api.toggle.toggleIds(['b'], false);

    expect([...getOpenIds()]).toEqual(['a']);

    api.toggle.toggleIds(['a', 'c'], true);

    expect([...getOpenIds()].sort()).toEqual(['a', 'c']);
  });
});
