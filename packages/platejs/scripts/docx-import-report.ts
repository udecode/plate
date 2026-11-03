/**
 * Imports every small DOCX built from the elements that once hid a loss, such
 * as a checkbox, custom XML, a text box under a field or a shaded header, and
 * fails when a strict import succeeds while its result lacks text Word shows
 * or the package's header or footer draws anything. It compares the import's
 * report with its own result, so it needs no Word.
 */
import { spawn } from 'node:child_process';
import { availableParallelism } from 'node:os';
import { fileURLToPath } from 'node:url';

import JSZip from 'jszip';

const SHARD = 'DOCX_IMPORT_REPORT_SHARD';

const NAMESPACES = [
  'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"',
  'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"',
  'xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"',
  'xmlns:v="urn:schemas-microsoft-com:vml"',
  'xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"',
  'xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"',
  'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"',
  'xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"',
  'mc:Ignorable="w14 wp wps"',
].join(' ');

const paragraph = (text: string) => `<w:p><w:r><w:t>${text}</w:t></w:r></w:p>`;
const vmlBox = (text: string) =>
  `<w:pict><v:shape><v:textbox><w:txbxContent>${paragraph(text)}</w:txbxContent></v:textbox></v:shape></w:pict>`;
const drawingBox = (text: string) =>
  `<w:drawing><wp:anchor><wp:docPr id="1" name="Box"/><a:graphic><a:graphicData uri="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"><wps:wsp><wps:txbx><w:txbxContent>${paragraph(text)}</w:txbxContent></wps:txbx></wps:wsp></a:graphicData></a:graphic></wp:anchor></w:drawing>`;

const LEAVES = [
  { name: 'text', seen: 'Plain', xml: '<w:r><w:t>Plain</w:t></w:r>' },
  {
    name: 'checkbox',
    seen: '☒',
    xml: '<w:sdt><w:sdtPr><w14:checkbox><w14:checked w14:val="1"/></w14:checkbox></w:sdtPr><w:sdtContent><w:r><w:t>☒</w:t></w:r></w:sdtContent></w:sdt>',
  },
  { name: 'VML text box', seen: 'Shape', xml: `<w:r>${vmlBox('Shape')}</w:r>` },
  {
    name: 'DrawingML text box',
    seen: 'Drawn',
    xml: `<w:r>${drawingBox('Drawn')}</w:r>`,
  },
  {
    name: 'alternate text box',
    seen: 'Either',
    xml: `<w:r><mc:AlternateContent><mc:Choice Requires="wps">${drawingBox('Either')}</mc:Choice><mc:Fallback>${vmlBox('Either')}</mc:Fallback></mc:AlternateContent></w:r>`,
  },
];

const WRAPPERS = [
  {
    name: 'custom XML',
    wrap: (xml: string) =>
      `<w:customXml w:uri="urn:x" w:element="tag">${xml}</w:customXml>`,
  },
  {
    name: 'content control',
    wrap: (xml: string) =>
      `<w:sdt><w:sdtPr><w:alias w:val="Field"/></w:sdtPr><w:sdtContent>${xml}</w:sdtContent></w:sdt>`,
  },
  {
    name: 'smart tag',
    wrap: (xml: string) =>
      `<w:smartTag w:uri="urn:x" w:element="place">${xml}</w:smartTag>`,
  },
  {
    name: 'hyperlink',
    wrap: (xml: string) => `<w:hyperlink w:anchor="mark">${xml}</w:hyperlink>`,
  },
  {
    name: 'simple field',
    wrap: (xml: string) => `<w:fldSimple w:instr=" PAGE ">${xml}</w:fldSimple>`,
  },
  {
    name: 'insertion',
    wrap: (xml: string) =>
      `<w:ins w:id="7" w:author="Ada" w:date="2026-10-10T00:00:00Z">${xml}</w:ins>`,
  },
];

type Story = Readonly<{ body: string; footer?: string; header?: string }>;

