import { KEYS, createSlateEditor } from 'platejs';

import {
  BaseFootnoteDefinitionPlugin,
  BaseFootnoteReferencePlugin,
} from '../index';
import { insertFootnote } from '../transforms/insertFootnote';

describe('footnote registry', () => {
  it('reuses one scan across repeated lookups and survives text edits inside a definition', () => {
    const editor = createSlateEditor({
      plugins: [BaseFootnoteReferencePlugin, BaseFootnoteDefinitionPlugin],
      selection: {
        anchor: { offset: 4, path: [1, 0, 0] },
        focus: { offset: 4, path: [1, 0, 0] },
      },
      value: [
        {
          children: [
            {
              children: [{ text: '1' }],
              identifier: '1',
              type: 'footnoteReference',
            },
          ],
          type: KEYS.p,
        },
        {
          children: [{ children: [{ text: 'body' }], type: KEYS.p }],
          identifier: '1',
          type: 'footnoteDefinition',
        },
      ],
    } as any);

    const originalNodes = editor.api.nodes.bind(editor.api);
    const nodesSpy = mock((options: any) => originalNodes(options));
    (editor.api as any).nodes = nodesSpy;

    expect(
      (editor.api as any).footnote.definition({ identifier: '1' })
    ).toBeDefined();
    expect(
      (editor.api as any).footnote.definitions({ identifier: '1' })
    ).toHaveLength(1);
    expect((editor.api as any).footnote.isResolved({ identifier: '1' })).toBe(
      true
    );
    expect(
      (editor.api as any).footnote.hasDuplicateDefinitions({ identifier: '1' })
    ).toBe(false);
    expect((editor.api as any).footnote.duplicateIdentifiers()).toEqual([]);
    expect(
      (editor.api as any).footnote.references({ identifier: '1' })
    ).toHaveLength(1);
    expect(
      (editor.api as any).footnote.definitionText({ identifier: '1' })
    ).toBe('body');
    expect((editor.api as any).footnote.nextId()).toBe('2');
    expect(nodesSpy).toHaveBeenCalledTimes(1);

    editor.tf.insertText('!');

    expect(
      (editor.api as any).footnote.definitionText({ identifier: '1' })
    ).toBe('body!');
    expect(nodesSpy).toHaveBeenCalledTimes(1);

    editor.tf.select({
      anchor: { offset: 5, path: [0, 0] },
      focus: { offset: 5, path: [0, 0] },
    });
    insertFootnote(editor, { identifier: '2' });

    expect((editor.api as any).footnote.nextId()).toBe('3');
    expect(nodesSpy).toHaveBeenCalledTimes(3);
  });

  it('detects duplicate definitions without scanning on every lookup', () => {
    const editor = createSlateEditor({
      plugins: [BaseFootnoteReferencePlugin, BaseFootnoteDefinitionPlugin],
      value: [
        {
          children: [{ children: [{ text: 'one' }], type: KEYS.p }],
          identifier: '1',
          type: 'footnoteDefinition',
        },
        {
          children: [{ children: [{ text: 'duplicate' }], type: KEYS.p }],
          identifier: '1',
          type: 'footnoteDefinition',
        },
      ],
    } as any);

    expect((editor.api as any).footnote.isResolved({ identifier: '1' })).toBe(
      true
    );
    expect(
      (editor.api as any).footnote.hasDuplicateDefinitions({ identifier: '1' })
    ).toBe(true);
    expect((editor.api as any).footnote.duplicateIdentifiers()).toEqual(['1']);
    expect(
      (editor.api as any).footnote.definitions({ identifier: '1' })
    ).toHaveLength(2);
    expect(
      (editor.api as any).footnote.duplicateDefinitions({ identifier: '1' })
    ).toHaveLength(1);
    expect(
      (editor.api as any).footnote.isDuplicateDefinition({ path: [0] })
    ).toBe(false);
    expect(
      (editor.api as any).footnote.isDuplicateDefinition({ path: [1] })
    ).toBe(true);
  });

  it('can renumber a later duplicate definition without touching the canonical first definition', () => {
    const editor = createSlateEditor({
      plugins: [BaseFootnoteReferencePlugin, BaseFootnoteDefinitionPlugin],
      value: [
        {
          children: [{ children: [{ text: 'one' }], type: KEYS.p }],
          identifier: '1',
          type: 'footnoteDefinition',
        },
        {
          children: [{ children: [{ text: 'duplicate' }], type: KEYS.p }],
          identifier: '1',
          type: 'footnoteDefinition',
        },
      ],
    } as any);

    expect(
      (editor.tf as any).footnote.normalizeDuplicateDefinition({ path: [1] })
    ).toBe('2');
    expect(
      (editor.api as any).footnote.hasDuplicateDefinitions({ identifier: '1' })
    ).toBe(false);
    expect((editor.api as any).footnote.duplicateIdentifiers()).toEqual([]);
    expect(
      (editor.api as any).footnote.definition({ identifier: '1' })
    ).toMatchObject([{ identifier: '1', type: 'footnoteDefinition' }, [0]]);
    expect(
      (editor.api as any).footnote.definition({ identifier: '2' })
    ).toMatchObject([{ identifier: '2', type: 'footnoteDefinition' }, [1]]);
    expect(
      (editor.api as any).footnote.isDuplicateDefinition({ path: [1] })
    ).toBe(false);
  });
});
