# Dates

Page: https://claude.ai/artifact/JPnEr8maZeGonmoMe6vA83

The ledger asks what a date node should persist and which formatting belongs to application UI. A date is an inline void element that `BaseDatePlugin` owns in `platejs/date`. It stores one required non-blank `value` string, a canonical `YYYY-MM-DD` calendar day or text the author wrote, such as `sometime next week`. The package owns the schema, the Markdown tag, the `insert` update and two codec functions: `formatDateValue` writes a picked day, and `parseCanonicalDateValue` tells a day from authored text. Each copied date item builds its own label. The [2026-10-04 audit](../../research/review-records/2026-10-04-date-audit.json) judged the persisted union right and the label in the wrong owner, and the [2026-10-20 plan](../2026-10-20-date-label.md) moved the label into the copied items. Whether the live chip keeps its relative words is the open question of decide chip t_6942b9cb. `node tooling/scripts/review-ledger.mjs show date` prints the full history.

## Public API

The copied live item builds its label during render and edits the value through the calendar.

```tsx
// apps/www/src/registry/components/editor/date.tsx
import { formatDateValue, parseCanonicalDateValue } from 'platejs/date';

const DAY_MS = 86_400_000;
const RELATIVE_DAYS: Partial<Record<number, string>> = {
  [-1]: 'Yesterday',
  0: 'Today',
  1: 'Tomorrow',
};
const dateFormat = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'long',
  timeZone: 'UTC',
});

const getDateLabel = (value: string) => {
  if (!parseCanonicalDateValue(value)) return value;

  const day = Date.parse(value);
  const today = Date.parse(formatDateValue(new Date()));

  return RELATIVE_DAYS[(day - today) / DAY_MS] ?? dateFormat.format(day);
};

{getDateLabel(element.value)}

<Calendar
  selected={parseCanonicalDateValue(element.value)}
  onSelect={(date) => {
    if (!date) return;

    editor.update.nodes.set(
      { value: formatDateValue(date) },
      { at: element }
    );
  }}
  mode="single"
  autoFocus
/>
```

The copied static item always prints the full date, so an export never says Today.

```tsx
// apps/www/src/registry/components/editor/date-static.tsx
import { BaseDatePlugin, parseCanonicalDateValue } from 'platejs/date';

const dateFormat = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'long',
  timeZone: 'UTC',
});

const getDateLabel = (value: string) =>
  parseCanonicalDateValue(value) ? dateFormat.format(Date.parse(value)) : value;

{getDateLabel(element.value)}
```

The insert update takes a `Date` or a string and the standard node placement options. It stores a valid `Date` as its local day and a string trimmed, as typed.

```ts
// content/docs/(plugins)/(elements)/date.mdx
editor.plugin(BaseDatePlugin).update.insert({}, { select: true });
```

```ts
// packages/platejs/src/features/date/lib/BaseDatePlugin.spec.tsx
editor.update.date.insert({ value: 'Mon Mar 23 2026' }); // stores 'Mon Mar 23 2026'
```

## Main changes

- `BaseDatePlugin` owns the `date` inline void element, its required `value` property, the Markdown `<date>` tag and `update.insert`. `insert` stores `formatDateValue(value)` for a valid `Date`, a string trimmed, today when the input is missing, and nothing for an invalid `Date` or a blank string.
- One internal reader recognizes v1's `Date.toDateString()` text, such as `Mon Mar 23 2026`, with a weekday and month table checked through `Date.UTC`, so the host zone never changes its answer and impossible days stay text. Only the Markdown reader and the v54 migration call it.
- The Markdown reader converts that v1 text from a `value` attribute or child text and keeps a `text` attribute as written. The writer writes a `value` attribute for a day and a `text` attribute for any other text, because Markdown changes child text at a blank line or an emoji shortcode. The shared tag attribute codec writes a NUL character as `&#0;` and reads it back.
- The v54 migration converts a v1 `date` written by `toDateString()` into a day. A v1 `rawDate` and any other text stay as written.
- Both copied labels format the stored day in UTC from `Date.parse(value)`, so the printed day does not depend on the host zone, except a day the host zone skipped, which prints as stored text. The live chip reads the clock during render, so server HTML uses the server's day, and React re-renders from the nearest Suspense boundary when the reader's day differs.

