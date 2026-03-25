import { afterAll, beforeEach, describe, expect, it } from 'bun:test';
import * as actualPlatejs from 'platejs';

const getEditorPluginMock = mock();

mock.module('../toggleIndexAtom', () => ({
  buildToggleIndex: (elements: any[]) => {
    const result = new Map<string, string[]>();
    let current: [string, number][] = [];

    elements.forEach((element: any) => {
      const indent = element.indent ?? 0;
      current = current.filter(([_, parentIndent]) => parentIndent < indent);
      result.set(
        element.id,
        current.map(([id]) => id)
      );

      if (element.type === 'toggle') {
        current.push([element.id, indent]);
      }
    });

    return result;
  },
}));

mock.module('../TogglePlugin', () => ({
  TogglePlugin: { key: 'toggle' },
}));

mock.module('platejs', () => ({
  ...actualPlatejs,
  getEditorPlugin: getEditorPluginMock,
}));

describe('toggle queries', () => {
  beforeEach(() => {
    getEditorPluginMock.mockReset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('finds the last top-level entry enclosed by a toggle id', async () => {
    const { getLastEntryEnclosedInToggle } = await import(
      `./getLastEntryEnclosedInToggle?test=${Math.random()
        .toString(36)
        .slice(2)}`
    );

    const editor = {
      children: [
        { id: 't1', indent: 0, type: 'toggle' },
        { id: 'p1', indent: 1, type: 'p' },
        { id: 'p2', indent: 1, type: 'p' },
        { id: 'p3', indent: 0, type: 'p' },
      ],
    } as any;

    expect(getLastEntryEnclosedInToggle(editor, 't1')).toEqual([
      { id: 'p2', indent: 1, type: 'p' },
      [2],
    ]);
  });

  it('detects hidden ids and closed toggle state from toggle indexes', async () => {
    const { findElementIdsHiddenInToggle } = await import(
      `./findElementIdsHiddenInToggle?test=${Math.random()
        .toString(36)
        .slice(2)}`
    );
    const { getEnclosingToggleIds } = await import(
      `./getEnclosingToggleIds?test=${Math.random().toString(36).slice(2)}`
    );
    const { isInClosedToggle } = await import(
      `./isInClosedToggle?test=${Math.random().toString(36).slice(2)}`
    );

    const elements = [
      { id: 't1', indent: 0, type: 'toggle' },
      { id: 'p1', indent: 1, type: 'p' },
      { id: 'p2', indent: 0, type: 'p' },
    ] as any;

    expect(findElementIdsHiddenInToggle(new Set(), elements)).toEqual(['p1']);
    expect(
      getEnclosingToggleIds(
        {
          getOptions: () => ({
            toggleIndex: new Map([['p1', ['t1']]]),
          }),
        } as any,
        'p1'
      )
    ).toEqual(['t1']);

    getEditorPluginMock.mockReturnValue({
      getOption: (_key: string, ids: string[]) => ids.includes('t1'),
    });

    expect(
      isInClosedToggle(
        {
          getOptions: () => ({
            toggleIndex: new Map([['p1', ['t1']]]),
          }),
        } as any,
        'p1'
      )
    ).toBe(true);
  });
});