const PARAGRAPH_PLACES: ReadonlyArray<{
  name: string;
  story: (runs: string) => Story;
}> = [
  { name: 'body', story: (runs) => ({ body: `<w:p>${runs}</w:p>` }) },
  {
    name: 'block custom XML',
    story: (runs) => ({
      body: `<w:customXml w:uri="urn:x" w:element="section"><w:p>${runs}</w:p></w:customXml>`,
    }),
  },
  {
    name: 'block content control',
    story: (runs) => ({
      body: `<w:sdt><w:sdtPr/><w:sdtContent><w:p>${runs}</w:p></w:sdtContent></w:sdt>`,
    }),
  },
  {
    name: 'table cell',
    story: (runs) => ({
      body: `<w:tbl><w:tr><w:tc><w:p>${runs}</w:p></w:tc></w:tr></w:tbl><w:p/>`,
    }),
  },
  {
    name: 'header',
    story: (runs) => ({
      body: paragraph('Body'),
      header: `<w:p>${runs}</w:p>`,
    }),
  },
  {
    name: 'footer',
    story: (runs) => ({
      body: paragraph('Body'),
      footer: `<w:p>${runs}</w:p>`,
    }),
  },
];

const PLUGIN_SETS = ['paragraphs only', 'links and tables'] as const;

type Case = Readonly<{
  name: string;
  plugins: (typeof PLUGIN_SETS)[number];
  /** Text Word shows that the imported document must hold. */
  seen: readonly string[];
  story: Story;
}>;

const chains = [
  [],
  ...WRAPPERS.map((wrapper) => [wrapper]),
  ...WRAPPERS.flatMap((outer) => WRAPPERS.map((inner) => [outer, inner])),
];

const stories = [
  ...PARAGRAPH_PLACES.flatMap((place) =>
    LEAVES.flatMap((leaf) =>
      chains.map((chain) => ({
        name: [
          place.name,
          ...chain.map((wrapper) => wrapper.name),
          leaf.name,
        ].join(' > '),
        seen: [leaf.seen],
        story: place.story(
          chain.reduceRight((xml, wrapper) => wrapper.wrap(xml), leaf.xml)
        ),
      }))
    )
  ),
  ...(['header', 'footer'] as const).flatMap((part) =>
    [
      ['fill', '<w:shd w:val="clear" w:color="auto" w:fill="FFFF00"/>'],
      [
        'theme fill',
        '<w:shd w:val="clear" w:color="auto" w:themeFill="accent1"/>',
      ],
      [
        'border',
        '<w:pBdr><w:top w:val="single" w:sz="8" w:space="1" w:color="auto"/></w:pBdr>',
      ],
    ].map(([drawing, xml]) => ({
      name: `${part} > empty paragraph with a ${drawing}`,
      seen: [],
      story: {
        body: paragraph('Body'),
        [part]: `<w:p><w:pPr>${xml}</w:pPr></w:p>`,
      },
    }))
  ),
];

const cases: Case[] = PLUGIN_SETS.flatMap((plugins) =>
  stories.map((story) => ({ ...story, plugins }))
);

const docx = async (story: Story) => {
  const zip = new JSZip();
  const parts = (['header', 'footer'] as const).filter(
    (part) => story[part] !== undefined
  );
  const root = { footer: 'ftr', header: 'hdr' } as const;

  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>${parts
      .map(
        (part) =>
          `<Override PartName="/word/${part}1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.${part}+xml"/>`
      )
      .join('')}</Types>`
  );
  zip.file(
    '_rels/.rels',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'
  );
  zip.file(
    'word/_rels/document.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${parts
      .map(
        (part) =>
          `<Relationship Id="rId${part}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/${part}" Target="${part}1.xml"/>`
      )
      .join('')}</Relationships>`
  );
  for (const part of parts) {
    zip.file(
      `word/${part}1.xml`,
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:${root[part]} ${NAMESPACES}>${story[part]}</w:${root[part]}>`
    );
  }
  zip.file(
    'word/document.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ${NAMESPACES}><w:body>${story.body}<w:sectPr>${parts
      .map((part) => `<w:${part}Reference w:type="default" r:id="rId${part}"/>`)
      .join('')}</w:sectPr></w:body></w:document>`
  );

  return zip.generateAsync({ type: 'arraybuffer' });
};

