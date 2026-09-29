import { definePlugin, schema } from '../../core';
import { BaseLinkPlugin } from '../../features/link';
import { createTestEditor } from './__tests__/createTestEditor';

const answerUnit = (index: number) =>
  `## Step ${index}\n\nUse a \`Map<string, number>\` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/${index}>.\n\n- keep **order**\n- avoid _churn_\n\n\`\`\`ts\nconst m = new Map<string, number>();\n\`\`\`\n`;
const cjkUnit = (index: number) =>
  `## 第 ${index} 步\n\n使用 \`Map<string, number>\` 查找，当 x<y 时依然成立。🚀\n\n| 键 | 值 |\n| - | - |\n| a | ${index} |\n`;

const fixtures: Record<string, string> = {
  'ai transcript': Array.from({ length: 12 }, (_, index) => answerUnit(index))
    .join('\n')
    .slice(0, 3000),
  'cjk transcript': Array.from({ length: 12 }, (_, index) => cjkUnit(index))
    .join('\n')
    .slice(0, 2000),
  containers:
    '<callout icon="💡">\nTip\n</callout>\n\n<details>\n<summary>More</summary>\n\nHidden\n</details>\n\n<columnGroup>\n<column width="50%">\n\nLeft\n\n</column>\n<column width="50%">\n\nRight\n\n</column>\n</columnGroup>\n\nAfter\n',
  definitions:
    'See [docs][d] and a note[^1].\n\nMore text.\n\n[d]: https://platejs.org\n\n[^1]: The note.\n',
  'fences and math':
    'Intro\n\n```js\nconst a = 1;\n\nconst b = 2;\n```\n\n$$\nx^2\n\ny^2\n$$\n\nOutro\n',
  lists:
    '- one\n\n- two\n\n  nested\n\n1. first\n2. second\n\n3) restart\n\nDone\n',
  'list continuations': '- a\n\n  b\n\n  c\n\nTail\n',
  'ordered steps':
    '1. **Install**\n\n   Run the installer.\n\n2. **Configure**\n\n   Edit the file.\n\nDone.\n',
  'restart after a continuation': '1. first\n\n   more\n\n3) restart\n\nTail\n',
  'raw html and unsafe links':
    '<!-- note\n\nstill note -->\n\nA [bad](javascript:alert(1)) link.\n\n<div>raw</div>\n\n<div>raw two</div>\n\nEnd\n',
  'lossy content': 'Intro\n\n![pic](data:text/html,x)\n\nNext\n\nTail\n',
  'unclosed inline tags': 'Hello <u>world\n\nNext\n\nA <kbd>key\n\nMore\n',
};

const seeded = (seed: number) => {
  let state = seed;

  return () => {
    state = (state * 1_103_515_245 + 12_345) % 2_147_483_648;

    return state / 2_147_483_648;
  };
};

const chunkings = (source: string) => {
  const fixed = Array.from(
    { length: Math.ceil(source.length / 64) },
    (_, index) => Math.min(source.length, (index + 1) * 64)
  );
  const random = [1, 2, 3].map((seed) => {
    const next = seeded(seed);
    const ends: number[] = [];

    for (let end = 0; end < source.length;) {
      end = Math.min(source.length, end + 1 + Math.floor(next() * 40));
      ends.push(end);
    }

    return ends;
  });

  return [fixed, ...random];
};

