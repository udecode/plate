import { createPlateEditor } from '@platejs/core/react';
import { BaseParagraphPlugin } from '@platejs/core';
import { BaseIndentPlugin } from '@platejs/indent';
import { KEYS } from '@platejs/utils';

import { TogglePlugin } from '../TogglePlugin';
import { buildToggleIndex } from '../toggleIndexAtom';
import { findElementIdsHiddenInToggle } from './findElementIdsHiddenInToggle';
import { getEnclosingToggleIds } from './getEnclosingToggleIds';
import { getLastEntryEnclosedInToggle } from './getLastEntryEnclosedInToggle';
import { isInClosedToggle } from './isInClosedToggle';

describe('toggle queries', () => {
  const plugins = [
    BaseIndentPlugin.configure({
      config: {
        targets: [BaseParagraphPlugin, TogglePlugin],
      },
    }),
    TogglePlugin,
  ];
  const value = [
    { children: [{ text: 'toggle' }], id: 't1', type: KEYS.toggle },
    { children: [{ text: 'one' }], id: 'p1', indent: 1, type: KEYS.p },
    { children: [{ text: 'two' }], id: 'p2', indent: 1, type: KEYS.p },
    { children: [{ text: 'three' }], id: 'p3', indent: 0, type: KEYS.p },
  ];

  it('finds the last top-level entry enclosed by a toggle id', () => {
    const editor = createPlateEditor({
      plugins,
      value,
    });

    expect(getLastEntryEnclosedInToggle(editor, 't1')).toEqual([value[2], [2]]);
  });

  it('detects hidden ids and closed toggle state from the toggle index', () => {
    const editor = createPlateEditor({
      plugins,
      value,
    });
    const toggleIndex = buildToggleIndex(editor.read.children());

    editor.plugin(TogglePlugin).setOption('toggleIndex', toggleIndex);

    expect(
      findElementIdsHiddenInToggle(new Set(), editor.read.children())
    ).toEqual(['p1', 'p2']);
    expect(getEnclosingToggleIds(editor, 'p1')).toEqual(['t1']);
    expect(isInClosedToggle(editor, 'p1')).toBe(true);

    editor.api.toggle.toggleIds(['t1'], true);

    expect(isInClosedToggle(editor, 'p1')).toBe(false);
  });
});