type Shard = Readonly<{
  accepted: string[];
  refused: number;
  unreported: string[];
}>;

const runShard = async (shard: readonly Case[]): Promise<Shard> => {
  // importDocx reads DOMParser and the other DOM globals when it is called,
  // and zip.js needs the Node streams that happy-dom replaces.
  const { GlobalRegistrator } = await import('@happy-dom/global-registrator');
  const streams = await import('node:stream/web');

  GlobalRegistrator.register();
  Object.assign(globalThis, {
    ReadableStream: streams.ReadableStream,
    TransformStream: streams.TransformStream,
    WritableStream: streams.WritableStream,
  });
  const { importDocx } = await import('../src/docx/import/lib/importDocx');
  const { BaseParagraphPlugin } = await import('../src/lib');
  const { BaseLinkPlugin } =
    await import('../src/features/link/lib/BaseLinkPlugin');
  const { BaseTablePlugin } =
    await import('../src/features/table/lib/BaseTablePlugin');
  const plugins = {
    'links and tables': [BaseParagraphPlugin, BaseLinkPlugin, BaseTablePlugin],
    'paragraphs only': [BaseParagraphPlugin],
  };
  type Node = Readonly<{ children?: readonly Node[]; text?: string }>;
  const textOf = (nodes: readonly Node[]): string =>
    nodes.map((node) => node.text ?? textOf(node.children ?? [])).join('');
  const accepted: string[] = [];
  const unreported: string[] = [];
  let refused = 0;

  for (const { name, plugins: set, seen, story } of shard) {
    const label = `${name} (${set})`;
    const result = await importDocx(await docx(story), {
      lossPolicy: 'reject',
      plugins: plugins[set],
    });

    if (!result.ok) {
      refused += 1;
      continue;
    }
    accepted.push(label);
    const text = textOf(result.document.children);
    const missing = seen.filter((part) => !text.includes(part));

    if (story.header !== undefined || story.footer !== undefined) {
      unreported.push(
        `${label}: lost its ${story.header ? 'header' : 'footer'}`
      );
    } else if (missing.length > 0) {
      unreported.push(`${label}: lost ${missing.join(', ')}`);
    }
  }

  return { accepted, refused, unreported };
};

if (process.env[SHARD] !== undefined) {
  const shard = JSON.parse(await Bun.stdin.text()) as Case[];

  console.log(JSON.stringify(await runShard(shard)));
} else {
  const jobs = Math.min(availableParallelism(), 16);
  const shards = await Promise.all(
    Array.from(
      { length: jobs },
      (_, index) =>
        new Promise<Shard>((resolve, reject) => {
          const child = spawn(
            process.execPath,
            [...process.execArgv, fileURLToPath(import.meta.url)],
            {
              env: { ...process.env, [SHARD]: String(index) },
              stdio: ['pipe', 'pipe', 'inherit'],
            }
          );
          let output = '';

          child.on('error', reject);
          child.stdout.on('data', (chunk) => {
            output += chunk;
          });
          child.on('close', (code) => {
            if (code !== 0) {
              reject(new Error(`shard ${index} exited ${code}`));
              return;
            }
            resolve(
              JSON.parse(output.trim().split('\n').at(-1) ?? '') as Shard
            );
          });
          child.stdin.end(
            JSON.stringify(cases.filter((_case, at) => at % jobs === index))
          );
        })
    )
  );
  const accepted = new Set(shards.flatMap((shard) => shard.accepted));
  const refused = shards.reduce((sum, shard) => sum + shard.refused, 0);
  const unreported = shards.flatMap((shard) => shard.unreported).sort();
  const controls = PLUGIN_SETS.map((set) => `body > text (${set})`).filter(
    (label) => !accepted.has(label)
  );

  console.log(
    `docx-import-report: ${cases.length} files, ${accepted.size} imported under the strict policy, ${refused} refused.`
  );
  for (const label of controls) {
    console.error(
      `${label}: the strict import refused plain text, so no other file shows what the report hides.`
    );
  }
  for (const line of unreported) {
    console.error(`${line}, but the strict import reported no loss.`);
  }
  if (controls.length > 0 || unreported.length > 0) process.exit(1);
}
