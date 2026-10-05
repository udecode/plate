// Probe: the diff panel's round-2 cases against a Plite source root given in PLITE_SRC.
const root = process.env.PLITE_SRC!;
const { createEditor, defineEffect, definePlugin } = await import(`${root}/index.ts`);
const { history } = await import(`${root}/history/index.ts`);

const para = (text: string) => ({ type: 'paragraph', children: [{ text }] });
const rows: string[] = [];
const log = (k: string, v: unknown) => rows.push(`${k}\t${JSON.stringify(v)}`);
type T = { previous: string; value: string };
let n = 0;

const setup = (replay: (t: T) => unknown, options: Record<string, unknown> = {}) => {
  const errors: unknown[] = [];
  n += 1;
  const eff = defineEffect<T>({
    history: { replay: (_e: unknown, t: T) => replay(t) as never },
    invert: ({ previous, value }: T) => ({ previous: value, value: previous }),
    key: `probe.round2.${n}`,
  });
  const editor: any = createEditor({
    lifecycleErrorSink: (error: { cause: unknown }) => errors.push(error.cause),
    plugins: [history(options), definePlugin(`probe-round2-${n}`, { effectTypes: [eff] })],
    initialValue: [para('')],
  });
  editor.update((tx: any) => tx.effects.emit(eff, { previous: '', value: 'x' }));
  return { editor, errors };
};

// (a) a valid synchronous result that carries then: undefined
{
  const { editor } = setup((t) => ({ status: 'applied', then: undefined, value: t }));
  const result = editor.api.history.undo();
  log('thenUndefined.status', result.status);
  log('thenUndefined.redosRightAfterCall', editor.read.history().redos.length);
}

// (b) an owner that returns undefined
{
  const { editor, errors } = setup(() => undefined);
  let thrown: string | null = null;
  let status: unknown = null;
  try {
    status = editor.api.history.undo().status;
  } catch (error) {
    thrown = String(error).slice(0, 60);
  }
  log('undefinedResult.status', status);
  log('undefinedResult.thrown', thrown);
  log('undefinedResult.pendingAfter', editor.read.history.pending());
  log('undefinedResult.reports', errors.length);
}

// (c) the blocked settlement throws the same error every time
for (const mode of ['always', 'once'] as const) {
  const failure = new Error('settle failed');
  let armed = false;
  let throws = 0;
  const options = {
    get maxDepth() {
      if (armed && (mode === 'always' || throws === 0)) {
        throws += 1;
        throw failure;
      }
      return 100;
    },
  };
  const { editor, errors } = setup(() => {
    armed = true;
    return { reason: 'refused', status: 'blocked' };
  }, options);
  const result = editor.api.history.undo();
  armed = false;
  log(`blockedThrows.${mode}.status`, result.status);
  log(`blockedThrows.${mode}.reports`, errors.length);
  log(`blockedThrows.${mode}.pendingAfter`, editor.read.history.pending());
}

console.log(rows.join('\n'));
