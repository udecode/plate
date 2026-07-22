import { property, type EditorMarks, type Selection } from '@platejs/plite';

import { createBaseEditor } from '../../../editor';
import { createBasePlugin } from '../../../plugin';
import { getMarkBoundaryAffinity } from './getMarkBoundaryAffinity';

const value = [{ children: [{ text: 'ab' }], type: 'p' }];
const MarkPlugins = [
  createBasePlugin({
    key: 'bold',
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
  }),
  createBasePlugin({
    key: 'color',
    schema: { mark: { property: property.string() } },
  }),
];

const collapsedSelection = (offset: number): Selection => ({
  kind: 'text',
  anchor: { offset, path: [0, 0] },
  focus: { offset, path: [0, 0] },
});

const createEditor = ({
  marks,
  selection,
}: {
  marks: EditorMarks | null;
  selection: Selection;
}) => {
  const editor = createBaseEditor({
    plugins: MarkPlugins,
    selection,
    initialValue: value,
  });

  editor.update.marks.set(marks);

  return editor;
};

describe('getMarkBoundaryAffinity', () => {
  it('returns undefined without a selection', () => {
    expect(
      getMarkBoundaryAffinity(createEditor({ marks: null, selection: null }), [
        null,
        [{ text: 'a' }, [0, 0]],
      ])
    ).toBeUndefined();
  });

  it('uses the only available leaf when a single boundary leaf exists', () => {
    expect(
      getMarkBoundaryAffinity(
        createEditor({
          marks: null,
          selection: collapsedSelection(0),
        }),
        [[{ bold: true, text: 'a' }, [0, 0]], null]
      )
    ).toBe('backward');
  });

  it('treats a single current mark as no comparable boundary marks', () => {
    expect(
      getMarkBoundaryAffinity(
        createEditor({
          marks: { bold: true },
          selection: collapsedSelection(0),
        }),
        [[{ bold: true, text: 'a' }, [0, 0]], null]
      )
    ).toBe('backward');
  });

  it('treats an empty marks object as no comparable boundary marks', () => {
    expect(
      getMarkBoundaryAffinity(
        createEditor({
          marks: {},
          selection: collapsedSelection(0),
        }),
        [[{ text: 'a' }, [0, 0]], null]
      )
    ).toBe('backward');
  });

  it('returns undefined when the only leaf does not match the current marks', () => {
    expect(
      getMarkBoundaryAffinity(
        createEditor({
          marks: { bold: true, color: 'red' },
          selection: collapsedSelection(0),
        }),
        [[{ bold: true, color: 'blue', text: 'a' }, [0, 0]], null]
      )
    ).toBeUndefined();
  });

  it('prefers forward when selection is backward and only the forward leaf matches marks', () => {
    expect(
      getMarkBoundaryAffinity(
        createEditor({
          marks: { bold: true, color: 'red' },
          selection: collapsedSelection(1),
        }),
        [
          [{ bold: true, color: 'blue', text: 'a' }, [0, 0]],
          [{ bold: true, color: 'red', text: 'b' }, [0, 1]],
        ]
      )
    ).toBe('forward');
  });

  it('falls back to backward when no special case applies', () => {
    expect(
      getMarkBoundaryAffinity(
        createEditor({
          marks: { bold: true, color: 'red' },
          selection: collapsedSelection(1),
        }),
        [
          [{ bold: true, color: 'red', text: 'a' }, [0, 0]],
          [{ bold: true, color: 'blue', text: 'b' }, [0, 1]],
        ]
      )
    ).toBe('backward');
  });
});
