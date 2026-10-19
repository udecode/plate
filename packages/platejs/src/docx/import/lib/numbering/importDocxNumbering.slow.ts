import fs from 'node:fs';

import JSZip from 'jszip';

import {
  BaseParagraphPlugin,
  createEditor,
  type Editor,
  NodeApi,
} from '../../../../core';
import { BaseListPlugin } from '../../../../features/list';
import { BaseTablePlugin } from '../../../../features/table';
import { importDocx } from '../importDocx';

const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const plugins = [BaseParagraphPlugin, BaseListPlugin, BaseTablePlugin];

type Level = Readonly<{ format?: string; restart?: number; start?: number }>;

const paragraph = (text: string, numId?: number, ilvl = 0) =>
  `<w:p>${
    numId === undefined
      ? ''
      : `<w:pPr><w:numPr><w:ilvl w:val="${ilvl}"/><w:numId w:val="${numId}"/></w:numPr></w:pPr>`
  }<w:r><w:t>${text}</w:t></w:r></w:p>`;

const table = (...cell: string[]) =>
  `<w:tbl><w:tr><w:tc>${cell.join('')}</w:tc></w:tr></w:tbl>`;

const abstractNum = (id: number, levels: readonly Level[] = [{}, {}, {}]) =>
  `<w:abstractNum w:abstractNumId="${id}">${levels
    .map(
      (level, ilvl) =>
        `<w:lvl w:ilvl="${ilvl}"><w:start w:val="${level.start ?? 1}"/><w:numFmt w:val="${
          level.format ?? 'decimal'
        }"/>${
          level.restart === undefined
            ? ''
            : `<w:lvlRestart w:val="${level.restart}"/>`
        }<w:lvlText w:val="%${ilvl + 1}."/></w:lvl>`
    )
    .join('')}</w:abstractNum>`;

const num = (id: number, abstractId: number, startOverride?: number) =>
  `<w:num w:numId="${id}"><w:abstractNumId w:val="${abstractId}"/>${
    startOverride === undefined
      ? ''
      : `<w:lvlOverride w:ilvl="0"><w:startOverride w:val="${startOverride}"/></w:lvlOverride>`
  }</w:num>`;

const createDocx = async (
  body: readonly string[],
  numbering: readonly string[],
  styles: readonly string[] = []
) => {
  const zip = new JSZip();

  zip.file(
    'word/document.xml',
    `<w:document xmlns:w="${W}"><w:body>${body.join('')}</w:body></w:document>`
  );
  zip.file(
    'word/numbering.xml',
    `<w:numbering xmlns:w="${W}">${numbering.join('')}</w:numbering>`
  );
  if (styles.length > 0) {
    zip.file(
      'word/styles.xml',
      `<w:styles xmlns:w="${W}">${styles.join('')}</w:styles>`
    );
  }

  return zip.generateAsync({ type: 'arraybuffer' });
};

const numWithLevel = (
  id: number,
  abstractId: number,
  ilvl: number,
  lvl: string
) =>
  `<w:num w:numId="${id}"><w:abstractNumId w:val="${abstractId}"/><w:lvlOverride w:ilvl="${ilvl}"><w:lvl w:ilvl="${ilvl}">${lvl}</w:lvl></w:lvlOverride></w:num>`;

const importChildren = async (source: ArrayBuffer) => {
  const result = await importDocx(source, { lossPolicy: 'allow', plugins });

  if (!result.ok) throw new Error('DOCX import failed.');

  return result.document.children;
};

const importNumbers = async (
  source: ArrayBuffer,
  edit?: (editor: Editor) => void
) => {
  const editor = createEditor({
    initialValue: await importChildren(source),
    plugins,
  } as never) as Editor;
  const numbers: string[] = [];

  edit?.(editor);

  for (const [node, path] of NodeApi.elements({
    children: editor.read.children(),
  } as never)) {
    if (!Reflect.has(node, 'listType')) continue;
    numbers.push(
      `${NodeApi.string(node)}:${
        editor.plugin(BaseListPlugin).read.ordinal(path) ?? '-'
      }`
    );
  }

  return numbers;
};

const continueAfter = (from: number, text: string) => (editor: Editor) => {
  const { listRestart: _restart, ...facts } = editor.read.children()[from];

  editor.update.nodes.insert(
    { ...facts, children: [{ text }] },
    { at: [from + 1] }
  );
};

