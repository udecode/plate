import JSZip from 'jszip';
import { BaseIndentPlugin, BaseListPlugin, createEditor } from 'platejs';
import { exportDocx } from 'platejs/docx/export';

import { BlockListStatic } from '@/registry/components/editor/block-list-static';
import { ListKit } from '@/registry/components/editor/list';
import { BaseListKit } from '@/registry/components/editor/list-static';

const attr = (element: Element | null | undefined, name: string) =>
  element?.getElementsByTagName(name)[0]?.getAttribute('w:val') ?? undefined;

// Word counts every w:num of an abstractNum in one sequence per level, and a
// w:num's startOverride resets its level once, at that w:num's first paragraph
// there (MS-DOC 2.4.6.4). A paragraph at a shallower level restarts the deeper
// levels.
const readWordMarkers = async (blob: Blob) => {
  const zip = await JSZip.loadAsync(await blob.arrayBuffer());
  const parse = async (path: string) =>
    new DOMParser().parseFromString(
      await zip.file(path)!.async('string'),
      'application/xml'
    );
  const numbering = await parse('word/numbering.xml');
  const document = await parse('word/document.xml');
  const abstracts = new Map(
    [...numbering.getElementsByTagName('w:abstractNum')].map((abstract) => [
      abstract.getAttribute('w:abstractNumId'),
      abstract,
    ])
  );
  const nums = new Map(
    [...numbering.getElementsByTagName('w:num')].map((num) => [
      num.getAttribute('w:numId'),
      num,
    ])
  );
  const counters = new Map<string, number[]>();
  const lists = new Map<string, number>();
  const started = new Set<string>();

  return [...document.getElementsByTagName('w:p')].flatMap((paragraph) => {
    const numId = attr(paragraph, 'w:numId');

    if (!numId) return [];

    const level = Number(attr(paragraph, 'w:ilvl'));
    const num = nums.get(numId)!;
    const abstractId = attr(num, 'w:abstractNumId');
    const lvl = [
      ...abstracts.get(abstractId ?? null)!.getElementsByTagName('w:lvl'),
    ].find((element) => Number(element.getAttribute('w:ilvl')) === level);
    const override = [...num.getElementsByTagName('w:lvlOverride')].find(
      (element) => Number(element.getAttribute('w:ilvl')) === level
    );
    const startOverride = attr(override, 'w:startOverride');
    const key = `abstract:${abstractId}`;
    const counter = counters.get(key) ?? [];
    const restart =
      startOverride !== undefined && !started.has(`${numId}:${level}`);

    started.add(`${numId}:${level}`);
    counter[level] = restart
      ? Number(startOverride)
      : counter[level] === undefined
        ? Number(attr(lvl, 'w:start'))
        : counter[level] + 1;
    counter.length = level + 1;
    counters.set(key, counter);
    lists.set(key, lists.get(key) ?? lists.size);

    return [
      {
        format: attr(lvl, 'w:numFmt'),
        level,
        list: lists.get(key),
        number: counter[level],
        text: [...paragraph.getElementsByTagName('w:t')]
          .map((run) => run.textContent)
          .join(''),
      },
    ];
  });
};

describe('DOCX export list numbering', () => {
  const numbered = (text: string, props: object = {}) => ({
    children: [{ text }],
    indent: 1,
    listType: 'numbered',
    type: 'paragraph',
    ...props,
  });

  it.each([
    ['static', BaseListKit],
    ['live', ListKit],
  ])(
    'exports each Plate list as one Word list with the derived numbers (%s list kit)',
    async (_kit, plugins) => {
      const editor = createEditor({
        initialValue: [
          numbered('a', { listId: 'x', listStart: 3 }),
          numbered('b', { listId: 'x' }),
          { children: [{ text: 'between' }], type: 'paragraph' },
          numbered('c', { listId: 'y' }),
          numbered('d', { listId: 'y' }),
          numbered('e', { indent: 2, listId: 'y' }),
          numbered('f', { listId: 'y' }),
          numbered('g', { listId: 'y', listRestart: 7 }),
          numbered('h', { listId: 'z', listStyle: 'lower-roman' }),
        ],
        plugins,
      });
      const ordinal = (index: number) =>
        editor.plugin(BaseListPlugin).read.ordinal([index]);

      const result = await exportDocx(editor, { projection: 'proposed' });

      if (!result.ok) throw new Error(result.diagnostics[0]?.message);
      expect(await readWordMarkers(result.blob)).toEqual([
        { format: 'decimal', level: 0, list: 0, number: ordinal(0), text: 'a' },
        { format: 'decimal', level: 0, list: 0, number: ordinal(1), text: 'b' },
        { format: 'decimal', level: 0, list: 1, number: ordinal(3), text: 'c' },
        { format: 'decimal', level: 0, list: 1, number: ordinal(4), text: 'd' },
        { format: 'decimal', level: 1, list: 1, number: ordinal(5), text: 'e' },
        { format: 'decimal', level: 0, list: 1, number: ordinal(6), text: 'f' },
        { format: 'decimal', level: 0, list: 1, number: ordinal(7), text: 'g' },
        {
          format: 'lowerRoman',
          level: 0,
          list: 2,
          number: ordinal(8),
          text: 'h',
        },
      ]);
    }
  );

  it('exports Word list levels from the block indent at a custom indent size', async () => {
    const editor = createEditor({
      initialValue: [
        numbered('a'),
        numbered('b', { indent: 2 }),
        numbered('c'),
      ],
      plugins: [
        BaseIndentPlugin.configure({ initialState: { offset: 40 } }),
        BaseListPlugin.configure({
          slots: { wrapNodeChildren: BlockListStatic },
        }),
      ],
    });

    const result = await exportDocx(editor, { projection: 'proposed' });

    if (!result.ok) throw new Error(result.diagnostics[0]?.message);
    const markers = await readWordMarkers(result.blob);

    expect(markers.map(({ level, text }) => ({ level, text }))).toEqual([
      { level: 0, text: 'a' },
      { level: 1, text: 'b' },
      { level: 0, text: 'c' },
    ]);
  });
});
