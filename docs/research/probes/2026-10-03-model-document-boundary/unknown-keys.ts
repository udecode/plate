import { createEditor, defineEditorSchema, schema } from '../../../../packages/plitejs/src/index.ts';

const Closed = defineEditorSchema('schema:probe-unknown-keys', {
  elements: { paragraph: schema.element.textBlock() },
  root: schema.content.type('paragraph', { min: 1 }),
});
const children = [{ children: [{ text: 'x' }], type: 'paragraph' }];
const cases: [string, unknown][] = [
  ['control: valid document', { children }],
  ['control: key inside meta', { children, meta: { extra: 1 } }],
  ['unknown top-level key (JSON)', { children, extra: 1 }],
  ['unknown top-level key (non-JSON)', { children, extra: () => 1 }],
];
const modes = [
  ['raw', (v?: unknown) => createEditor(v === undefined ? {} : { initialValue: v as never })],
  ['closed', (v?: unknown) => createEditor({ plugins: [Closed], ...(v === undefined ? {} : { initialValue: v as never }) })],
] as const;
const run = (fn: () => unknown) => { try { const r = fn(); return { ok: true, r }; } catch (e) { return { ok: false, e: String((e as Error).message).slice(0, 70) }; } };
const keys = (v: unknown) => (v && typeof v === 'object' ? Object.keys(v as object).sort().join(',') : String(v));
for (const [mode, create] of modes) {
  for (const [name, doc] of cases) {
    const base = create();
    const assertion = run(() => base.read.schema.assertDocument(doc));
    const construct = run(() => create(doc));
    const fit = run(() => base.read.schema.fitDocument(doc as never));
    const direct = create();
    const replace = run(() => direct.update.value.replace(doc as never));
    const env = create();
    const envelope = run(() => env.update.value.replace({ document: doc, schema: env.read.schema.identity() } as never));
    const fmt = (x: any, ed?: any) => x.ok ? `accept${ed ? `[${keys(ed.read.value())}]` : x.r !== undefined ? `[${keys(x.r)}]` : ''}` : `reject(${x.e})`;
    console.log(`${mode} | ${name} | assertDocument ${fmt(assertion)} | construct ${construct.ok ? `accept[${keys((construct.r as any).read.value())}]` : `reject(${construct.e})`} | fit ${fmt(fit)} | replace ${replace.ok ? `accept[${keys(direct.read.value())}]` : `reject(${replace.e})`} | envelope ${envelope.ok ? `accept[${keys(env.read.value())}]` : `reject(${envelope.e})`}`);
  }
}