const fixture = (name: string) => {
  const buffer = fs.readFileSync(
    new URL(
      `../../../../../../../apps/www/src/__tests__/package-integration/docx/${name}.docx`,
      import.meta.url
    )
  );

  return new Uint8Array(buffer).slice().buffer;
};

type GeneratedLevel = Readonly<{
  bullet: boolean;
  restart?: number;
  start: number;
}>;

type GeneratedParagraph = Readonly<{
  instance: number;
  level: number;
  text: string;
}>;

type GeneratedDocument = Readonly<{
  definitions: ReadonlyArray<readonly GeneratedLevel[]>;
  instances: ReadonlyArray<
    Readonly<{
      definition: number;
      overrides: ReadonlyMap<number, number>;
    }>
  >;
  paragraphs: ReadonlyArray<GeneratedParagraph | string>;
}>;

const seeded = (seed: number) => {
  let state = seed;

  return () => {
    state = (state * 1_103_515_245 + 12_345) % 2_147_483_648;

    return state / 2_147_483_648;
  };
};

const generateDocument = (seed: number): GeneratedDocument => {
  const next = seeded(seed);
  const pick = (count: number) => Math.floor(next() * count);
  const definitions = Array.from({ length: 1 + pick(2) }, () =>
    Array.from({ length: 3 }, (_, level) => ({
      bullet: level > 0 && next() < 0.15,
      restart: level > 0 && next() < 0.3 ? pick(level + 1) : undefined,
      start: next() < 0.3 ? 1 + pick(5) : 1,
    }))
  );
  const instances = Array.from({ length: 1 + pick(4) }, () => ({
    definition: pick(definitions.length),
    overrides: new Map(
      [0, 1, 2].flatMap((level) =>
        next() < 0.25 ? [[level, pick(6)] as const] : []
      )
    ),
  }));
  let level = pick(3);
  const paragraphs = Array.from({ length: 4 + pick(20) }, (_, index) => {
    if (next() < 0.1) return `p${index}`;
    level =
      next() < 0.15 ? pick(3) : Math.max(0, Math.min(2, level + pick(3) - 1));

    return { instance: pick(instances.length), level, text: `i${index}` };
  });

  return { definitions, instances, paragraphs };
};

const wordNumbers = (document: GeneratedDocument) => {
  const counts = new Map<string, number>();
  const seen = new Set<string>();

  return document.paragraphs.flatMap((generated) => {
    if (typeof generated === 'string') return [];

    const instance = document.instances[generated.instance];
    const levels = document.definitions[instance.definition];

    levels.forEach((rules, deeper) => {
      if (generated.level < (rules.restart ?? deeper)) {
        counts.delete(`${instance.definition}:${deeper}`);
      }
    });

    const first = !seen.has(`${generated.instance}:${generated.level}`);

    seen.add(`${generated.instance}:${generated.level}`);
    if (levels[generated.level].bullet) return [`${generated.text}:-`];

    const key = `${instance.definition}:${generated.level}`;
    const previous = counts.get(key);
    const override = instance.overrides.get(generated.level);
    const number =
      first && override !== undefined
        ? override
        : previous === undefined
          ? levels[generated.level].start
          : previous + 1;

    counts.set(key, number);

    return [`${generated.text}:${number}`];
  });
};

const generatedDocx = (document: GeneratedDocument) =>
  createDocx(
    document.paragraphs.map((item) =>
      typeof item === 'string'
        ? paragraph(item)
        : paragraph(item.text, item.instance + 1, item.level)
    ),
    [
      ...document.definitions.map((levels, id) =>
        abstractNum(
          id,
          levels.map((level) => ({
            format: level.bullet ? 'bullet' : 'decimal',
            restart: level.restart,
            start: level.start,
          }))
        )
      ),
      ...document.instances.map(
        (instance, id) =>
          `<w:num w:numId="${id + 1}"><w:abstractNumId w:val="${instance.definition}"/>${[
            ...instance.overrides,
          ]
            .map(
              ([level, start]) =>
                `<w:lvlOverride w:ilvl="${level}"><w:startOverride w:val="${start}"/></w:lvlOverride>`
            )
            .join('')}</w:num>`
      ),
    ]
  );