describe('continued Markdown parsing', () => {
  const editor = createTestEditor();
  const options = { lossPolicy: 'allow', partial: true } as const;

  it.each(Object.entries(fixtures))(
    'equals a fresh parse at every prefix: %s',
    (_name, source) => {
      for (const ends of chunkings(source)) {
        let previous:
          | ReturnType<typeof editor.api.markdown.parseSlice>
          | undefined;

        for (const end of ends) {
          const prefix = source.slice(0, end);

          // A strict parse can continue the latest preview, as a final does.
          expect(editor.api.markdown.parseSlice(prefix, { previous })).toEqual(
            editor.api.markdown.parseSlice(prefix)
          );
          previous = editor.api.markdown.parseSlice(prefix, {
            ...options,
            previous,
          });
          expect(previous).toEqual(
            editor.api.markdown.parseSlice(prefix, options)
          );
        }
      }
    },
    // The oracle reparses every prefix from scratch.
    60_000
  );

  it('gives the first block of a continued segment its previous sibling', () => {
    const AfterRule = definePlugin('afterRule', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      formats: ({ defineFormats, schema: { type } }) =>
        defineFormats({
          markdown: {
            node: 'paragraph',
            decode: ({ decode, node, previousSibling }) =>
              previousSibling?.type === 'thematicBreak'
                ? { children: decode(node.children), type }
                : undefined,
          },
        }),
    });
    const ruleEditor = createTestEditor([AfterRule]);
    const source = 'Intro\n\n---\n\nAfter the rule.\n\nTail';
    let previous:
      | ReturnType<typeof ruleEditor.api.markdown.parseSlice>
      | undefined;

    for (let end = 1; end <= source.length; end++) {
      const prefix = source.slice(0, end);

      previous = ruleEditor.api.markdown.parseSlice(prefix, {
        ...options,
        previous,
      });
      expect(previous).toEqual(
        ruleEditor.api.markdown.parseSlice(prefix, options)
      );
    }
    if (!previous?.ok) throw new Error('Expected a slice.');
    expect(previous.slice.content[2]).toMatchObject({ type: 'afterRule' });
  });

  it('keeps the node objects of complete blocks', () => {
    const first = editor.api.markdown.parseSlice(
      'First block.\n\nSecond block.\n\nThird',
      options
    );
    const second = editor.api.markdown.parseSlice(
      'First block.\n\nSecond block.\n\nThird and more',
      { ...options, previous: first }
    );
    const third = editor.api.markdown.parseSlice(
      'First block.\n\nSecond block.\n\nThird and more.\n\nFourth',
      { ...options, previous: second }
    );

    if (!second.ok || !third.ok) throw new Error('Expected slices.');
    expect(third.slice.content[0]).toBe(second.slice.content[0]);
    expect(third.slice.content[1]).toBe(second.slice.content[1]);
    expect(third.slice.content[2]).not.toBe(second.slice.content[2]);
  });

  it('keeps reusing across state changes of plugins without mappings', () => {
    const Unrelated = definePlugin('unrelatedState', {
      initialState: { count: 0 },
    });
    const stateEditor = createTestEditor([Unrelated]);
    const first = stateEditor.api.markdown.parseSlice(
      'First block.\n\nSecond block.\n\nThird',
      options
    );
    const second = stateEditor.api.markdown.parseSlice(
      'First block.\n\nSecond block.\n\nThird and more',
      { ...options, previous: first }
    );

    stateEditor.plugin(Unrelated).store.set({ count: 1 });
    const third = stateEditor.api.markdown.parseSlice(
      'First block.\n\nSecond block.\n\nThird and more.\n\nFourth',
      { ...options, previous: second }
    );

    if (!second.ok || !third.ok) throw new Error('Expected slices.');
    expect(third.slice.content[0]).toBe(second.slice.content[0]);
  });

  it('reconverts after plugin state changes, and ignores foreign hints', () => {
    const linkEditor = createTestEditor();
    const source = 'Intro.\n\n[mail](mailto:a@b.c) link.\n\nTail';
    const before = linkEditor.api.markdown.parseSlice(source, options);

    linkEditor.plugin(BaseLinkPlugin).store.set({ allowedSchemes: ['https'] });

    expect(
      linkEditor.api.markdown.parseSlice(`${source} more`, {
        ...options,
        previous: before,
      })
    ).toEqual(linkEditor.api.markdown.parseSlice(`${source} more`, options));

    const document = editor.api.markdown.parse(source, options);

    for (const previous of [
      document,
      { ...before },
      editor.api.markdown.parseSlice('Other.\n\nText', options),
    ]) {
      expect(
        editor.api.markdown.parseSlice(`${source} more`, {
          ...options,
          previous: previous as typeof before,
        })
      ).toEqual(editor.api.markdown.parseSlice(`${source} more`, options));
    }
  });

  it('keeps complete blocks that reported nothing in a strict parse', () => {
    const first = editor.api.markdown.parseSlice(
      'One.\n\n<div>raw</div>\n\nThree.\n\nFo',
      options
    );
    const second = editor.api.markdown.parseSlice(
      'One.\n\n<div>raw</div>\n\nThree.\n\nFour.\n\nFi',
      { ...options, previous: first }
    );
    const final = editor.api.markdown.parseSlice(
      'One.\n\n<div>raw</div>\n\nThree.\n\nFour.\n\nFive.',
      { previous: second }
    );

    if (!second.ok || !final.ok) throw new Error('Expected slices.');
    expect(final.slice.content[0]).toBe(second.slice.content[0]);
    expect(final).toEqual(
      editor.api.markdown.parseSlice(
        'One.\n\n<div>raw</div>\n\nThree.\n\nFour.\n\nFive.'
      )
    );
  });

  it('parses the whole source across aggregate limits', () => {
    const source = 'One.\n\nTwo.\n\nThree.\n\nFour';
    const limits = { maxNodes: 9 };

    expect(
      editor.api.markdown.parseSlice(`${source}.`, {
        ...options,
        limits,
        previous: editor.api.markdown.parseSlice(source, {
          ...options,
          limits,
        }),
      })
    ).toEqual(
      editor.api.markdown.parseSlice(`${source}.`, { ...options, limits })
    );
  });
});
