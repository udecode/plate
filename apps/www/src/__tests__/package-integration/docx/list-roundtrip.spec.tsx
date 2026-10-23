import { BaseListPlugin, createEditor, NodeApi, type Value } from 'platejs';
import { type DocxDiagnostic, exportDocx } from 'platejs/docx/export';
import { importDocx } from 'platejs/docx/import';
import { MarkdownPlugin } from 'platejs/markdown';

import { BaseListKit } from '@/registry/components/editor/list-static';
import { BaseEditorKit } from '@/registry/components/editor/plugins-static';

const item = (text: string, listId: string, props: object = {}) => ({
  children: [{ text }],
  indent: 1,
  listId,
  listType: 'numbered',
  type: 'paragraph',
  ...props,
});
const note = (text: string) => ({ children: [{ text }], type: 'paragraph' });
const levels = { '2': { restartAfter: 0, start: 3 } };
const pathsOf = (diagnostics: readonly DocxDiagnostic[], feature: string) =>
  diagnostics.flatMap((diagnostic) =>
    'feature' in diagnostic && diagnostic.feature === feature
      ? [diagnostic.path]
      : []
  );

const original: Value = [
  item('A1', 'a'),
  item('B1', 'b'),
  item('A2', 'a'),
  note('Between'),
  item('A3', 'a'),
  item('B2', 'b'),
  item('A1 again', 'a', { listRestart: 1 }),
  item('A2 again', 'a'),
  item('W1', 'w', { listLevels: levels }),
  item('W1.1', 'w', { indent: 2, listLevels: levels }),
  item('W2', 'w', { listLevels: levels }),
  item('W2.1', 'w', { indent: 2, listLevels: levels }),
  item('Z5', 'z', { listStart: 5 }),
  item('Z6', 'z'),
];

// Import mints new list ids, so lists compare by order of first appearance.
const describeLists = (value: Value, { restarts = false } = {}) => {
  const editor = createEditor({ initialValue: value, plugins: BaseListKit });
  const names = new Map<unknown, string>();

  return editor.read.children().flatMap((node, index) => {
    if (!node.listType) return [];
    if (!names.has(node.listId)) {
      names.set(node.listId, String.fromCharCode(97 + names.size));
    }

    return [
      {
        levels: node.listLevels ?? null,
        list: names.get(node.listId),
        number: editor.plugin(BaseListPlugin).read.ordinal([index]) ?? null,
        style: node.listStyle ?? null,
        text: NodeApi.string(node),
        ...(restarts ? { restart: node.listRestart ?? null } : {}),
      },
    ];
  });
};

const insertIntoEachList = (value: Value) => {
  const lastIndex = new Map<unknown, number>();

  value.forEach((node, index) => {
    if (node.listType) lastIndex.set(node.listId, index);
  });

  const next = [...value];

  for (const index of [...lastIndex.values()].sort((a, b) => b - a)) {
    const last = value[index];

    next.splice(index + 1, 0, {
      ...last,
      children: [{ text: `after ${NodeApi.string(last)}` }],
      listRestart: undefined,
    } as never);
  }

  return JSON.parse(JSON.stringify(next)) as Value;
};

const insertBefore = (value: Value, text: string) => {
  const index = value.findIndex((node) => NodeApi.string(node) === text);
  const { listRestart: _restart, ...facts } = value[index];

  return [
    ...value.slice(0, index),
    { ...facts, children: [{ text: 'inserted' }] },
    ...value.slice(index),
  ] as Value;
};

const roundTrip = async (value: Value = original) => {
  const editor = createEditor({ initialValue: value, plugins: BaseListKit });
  const exported = await exportDocx(editor, { projection: 'proposed' });

  if (!exported.ok) throw new Error(exported.diagnostics[0]?.message);

  const imported = await importDocx(await exported.blob.arrayBuffer(), {
    lossPolicy: 'allow',
    plugins: BaseListKit,
  });

  if (!imported.ok) throw new Error(imported.diagnostics[0]?.message);

  return imported.document.children;
};