// Expected numbers are Word's, as MS-DOC 2.4.6.4 counts them: one sequence
// per definition and level shared by its instances, and a start override that
// resets it once, at the instance's first paragraph at that level.
describe('DOCX numbering import', () => {
  it('continues a Word list past interrupting paragraphs', async () => {
    expect(await importNumbers(fixture('lists_continuing'))).toEqual([
      'Foo:1',
      'Bar:2',
      'Baz:3',
      'Bop:4',
    ]);
  });

  // The first definition's level starts at 2.
  it('starts a new list for another abstract definition', async () => {
    expect(await importNumbers(fixture('lists_restarting'))).toEqual([
      'Foo:2',
      'Bar:3',
      'Baz:4',
      'Bop.:1',
    ]);
  });

  it('numbers interleaved lists on their own', async () => {
    const source = await createDocx(
      [
        paragraph('A1', 1),
        paragraph('B1', 2),
        paragraph('A2', 1),
        paragraph('B2', 2),
      ],
      [abstractNum(0), abstractNum(1), num(1, 0), num(2, 1)]
    );

    expect(await importNumbers(source)).toEqual([
      'A1:1',
      'B1:1',
      'A2:2',
      'B2:2',
    ]);
  });

  it('maps a start override after the same definition to a restart', async () => {
    const source = await createDocx(
      [
        paragraph('One', 1),
        paragraph('Two', 1),
        paragraph('Note'),
        paragraph('Again', 2),
        paragraph('More', 2),
        paragraph('Back', 1),
      ],
      [abstractNum(0), num(1, 0), num(2, 0, 1)]
    );

    expect(await importNumbers(source)).toEqual([
      'One:1',
      'Two:2',
      'Again:1',
      'More:2',
      'Back:3',
    ]);
  });

  it('continues a definition after a restart the way Word counts it', async () => {
    const source = await createDocx(
      [
        paragraph('A1', 1),
        paragraph('A2', 1),
        paragraph('A3', 1),
        paragraph('C1', 2),
        paragraph('A4', 1),
      ],
      [abstractNum(0), num(1, 0), num(2, 0, 1)]
    );

    const children = await importChildren(source);

    expect(await importNumbers(source)).toEqual([
      'A1:1',
      'A2:2',
      'A3:3',
      'C1:1',
      'A4:2',
    ]);
    expect(children.map((node) => node.listRestart ?? null)).toEqual([
      null,
      null,
      null,
      1,
      null,
    ]);
  });

  it('keeps Word numbers for restarted instances that interleave', async () => {
    const source = await createDocx(
      [
        paragraph('A1', 1),
        paragraph('B1', 2),
        paragraph('D1', 3),
        paragraph('D2', 3),
        paragraph('B2', 2),
      ],
      [abstractNum(0), num(1, 0), num(2, 0, 1), num(3, 0, 1)]
    );

    expect(await importNumbers(source)).toEqual([
      'A1:1',
      'B1:1',
      'D1:1',
      'D2:2',
      'B2:3',
    ]);
  });

  it('keeps Word numbers for interleaved start-override instances', async () => {
    const source = await createDocx(
      [
        paragraph('A1', 1),
        paragraph('B1', 2),
        paragraph('A2', 1),
        paragraph('B2', 2),
      ],
      [abstractNum(0), num(1, 0, 1), num(2, 0, 1)]
    );
    const children = await importChildren(source);

    expect(await importNumbers(source)).toEqual([
      'A1:1',
      'B1:1',
      'A2:2',
      'B2:3',
    ]);
    expect(new Set(children.map((node) => node.listId)).size).toBe(1);
    expect(children.map((node) => node.listRestart ?? null)).toEqual([
      1,
      1,
      null,
      null,
    ]);
  });

  it('keeps counting interleaved restarted instances after an insert into either', async () => {
    const source = await createDocx(
      [
        paragraph('A1', 1),
        paragraph('B1', 2),
        paragraph('A2', 1),
        paragraph('B2', 2),
      ],
      [abstractNum(0), num(1, 0, 1), num(2, 0, 1)]
    );

    expect(await importNumbers(source, continueAfter(0, 'A1b'))).toEqual([
      'A1:1',
      'A1b:2',
      'B1:1',
      'A2:2',
      'B2:3',
    ]);
    expect(await importNumbers(source, continueAfter(1, 'B1b'))).toEqual([
      'A1:1',
      'B1:1',
      'B1b:2',
      'A2:3',
      'B2:4',
    ]);
  });

  // Word ignores w:start and w:lvlRestart inside a level override (MS-OI29500
  // 17.9.25 and 17.9.10).
  it('keeps the level text a level override gives a level, not its restart rule', async () => {
    const source = await createDocx(
      [
        paragraph('1', 1),
        paragraph('1.1', 1, 1),
        paragraph('2', 1),
        paragraph('2.2', 1, 1),
      ],
      [
        abstractNum(0),
        numWithLevel(
          1,
          0,
          1,
          '<w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlRestart w:val="0"/><w:lvlText w:val="%2)"/>'
        ),
      ]
    );
    const children = await importChildren(source);

    expect(children.filter((node) => 'listRestart' in node)).toEqual([]);
    expect(children[1]).toMatchObject({
      listLevels: { '2': { label: '%2)' } },
    });
    expect(children[1]).not.toHaveProperty('listLevels.2.restartAfter');
    expect(await importNumbers(source)).toEqual([
      '1:1',
      '1.1:1',
      '2:2',
      '2.2:1',
    ]);
  });

  it('numbers a level from its definition start, not a level override start', async () => {
    const source = await createDocx(
      [paragraph('Five', 1), paragraph('Six', 1)],
      [
        abstractNum(0),
        numWithLevel(
          1,
          0,
          0,
          '<w:start w:val="5"/><w:numFmt w:val="decimal"/><w:lvlText w:val="%1."/>'
        ),
      ]
    );

    expect(await importNumbers(source)).toEqual(['Five:1', 'Six:2']);
  });

  it('reopens a restarted deeper level at its definition start after a parent item', async () => {
    const source = await createDocx(
      [
        paragraph('P1', 1),
        paragraph('C1', 2, 1),
        paragraph('C2', 2, 1),
        paragraph('P2', 1),
        paragraph('C3', 2, 1),
      ],
      [
        abstractNum(0),
        num(1, 0),
        `<w:num w:numId="2"><w:abstractNumId w:val="0"/><w:lvlOverride w:ilvl="1"><w:startOverride w:val="5"/></w:lvlOverride></w:num>`,
      ]
    );

    expect(await importNumbers(source)).toEqual([
      'P1:1',
      'C1:5',
      'C2:6',
      'P2:2',
      'C3:1',
    ]);
  });

  it('numbers a list whose first paragraph sits at the third level', async () => {
    const source = await createDocx(
      [paragraph('X', 1, 2), paragraph('Y', 1, 2), paragraph('Z', 1)],
      [abstractNum(0), num(1, 0)]
    );

    expect(await importNumbers(source)).toEqual(['X:1', 'Y:2', 'Z:1']);
  });

  // The structure of pandoc's test/docx/lists_restart_8367.docx, which
  // Microsoft Word 16 wrote: a style-based list whose second section restarts
  // through a new instance on its first item only.
  it('restarts a style-based list on one item the way Word writes it', async () => {
    const styled = (text: string) =>
      `<w:p><w:pPr><w:pStyle w:val="ListNumber"/></w:pPr><w:r><w:t>${text}</w:t></w:r></w:p>`;
    const source = await createDocx(
      [
        styled('S1 one'),
        styled('S1 two'),
        styled('S1 three'),
        paragraph('Conclusion'),
        `<w:p><w:pPr><w:pStyle w:val="ListNumber"/><w:numPr><w:numId w:val="2"/></w:numPr></w:pPr><w:r><w:t>S2 one</w:t></w:r></w:p>`,
        styled('S2 two'),
        styled('S2 three'),
        styled('S2 four'),
      ],
      [abstractNum(0), num(1, 0), num(2, 0, 1)],
      [
        '<w:style w:type="paragraph" w:styleId="ListNumber"><w:pPr><w:numPr><w:numId w:val="1"/></w:numPr></w:pPr></w:style>',
      ]
    );

    expect(await importNumbers(source)).toEqual([
      'S1 one:1',
      'S1 two:2',
      'S1 three:3',
      'S2 one:1',
      'S2 two:2',
      'S2 three:3',
      'S2 four:4',
    ]);
    expect(await importNumbers(source, continueAfter(1, 'S1 more'))).toEqual([
      'S1 one:1',
      'S1 two:2',
      'S1 more:3',
      'S1 three:4',
      'S2 one:1',
      'S2 two:2',
      'S2 three:3',
      'S2 four:4',
    ]);
  });

  it('keeps a bullet instance of a numbered level out of the count, as Plate reads it', async () => {
    const source = await createDocx(
      [paragraph('A1', 1), paragraph('B1', 2), paragraph('A2', 1)],
      [
        abstractNum(0),
        num(1, 0),
        numWithLevel(
          2,
          0,
          0,
          '<w:numFmt w:val="bullet"/><w:lvlText w:val="•"/>'
        ),
      ]
    );

    expect(await importNumbers(source)).toEqual(['A1:1', 'B1:-', 'A2:2']);
  });

  it('treats a lvlRestart naming its own level as the default, as Plate reads it', async () => {
    const source = await createDocx(
      [
        paragraph('1', 1),
        paragraph('1.1', 1, 1),
        paragraph('1.2', 1, 1),
        paragraph('2', 1),
        paragraph('2.1', 1, 1),
      ],
      [abstractNum(0, [{}, { restart: 2 }]), num(1, 0)]
    );

    expect(await importNumbers(source)).toEqual([
      '1:1',
      '1.1:1',
      '1.2:2',
      '2:2',
      '2.1:1',
    ]);
  });

  it('opens a list at its start override and level start', async () => {
    const source = await createDocx(
      [
        paragraph('Five', 1),
        paragraph('Six', 1),
        paragraph('Note'),
        paragraph('Three', 2),
        paragraph('Four', 2),
      ],
      [abstractNum(0), abstractNum(1, [{ start: 3 }]), num(1, 0, 5), num(2, 1)]
    );

    expect(await importNumbers(source)).toEqual([
      'Five:5',
      'Six:6',
      'Three:3',
      'Four:4',
    ]);
  });

  it('keeps a level that never restarts counting', async () => {
    const source = await createDocx(
      [
        paragraph('1', 1),
        paragraph('1.1', 1, 1),
        paragraph('2', 1),
        paragraph('2.2', 1, 1),
      ],
      [abstractNum(0, [{}, { restart: 0 }]), num(1, 0)]
    );

    expect(await importNumbers(source)).toEqual([
      '1:1',
      '1.1:1',
      '2:2',
      '2.2:2',
    ]);
  });

  // `lvlRestart` 1 restarts level 3 only after level 1, as ECMA-376 17.9.11
  // reads it.
  it('restarts a level only after the level its lvlRestart names', async () => {
    const source = await createDocx(
      [
        paragraph('1', 1),
        paragraph('1.1', 1, 1),
        paragraph('1.1.1', 1, 2),
        paragraph('1.2', 1, 1),
        paragraph('1.2.2', 1, 2),
        paragraph('2', 1),
        paragraph('2.1.1', 1, 2),
      ],
      [abstractNum(0, [{}, {}, { restart: 1 }]), num(1, 0)]
    );

    expect(await importNumbers(source)).toEqual([
      '1:1',
      '1.1:1',
      '1.1.1:1',
      '1.2:2',
      '1.2.2:2',
      '2:2',
      '2.1.1:1',
    ]);
  });

  it('counts a list in a table cell in body order', async () => {
    const source = await createDocx(
      [
        paragraph('One', 1),
        table(paragraph('Two', 1), paragraph('Three', 1)),
        paragraph('Four', 1),
      ],
      [abstractNum(0), num(1, 0)]
    );

    expect(await importNumbers(source)).toEqual([
      'One:1',
      'Two:2',
      'Three:3',
      'Four:4',
    ]);
  });

  it('continues two instances of one definition as one list', async () => {
    const source = await createDocx(
      [paragraph('One', 1), paragraph('Note'), paragraph('Two', 2)],
      [abstractNum(0), num(1, 0), num(2, 0)]
    );

    expect(await importNumbers(source)).toEqual(['One:1', 'Two:2']);
  });

  it('numbers 200 generated Word documents as Word counts them, before and after an insert', async () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      const document = generateDocument(seed);
      const source = await generatedDocx(document);

      expect({
        numbers: await importNumbers(source),
        seed,
      }).toEqual({ numbers: wordNumbers(document), seed });

      const numbered = document.paragraphs.flatMap((item, index) =>
        typeof item === 'string' ||
        document.definitions[document.instances[item.instance].definition][
          item.level
        ].bullet
          ? []
          : [index]
      );

      if (numbered.length === 0) continue;

      // Enter after a numbered paragraph copies its numbering properties.
      const at = numbered[seed % numbered.length];
      const after = {
        ...document,
        paragraphs: document.paragraphs.toSpliced(at + 1, 0, {
          ...(document.paragraphs[at] as GeneratedParagraph),
          text: 'x',
        }),
      };

      expect({
        numbers: await importNumbers(source, (editor) =>
          continueAfter(
            editor.read
              .children()
              .findIndex(
                (node) =>
                  NodeApi.string(node) ===
                  (document.paragraphs[at] as GeneratedParagraph).text
              ),
            'x'
          )(editor)
        ),
        seed,
      }).toEqual({ numbers: wordNumbers(after), seed });
    }
  }, 120_000);
});