## What other editors do

Read at Lexical `dd5c41b131`, Tiptap `91c51be53c`, ProseMirror `c7f2f1d7bd`, Slate `945a484df2` and CKEditor 5 `14e73cc31b` from source, and BlockNote and Notion from their docs, nothing run. Only Lexical's playground and Notion ship an inline date, and both build the label in app code, which is where Plate's lives.

| Editor | Inline date | Stored value | Who builds the label | Static or export text |
| --- | --- | --- | --- | --- |
| Plate | Package `date` inline void | One `value`: a `YYYY-MM-DD` day or authored text | Each copied item: relative words in the live chip, computed during render, and the full date in the static item | The full date in the copied locale, fixed at export |
| Lexical | Playground `DateTimeNode` only | An ISO `dateTime` instant | Playground component, `toDateString()` plus a time | `toDateString()` text in a `data-lexical-datetime` span |
| Tiptap | None; the generic mention only | None | None | None |
| ProseMirror | None in the meta-repository | None | None | None |
| Slate | None; the mentions example is app code | None | None | None |
| CKEditor 5 | None; a tutorial inserts a timestamp as text | Plain text | Formatted once at insertion | The inserted text |
| BlockNote | None by default; custom inline content | App-defined | App-defined `render` | App-defined `toExternalHTML` |
| Notion | Built-in date mention | API shape `date: { start: '2022-12-16' }` | The app, with today, tomorrow and yesterday | API `plain_text` is the ISO day |

## Document shape

The v54 migration writes a day for a v1 node `{ "type": "date", "date": "Mon Mar 23 2026" }`, which v1 stored through `toDateString()` until 2026-04-18. Only a day selects a date in the copied calendar.

```json
{ "children": [{ "text": "" }], "type": "date", "value": "2026-03-23" }
```

`update.insert({ value: 'Mon Mar 23 2026' })` stores the typed text, which the label prints as typed.

```json
{ "children": [{ "text": "" }], "type": "date", "value": "Mon Mar 23 2026" }
```

The Markdown writer gives any authored text a `text` attribute, which the reader keeps as written. A day keeps its `value` attribute.

```md
Date: <date text="Mon Mar 23 2026" />
```

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| Value codec, two exports | Plate | `platejs/date` | `formatDateValue` writes a picked day, `parseCanonicalDateValue` tells a day from authored text; both have copied-item consumers |
| v1 day reader | Plate | `platejs/date`, internal file | The Markdown reader and the v54 migration share it; `brl` leaves `.internal` files out of the barrel |
| Markdown `text` attribute | Plate | `platejs/date`, `BaseDatePlugin`'s Markdown mapping | The plugin owns its tag; Markdown changes child text, so only an attribute keeps authored text exact |
| v54 conversion of a v1 `date` | Plate | `platejs/migrations` | The migration owns historical fields; `entrypoint-dag.mjs` lets `migrations` depend on `date` |
| Live label with relative words | Plate copied UI | registry `date` | Copied UI owns visible copy and its clock ([plate.md](../../vision/plate.md)) |
| Static label | Plate copied UI | registry `date-static` | Sibling items duplicate label helpers instead of sharing a third file ([plate.md](../../vision/plate.md)) |
| Demo values | Plate copied UI | registry examples | The block route prerenders at build time, so a day read at module load differs from the browser's |

## Open work

- Time the live label on a quiet host, because every run of the frozen probe was inconclusive on host load. Owner: zbeyens. Stop: suggested task t_6cf08868 lands or is dropped, tracked in the suggested-tasks ledger.
- Decide whether the live chip drops Today, Yesterday and Tomorrow for the full date. Owner: zbeyens. Stop: decide chip t_6942b9cb lands or is dropped, tracked in the suggested-tasks ledger.
- A day a time zone skipped prints as stored text in that zone. Owner: zbeyens. Stop: a report of a chip on such a day.
