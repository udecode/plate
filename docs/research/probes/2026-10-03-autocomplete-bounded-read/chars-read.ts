import { createEditor } from '../../../../packages/plitejs/src/index';
import { replace } from '../../../../packages/plitejs/src/internal';
import {
  findTypedTrigger,
  readComboboxQuery,
} from '../../../../packages/platejs/src/features/combobox/lib/combobox.internal';

const state = {
  maxQueryLength: 75,
  queryPattern: null,
  trigger: '@',
  triggerPreviousCharPattern: /^\s?$/,
  triggerQuery: null,
};

let counted = 0;
const count = <K extends 'slice' | 'lastIndexOf' | 'indexOf'>(name: K) => {
  const original = String.prototype[name] as (...args: unknown[]) => unknown;
  (String.prototype as unknown as Record<K, unknown>)[name] = function (
    this: string,
    ...args: unknown[]
  ) {
    counted += name === 'slice' ? 0 : this.length;
    const result = original.apply(this, args);
    if (name === 'slice' && typeof result === 'string') counted += result.length;
    return result;
  };
  return () => {
    (String.prototype as unknown as Record<K, unknown>)[name] = original;
  };
};

const CHAR_BUDGET = 16;
const rows: Array<Record<string, unknown>> = [];

for (const size of [2_000, 20_000, 200_000]) {
  const prose = 'a'.repeat(size);
  const text = `${prose} @jo`;
  const editor = createEditor();
  replace(editor, {
    children: [{ children: [{ text }], type: 'paragraph' }],
    selection: {
      anchor: { offset: text.length, path: [0, 0] },
      focus: { offset: text.length, path: [0, 0] },
      kind: 'text',
    },
  });
  const caret = { offset: size + 2, path: [0, 0] };
  const restore = [count('slice'), count('lastIndexOf'), count('indexOf')];
  counted = 0;
  const idle = findTypedTrigger(
    editor.read,
    { caret: { offset: size, path: [0, 0] }, length: 1 },
    state
  );
  const idleChars = counted;
  counted = 0;
  const trigger = findTypedTrigger(editor.read, { caret, length: 1 }, state);
  const triggerChars = counted;
  counted = 0;
  const query = trigger
    ? readComboboxQuery(
        editor.read,
        {
          caret: { offset: text.length, path: [0, 0] },
          typedExtentEnd: { offset: text.length, path: [0, 0] },
          trigger,
          triggerText: '@',
        },
        state
      )
    : null;
  const queryChars = counted;
  for (const undo of restore) undo();
  const row = { idle: !!idle, idleChars, query, queryChars, size, trigger: !!trigger, triggerChars };
  rows.push(row);
  console.log(JSON.stringify(row));
}

const failures = rows.flatMap((row) => [
  ...(row.idle !== false || row.trigger !== true || row.query !== 'jo' ? [`wrong match at ${row.size}`] : []),
  ...(['idleChars', 'triggerChars', 'queryChars'] as const)
    .filter((key) => row[key] !== rows[0][key] || (row[key] as number) > CHAR_BUDGET)
    .map((key) => `${key} at ${row.size} is ${row[key]}`),
]);

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}
