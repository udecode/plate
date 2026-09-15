import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { createEditor, Editable, EditorRoot } from '../../src/react';
import { EditableViewportSurface } from '../../src/react/components/editable-text-blocks';
import { useRootNodeKeys } from '../../src/react/editable/root-selector-sources';
import { createEditableViewportPlan } from '../../src/react/viewport-plan';
import { VirtualizedEditable } from '../../src/react/virtualized';

const value = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    type: 'paragraph',
    children: [{ text: `Block ${index + 1}` }],
  }));

const ManualViewportEditable = ({
  indexes,
}: {
  indexes: readonly number[];
}) => {
  const topLevelNodeKeys = useRootNodeKeys();
  const viewportPlan = React.useMemo(
    () =>
      createEditableViewportPlan({
        coordinateSpace: 'flow',
        indexes,
        scrollToPath: () => false,
        sizeAtIndex: () => 32,
        startAtIndex: (index) => index * 32,
        topLevelNodeKeys,
        totalSize: topLevelNodeKeys.length * 32,
      }),
    [indexes, topLevelNodeKeys]
  );

  return <EditableViewportSurface viewportPlan={viewportPlan} />;
};

describe('large document rendering', () => {
  it('keeps ordinary Editable complete', () => {
    const editor = createEditor({ initialValue: value(100) });
    const rendered = render(
      <EditorRoot editor={editor}>
        <Editable />
      </EditorRoot>
    );

    expect(
      rendered.container.querySelectorAll('[data-editor-node="element"]')
    ).toHaveLength(100);
    expect(
      rendered.container.querySelector('[data-editor-virtualized-viewport]')
    ).toBeNull();
  });

  it('uses a deterministic initial window and retains selection endpoints', () => {
    const editor = createEditor({
      initialSelection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [18, 0], offset: 2 },
      },
      initialValue: value(20),
    });
    const rendered = render(
      <EditorRoot editor={editor}>
        <VirtualizedEditable estimatedBlockSize={40} overscan={0} />
      </EditorRoot>
    );

    expect(
      rendered.container.querySelectorAll('[data-editor-virtualized-row]')
    ).toHaveLength(9);
    expect(rendered.getByText('Block 19')).toBeTruthy();
    expect(rendered.queryByText('Block 9')).toBeNull();
    expect(
      rendered.container.querySelectorAll('[data-editor-viewport-boundary]')
    ).toHaveLength(2);
  });

  it('preserves the editable host and mounted block identity when options change', () => {
    const editor = createEditor({ initialValue: value(20) });
    const tree = (estimatedBlockSize: number, overscan: number) => (
      <EditorRoot editor={editor}>
        <VirtualizedEditable
          estimatedBlockSize={estimatedBlockSize}
          id="virtualized-editor"
          overscan={overscan}
        />
      </EditorRoot>
    );
    const rendered = render(tree(32, 1));
    const host = rendered.container.querySelector('#virtualized-editor');
    const firstBlock = rendered
      .getByText('Block 1')
      .closest('[data-editor-node="element"]');

    rendered.rerender(tree(48, 4));

    expect(rendered.container.querySelector('#virtualized-editor')).toBe(host);
    expect(
      rendered.getByText('Block 1').closest('[data-editor-node="element"]')
    ).toBe(firstBlock);
  });

  it('preserves overlapping rows when the viewport window advances', () => {
    const editor = createEditor({ initialValue: value(4) });
    const tree = (indexes: readonly number[]) => (
      <EditorRoot editor={editor}>
        <ManualViewportEditable indexes={indexes} />
      </EditorRoot>
    );
    const rendered = render(tree([0, 1, 2]));
    const block = rendered
      .getByText('Block 2')
      .closest('[data-editor-node="element"]');
    const row = block?.closest('[data-editor-virtualized-row]');

    rendered.rerender(tree([1, 2, 3]));

    const retainedBlock = rendered
      .getByText('Block 2')
      .closest('[data-editor-node="element"]');

    expect(retainedBlock).toBe(block);
    expect(retainedBlock?.closest('[data-editor-virtualized-row]')).toBe(row);
  });

  it.each([
    { estimatedBlockSize: 0 },
    { estimatedBlockSize: Number.POSITIVE_INFINITY },
    { overscan: -1 },
    { overscan: 1.5 },
  ])('rejects invalid viewport options: %o', (props) => {
    const editor = createEditor({ initialValue: value(1) });

    expect(() =>
      render(
        <EditorRoot editor={editor}>
          <VirtualizedEditable {...props} />
        </EditorRoot>
      )
    ).toThrow(RangeError);
  });
});
