import { createBaseEditor } from '@platejs/core';

import { BaseTogglePlugin } from './BaseTogglePlugin';

describe('BaseTogglePlugin', () => {
  it('tracks open ids and respects explicit force overrides', () => {
    const editor = createBaseEditor({
      plugins: [BaseTogglePlugin],
    });

    expect(editor.read.schema.createAndFill(BaseTogglePlugin)).toEqual({
      children: [{ text: '' }],
      type: BaseTogglePlugin.type,
    });
    expect(editor.read.schema.element(BaseTogglePlugin)?.groups).toContain(
      'block'
    );
    expect(editor.plugin(BaseTogglePlugin).getOptions().openIds).toEqual(
      new Set()
    );

    editor.api.toggle.toggleIds(['a', 'b']);

    expect(
      [
        ...(editor.plugin(BaseTogglePlugin).getOptions().openIds ?? new Set()),
      ].sort()
    ).toEqual(['a', 'b']);

    editor.api.toggle.toggleIds(['b'], false);

    expect([
      ...(editor.plugin(BaseTogglePlugin).getOptions().openIds ?? new Set()),
    ]).toEqual(['a']);

    editor.api.toggle.toggleIds(['a', 'c'], true);

    expect(
      [
        ...(editor.plugin(BaseTogglePlugin).getOptions().openIds ?? new Set()),
      ].sort()
    ).toEqual(['a', 'c']);
  });
});