describe('DOCX list round trip', () => {
  it('keeps each list, its level rules and its numbers', async () => {
    expect(describeLists(await roundTrip())).toEqual(describeLists(original));
  });

  it('reports a marker style its Word level cannot draw', async () => {
    const editor = createEditor({
      initialValue: [
        item('One', 'a'),
        item('ii', 'a', { listStyle: 'lower-roman' }),
      ],
      plugins: BaseListKit,
    });
    const exported = await exportDocx(editor, {
      lossPolicy: 'reject',
      projection: 'proposed',
    });

    expect(exported.ok).toBe(true);
    expect(exported.diagnostics).toContainEqual(
      expect.objectContaining({ feature: 'list-marker', path: [1] })
    );
  });

  it('rejects list items Word cannot keep in their list', async () => {
    const editor = createEditor({
      initialValue: [
        item('One', 'm'),
        item('Task', 'm', { checked: false, listType: 'task' }),
        item('Two', 'm', { listLevels: { '1': { start: 3 } } }),
      ],
      plugins: BaseListKit,
    });
    const allowed = await exportDocx(editor, {
      lossPolicy: 'allow',
      projection: 'proposed',
    });
    const rejected = await exportDocx(editor, {
      lossPolicy: 'reject',
      projection: 'proposed',
    });

    expect(pathsOf(allowed.diagnostics, 'list-structure')).toEqual([[1], [2]]);
    expect(rejected.ok).toBe(false);
  });

  const structure = async (value: Value) => {
    const result = await exportDocx(
      createEditor({ initialValue: value, plugins: BaseListKit }),
      { lossPolicy: 'allow', projection: 'proposed' }
    );

    return pathsOf(result.diagnostics, 'list-structure');
  };

  it.each([
    [
      'a number after a bullet',
      [item('Bullet', 'm', { listType: 'bulleted' }), item('One', 'm')],
    ],
    [
      'a bullet after a number',
      [item('One', 'm'), item('Bullet', 'm', { listType: 'bulleted' })],
    ],
  ])('reports %s at one level as split from its list', async (_, value) => {
    expect(await structure(value as Value)).toEqual([[1]]);
  });

  it.each([
    [
      'a to-do after a bullet',
      [
        item('Bullet', 'm', { listType: 'bulleted' }),
        item('Task', 'm', { checked: false, listType: 'task' }),
      ],
    ],
    [
      'a bullet after a to-do',
      [
        item('Task', 'm', { checked: false, listType: 'task' }),
        item('Bullet', 'm', { listType: 'bulleted' }),
      ],
    ],
  ])(
    'reports no split for %s, which share an unordered Word level',
    async (_, value) => {
      expect(await structure(value as Value)).toEqual([]);
    }
  );

  it('reports no start for a bullet, which shows no number', async () => {
    const exported = await exportDocx(
      createEditor({
        initialValue: [
          item('Bullet', 'm', { listStart: 3, listType: 'bulleted' }),
        ],
        plugins: BaseListKit,
      }),
      { lossPolicy: 'allow', projection: 'proposed' }
    );

    expect(pathsOf(exported.diagnostics, 'list-start')).toEqual([]);
  });

  const parseMarkdown = (markdown: string) => {
    const editor = createEditor({ plugins: BaseEditorKit });
    const parsed = editor.plugin(MarkdownPlugin).api.parse(markdown);

    if (!parsed.ok) throw new Error(parsed.diagnostics[0]?.message);

    return parsed.document.children;
  };

  it('reports no split between a Markdown bullet list and the numbered list after it', async () => {
    expect(await structure(parseMarkdown('- a\n\n1. b\n'))).toEqual([]);
  });

  it('reports no split between the to-dos and bullets of one Markdown list', async () => {
    expect(
      await structure(parseMarkdown('- [x] Done\n- [ ] Open\n\n- Bullet\n'))
    ).toEqual([]);
  });

  it('still reports a to-do inside one Markdown numbered list', async () => {
    expect(await structure(parseMarkdown('1. a\n2. [ ] t\n'))).toEqual([[1]]);
  });

  const starts = async (value: Value) => {
    const result = await exportDocx(
      createEditor({ initialValue: value, plugins: BaseListKit }),
      { lossPolicy: 'allow', projection: 'proposed' }
    );

    return pathsOf(result.diagnostics, 'list-start');
  };
  const firstLevel = { '1': { start: 3 } };
  const secondLevel = { '2': { start: 3 } };

  it.each([
    ['the default level start', [item('One', 's', { listStart: 1 })]],
    [
      'a nested level start its first item gives',
      [
        item('One', 's', { listLevels: secondLevel }),
        item('Nested', 's', {
          indent: 2,
          listLevels: secondLevel,
          listStart: 3,
        }),
      ],
    ],
    [
      'the first item level start when its own rules differ',
      [
        item('One', 's', { listLevels: firstLevel }),
        item('Two', 's', { listLevels: { '1': { start: 1 } }, listStart: 3 }),
      ],
    ],
  ])('reports no start equal to %s', async (_, value) => {
    expect(await starts(value)).toEqual([]);
  });

  it.each([
    ['a default level', [item('One', 's', { listStart: 3 })], [[0]]],
    [
      'a level whose first item starts at 3',
      [item('One', 's', { listLevels: firstLevel, listStart: 1 })],
      [[0]],
    ],
    [
      'a nested level whose first item starts at 3',
      [
        item('One', 's', { listLevels: secondLevel }),
        item('Nested', 's', {
          indent: 2,
          listLevels: secondLevel,
          listStart: 1,
        }),
      ],
      [[1]],
    ],
  ])('reports a start Word cannot show at %s', async (_, value, paths) => {
    expect(await starts(value)).toEqual(paths);
  });

  it('reports a start that applies only when its item opens the level', async () => {
    const exported = await exportDocx(
      createEditor({ initialValue: original, plugins: BaseListKit }),
      { lossPolicy: 'reject', projection: 'proposed' }
    );

    expect(exported.ok).toBe(true);
    expect(pathsOf(exported.diagnostics, 'list-start')).toEqual([
      [original.findIndex((node) => node.listStart !== undefined)],
    ]);
  });

  it.each([
    [
      'a restarted deeper level followed by a parent item and the same level',
      [
        item('P1', 'p'),
        item('C1', 'p', { indent: 2, listRestart: 5 }),
        item('C2', 'p', { indent: 2 }),
        item('P2', 'p'),
        item('C3', 'p', { indent: 2 }),
      ],
      'C1',
    ],
    [
      'a restart whose number already matches',
      [item('M1', 'm'), item('M2', 'm', { listRestart: 2 }), item('M3', 'm')],
      'M2',
    ],
  ])(
    'keeps %s, before and after an insert before the restart',
    async (_name, items, restarted) => {
      const value = items as Value;
      const imported = await roundTrip(value);

      expect(describeLists(imported, { restarts: true })).toEqual(
        describeLists(value, { restarts: true })
      );
      expect(
        describeLists(insertBefore(imported, restarted), { restarts: true })
      ).toEqual(
        describeLists(insertBefore(value, restarted), { restarts: true })
      );
    }
  );

  it('keeps a decimal-leading-zero list', async () => {
    const value = [
      item('Z1', 'z', { listStyle: 'decimal-leading-zero' }),
      item('Z2', 'z', { listStyle: 'decimal-leading-zero' }),
    ] as Value;

    expect(describeLists(await roundTrip(value))).toEqual(describeLists(value));
  });

  it('numbers an insert into each re-imported list like the original', async () => {
    expect(describeLists(insertIntoEachList(await roundTrip()))).toEqual(
      describeLists(insertIntoEachList(original))
    );
  });
});
