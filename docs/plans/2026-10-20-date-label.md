---
review_scopes: [date]
review_basis: [2026-10-04-date-audit]
work_kind: implementation
review_commit: a28e4eecbe75238a877d013930570d749a582fa0
review_inputs: [VISION.md, docs/vision/common.md, docs/vision/plate.md, packages/platejs/src/features/date/lib/dateValue.ts, packages/platejs/src/features/date/lib/dateValue.spec.ts, packages/platejs/src/features/date/lib/BaseDatePlugin.ts, packages/platejs/src/features/date/lib/BaseDatePlugin.spec.tsx, packages/platejs/src/markdown/lib/dateElement.spec.ts, packages/platejs/src/migrations/migratePlateV54Ast.internal.ts, packages/platejs/src/migrations/migratePlateV54Ast.spec.ts, tooling/entrypoints/entrypoint-dag.mjs, apps/www/src/registry/components/editor/date.tsx, apps/www/src/registry/components/editor/date-static.tsx, apps/www/src/registry/components/editor/date.spec.tsx, apps/www/src/registry/components/editor/date-static.spec.tsx, apps/www/src/registry/components/editor/plugins-static.ts, apps/www/src/registry/examples/values/date-value.tsx, apps/www/src/registry/examples/values/cn/date-value.tsx, apps/www/src/registry/registry-features.ts, apps/www/api-reference.config.json, 'content/docs/(plugins)/(elements)/date.mdx', 'content/docs/(plugins)/(elements)/date.cn.mdx', .changeset/date-v54-runtime.md, docs/editor-behavior/markdown-editing-spec.md, docs/editor-behavior/current-evidence.md]
review_upstreams: ['../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca', '../prosemirror@c7f2f1d7bde70728dfedaa68ca8f5fc3dffa17cc', '../slate@945a484df2497e4c448b33f417b0de2a49840032', '../ckeditor5@14e73cc31b869ce483bd8449f40b9102ac7746da']
---

# Dates: labels in the copied items, old dates converted on the way in

Status: executed; step 5's probe reruns on a quiet host as suggested task t_6cf08868
Topic: date
Playbook: plan

The [2026-10-04 date audit](../research/review-records/2026-10-04-date-audit.json) judged the stored value right and the label in the wrong owner, and no plan adopted it. This plan builds that Pursue. `platejs/date` keeps the schema, the Markdown tag, `update.insert` and the two codec functions. The label moves into the copied `date` and `date-static` items. The audit also asked whether `insert` should keep converting v1's `toDateString` text. It should not. A string passed to `insert` is a stored day or authored text, and the Pursue clears that cut as a `look` default ([architecture.md, Hard cut](../../.agents/playbooks/references/architecture.md#hard-cut)). v1 text converts instead where documents come in, in the v54 migration, which today copies it unchanged, and in the Markdown reader. The audit's job is a value that survives Markdown, so the Markdown writer gives authored text a literal `text` attribute, which the reader keeps as written. Three architect runners and a cross-judge picked the shape, the plan panel reviewed it, and the Build playbook executes it. The live chip first drew relative words after hydration, which cost one extra render per chip and missed step 5's frozen budget. A second architect round dropped the words for the full date. The Pursue's call site keeps them, so the chip keeps them too, computed during render as today, and the cut waits on decide chip t_6942b9cb.

## Brief

### What will change?

Each copied date component makes its own label, so the editor chip still says Today and exports print a fixed date like March 23, 2026. Old v1 dates turn into real days, and Markdown keeps typed text as typed.

### What could go wrong?

Apps that call the two removed helpers stop compiling. Nobody has proven yet that the chip is as fast as before, because every timing ran on a busy machine. A rerun on a quiet machine is queued.

## Teach

A date in Plate is a small chip inside a line of text. It stores one string: a calendar day like 2026-03-23, or words the author typed, like sometime next week.

Today the package also builds the chip's label. It prints Today, Yesterday or Tomorrow in English, or a long date in the machine's language. Both copied date components call it, so a Word or HTML export made today says Today forever. Old v1 dates stay plain text after migration, while the insert command quietly converts that same old shape.

After this change the package only reads and writes the stored day. Each copied component owns its label. The editor chip keeps relative words, as today, and the static one always prints the full date. Old v1 dates convert where documents come in, never in insert. Markdown writes typed text as a text attribute, so it reads back exactly as typed.

## Public API

The copied live chip builds its own label and computes relative words during render, as the package label did.

```tsx before
// apps/www/src/registry/components/editor/date.tsx
import {
  formatDateValue,
  getDateDisplayLabel,
  parseCanonicalDateValue,
} from 'platejs/date';

{getDateDisplayLabel(element.value)}
```

```tsx after
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
```

`Date.parse` reads a `YYYY-MM-DD` string as UTC midnight, so formatting it in UTC prints the stored day in every zone, even after the host zone changes. Server HTML reads the server's clock, as the package label did, so a reader whose day differs sees React redraw that chip on load. The copied static item always prints the full date, so an export never says Today.

```tsx before
// apps/www/src/registry/components/editor/date-static.tsx
import { BaseDatePlugin, getDateDisplayLabel } from 'platejs/date';

{getDateDisplayLabel(element.value)}
```

```tsx after
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

Insert stores a string as typed, trimmed, and only formats a `Date`.

```ts before
// packages/platejs/src/features/date/lib/BaseDatePlugin.spec.tsx
editor.update.date.insert({ value: 'Mon Mar 23 2026' }); // stores '2026-03-23'
```

```ts after
// packages/platejs/src/features/date/lib/BaseDatePlugin.spec.tsx
editor.update.date.insert({ value: 'Mon Mar 23 2026' }); // stores 'Mon Mar 23 2026'
```

`normalizeDateValue` leaves the package. `insert` and the Markdown reader keep their own input rules.

```ts before
// packages/platejs/src/features/date/lib/dateValue.spec.ts
expect(normalizeDateValue('Mon Mar 23 2026')).toBe('2026-03-23');
```

```ts after
```

## What other editors do

Read at Lexical `dd5c41b131`, Tiptap `91c51be53c`, ProseMirror `c7f2f1d7bd`, Slate `945a484df2` and CKEditor 5 `14e73cc31b` from source, and BlockNote and Notion from their docs, nothing run. Only Lexical's playground and Notion ship an inline date, and both build the label in app code, which is where this plan puts Plate's.

| Delta | Editor | Inline date | Stored value | Who builds the label | Static or export text |
| --- | --- | --- | --- | --- | --- |
| added | Plate | Package `date` inline void | One `value`: a `YYYY-MM-DD` day or authored text | Each copied item: relative words in the live chip, computed during render, and the full date in the static item | The full date in the copied locale, fixed at export |
| added | Lexical | Playground `DateTimeNode` only | An ISO `dateTime` instant | Playground component, `toDateString()` plus a time | `toDateString()` text in a `data-lexical-datetime` span |
| added | Tiptap | None; the generic mention only | None | None | None |
| added | ProseMirror | None in the meta-repository | None | None | None |
| added | Slate | None; the mentions example is app code | None | None | None |
| added | CKEditor 5 | None; a tutorial inserts a timestamp as text | Plain text | Formatted once at insertion | The inserted text |
| added | BlockNote | None by default; custom inline content | App-defined | App-defined `render` | App-defined `toExternalHTML` |
| added | Notion | Built-in date mention | API shape `date: { start: '2022-12-16' }` | The app, with today, tomorrow and yesterday | API `plain_text` is the ISO day |

## Document shape

The v54 migration writes this node for a v1 node `{ "type": "date", "date": "Mon Mar 23 2026" }`, which v1 stored through `toDateString()` until 2026-04-18. The copied calendar and label read it, and only the after shape selects a day.

```json before
{ "children": [{ "text": "" }], "type": "date", "value": "Mon Mar 23 2026" }
```

```json after
{ "children": [{ "text": "" }], "type": "date", "value": "2026-03-23" }
```

`update.insert({ value: 'Mon Mar 23 2026' })` writes this node, which the label prints as typed.

```json before
{ "children": [{ "text": "" }], "type": "date", "value": "2026-03-23" }
```

```json after
{ "children": [{ "text": "" }], "type": "date", "value": "Mon Mar 23 2026" }
```

The Markdown writer gives that stored text, like any other authored text, a `text` attribute, which the reader keeps as written. Today it writes child text, which reads back as `2026-03-23` (`probe-roundtrip-a1.log`), and Markdown also changes child text at a blank line or an emoji shortcode. A day keeps its `value` attribute.

```md before
Date: <date>Mon Mar 23 2026</date>
```

```md after
Date: <date text="Mon Mar 23 2026" />
```

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| Value codec, two exports | Plate | `platejs/date` | `formatDateValue` writes a picked day, `parseCanonicalDateValue` tells a day from authored text; both have copied-item consumers |
| v1 day reader | Plate | `platejs/date`, internal file | The Markdown reader and the v54 migration share it; `brl` leaves `.internal` files out of the barrel |
| Markdown `text` attribute | Plate | `platejs/date`, `BaseDatePlugin`'s Markdown mapping | The plugin owns its tag; Markdown changes child text, so only an attribute keeps authored text exact |
| v54 conversion of a v1 `date` | Plate | `platejs/migrations` | The migration owns historical fields; `entrypoint-dag.mjs:364-385` lets `migrations` depend on `date` |
| Live label with relative words | Plate copied UI | registry `date` | Copied UI owns visible copy and its clock ([plate.md:106-113](../vision/plate.md)) |
| Static label | Plate copied UI | registry `date-static` | Sibling items duplicate label helpers instead of sharing a third file ([plate.md:1171-1186](../vision/plate.md)) |
| Demo values | Plate copied UI | registry examples | The block route prerenders at build time, so a day read at module load differs from the browser's |

## Hard cuts and app migration

The cut deletes `getDateDisplayLabel` and `normalizeDateValue` from `platejs/date`, and `insert`'s conversion of the `toDateString()` shape. The Pursue verdict this plan continues clears all three as `look` Defaults rows, as the Hard cut section of [architecture.md](../../.agents/playbooks/references/architecture.md#hard-cut) says. [plate.md:1137](../vision/plate.md) backs the helper cut, because a feature prefers its scoped API over helper exports. Both helpers shipped in v1's `@platejs/date` (`origin/main:packages/date/src/lib/utils/dateValue.ts`), so the v54 changeset names them. No stored document changes, because the migration only reads v1 input. The census below is `node tooling/scripts/teaching-sweep.mjs getDateDisplayLabel normalizeDateValue` at `a28e4eecbe`, plus a `git grep` of every `platejs/date` importer. The other importers, `insert-toolbar-button.tsx`, `slash.tsx` and the Markdown test editor, call `insert({})` or install the plugin, so they keep today's behavior.

| Caller | Breaks on | Change |
| --- | --- | --- |
| `packages/platejs/src/features/date/lib/dateValue.ts` | defines both helpers | delete them, the legacy regex and `isSameCalendarDay` |
| `packages/platejs/src/features/date/lib/BaseDatePlugin.ts:10,26,77` | imports `normalizeDateValue` | the Markdown reader trims and calls the internal v1 reader; `insert` formats a `Date` and trims a string |
| `packages/platejs/src/features/date/lib/dateValue.spec.ts:3-4,24-40` | label and normalize cases | delete them; the codec cases stay |
| `packages/platejs/src/features/date/lib/BaseDatePlugin.spec.tsx:207-296` | legacy insert cases expect `2026-03-23` | expect the typed text |
| `packages/platejs/src/migrations/migratePlateV54Ast.spec.ts` | no conversion case | add the v1 conversion cases of step 3 |
| Copied `date.tsx:5,68` and `date-static.tsx:1,13` | `getDateDisplayLabel` | each copies its own label |
| Copied `date.slow.tsx:11-30,104`, now `date.spec.tsx`, and `date-static.spec.tsx:7-24` | mocks of `platejs/date` with a fake label | drop the date mock and assert real labels |
| `apps/www/src/registry/examples/values/date-value.tsx:8` and its `cn` twin | a chip computed from the clock at module load | the fixed day `2025-05-08` |
| `content/docs/(plugins)/(elements)/date.mdx:155-166,203,206` and `date.cn.mdx` | both helpers, wrong package names, the "HTML parser" claim, the Chinese `input.date` | rewrite through `plate-docs` |
| `apps/www/api-reference.config.json:931-932` and `apps/www/src/generated/api-reference-manifest.json` | both names | drop them and regenerate |
| `apps/www/public/r/date.json`, `date-static.json`, `date-docs.json`, `registry.json`, `registry-docs.json` and `apps/www/src/__registry__/*`, `overlays/manifest.json` included | generated copies | regenerate |
| `.changeset/date-v54-runtime.md` | no word on either helper or the insert change | add the removal and its migration |
| `docs/editor-behavior/markdown-editing-spec.md` Date section and `docs/editor-behavior/current-evidence.md:146,190` | `node.date` payload wording; the open payload drift item | rewrite the payload law and close the item |
| `docs/plans/topics/date.md` | the current state | fold at the close |

The live chip keeps Today, Yesterday and Tomorrow. The second architect round dropped them for the full date, but the Pursue's call site keeps them, so that cut is not cleared. It waits on decide chip t_6942b9cb, and the run keeps the words as a `look` Defaults row, as the Hard cut section says.

The v1 `templates/plate-playground-template` copy is never edited here. `docs/plans/2026-10-04-ledger-triage-audit.md` and the review record keep the old names as history.

An app's copied items change as the Public API pairs show. An app that called `normalizeDateValue` before an insert passes its input to `update.insert`, which skips an invalid `Date` or a blank string and inserts today when the input is missing, or writes the stored value directly.

```ts
// before
const value = normalizeDateValue(input);
```

```ts
// after
const value =
  input instanceof Date
    ? Number.isNaN(input.getTime())
      ? undefined
      : formatDateValue(input)
    : input?.trim() || undefined;
```

## Main changes

- The v54 migration converts a v1 `date` that v1 wrote through `toDateString()` into a `YYYY-MM-DD` day. A v1 `rawDate` and any other text stay as written, and the `rawDate` and `date` collision check still compares the raw strings. An existing `value` equal to the raw `date` or to its converted day passes the value check, and the node stores the converted day.
- One internal reader recognizes the v1 shape with a weekday and month table, never the engine's `Date` parser. It checks the day and weekday through `Date.UTC`, so the host zone never changes its answer. Today `'Fri Feb 30 2026'` converts to `2026-03-02` and `'Mon Mar 23 0999'` to the malformed `999-03-23` (`probe-overflow-a1.log`). After, the first stays text because February has no 30th, and the second because 23 March 999 was not a Monday; `'Sat Mar 23 0999'` converts to `0999-03-23`.
- The Markdown reader runs that reader on both tag forms, because v1 wrote a `toDateString()` date as child text before 2026-04-18 and as a `value` attribute after. The writer gives all authored text a `text` attribute, because Markdown changes child text, such as at a blank line or an emoji shortcode, and the reader keeps a `text` attribute as written. A day keeps its `value` attribute, and the reader still accepts child text. The shared tag attribute codec writes a NUL character as `&#0;` and reads it back, so a `text` attribute also carries a NUL character.
- Both labels format the stored day in UTC from `Date.parse(value)`, so the printed day never depends on the host zone.
- The live chip computes relative words during render, as the package label did. Drawing them after hydration cost one extra render per chip and missed step 5's frozen budget (`paired-product-hydrate-a2.log`).
- The demo values hold fixed days. `/blocks/date-demo` prerenders at build time, so a day read at module load would differ between server HTML and the browser.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Package label helper | Removed; each copied item builds its own label (look) | Keep the package label | keep label | big |
| Editor chip words | Today, Yesterday and Tomorrow computed during render, as today, so server HTML reads the server's clock (look) | The full date everywhere, which decide chip t_6942b9cb settles | full date | big |
| Package normalize helper | Removed; insert and the Markdown reader keep their own rules (look) | Keep it as a public helper for current input | keep normalize | small |
| Static and export label | The full date in US English, such as March 23, 2026, formatted in UTC from the stored day | The stored day as written | stored day | small |
| Label language | US English, written into each copied file | The viewer's browser language | browser language | small |
| Old v1 dates in insert | Kept as typed text (look) | Converted to a day, as today | convert insert | small |
| Old v1 dates in migration | Converted to a day, while typed v1 text stays as written (look) | Copied as written, as today | copy as written | small |
| Old v1 dates in Markdown | Converted from either tag form, as today (look) | Converted only from child text | child only | small |
| Authored text in Markdown | Written as a text attribute and read back as written (look) | Child text, as today, which Markdown can change | child text | small |
| Days a time zone skipped | Printed as stored text in that zone; the first browser render differs from server HTML, so React re-renders that chip, and a day next to the skipped one can print the full date instead of a relative word. Deferred until a report of a chip on such a day (owner zbeyens) | A day parser that returns plain calendar fields | calendar fields | detail |
| Demo days | Two fixed days; a reader sees Today on a date inserted from the toolbar (look) | Today's day read at module load, as today | live demo day | detail |
| Hydration proof | A unit test of server and hydrated text under one clock, plus the hand drive | Add a browser spec too | browser spec | detail |
| Next step | Build now, as a Pursue continues | Stop at the plan | hold | detail |

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Label | `getDateDisplayLabel` in `platejs/date`, English words and the host locale | A private label helper in each copied item | registry `date`, `date-static` | Package defaults stay neutral; siblings duplicate label helpers | Copied items, specs, docs, changeset, registry changelog | Steps 4 and 5 | An app calling the helper fails to compile | cut |
| Live relative words | Computed on the server and the client alike | Computed during render in the copied item, as today; the cut to the full date waits on decide chip t_6942b9cb | registry `date` | Drawing words after hydration missed step 5's budget, and the Pursue's call site keeps the words | `date.tsx`, `date.spec.tsx` | Step 5 label and hydration cases; the step 5 probe on the final label | Server HTML reads the server's clock, so a reader whose day differs sees React redraw that chip, as today | keep, gated on the step 5 probe |
| Static label | Relative words and the host locale | The full date, `en-US`, formatted in UTC from the stored day | registry `date-static` | Exports must not go stale or vary by machine | `date-static.tsx`, its spec | Step 4 zone cases | A day the host zone skipped prints as stored | rearchitect |
| Normalize helper | Public `normalizeDateValue` with legacy recognition | Deleted | `BaseDatePlugin.ts` | No consumer outside the plugin; one way per job | Docs, API reference, changeset | Step 2 grep and cases | An app calling it fails to compile | cut |
| Insert input | Converts `toDateString()` text | Formats a `Date`, trims a string | `BaseDatePlugin.ts` | A string passed to `insert` is a stored day or authored text, and the Pursue clears the cut ([architecture.md, Hard cut](../../.agents/playbooks/references/architecture.md#hard-cut)) | Docs, changeset | Step 2 | Code that relied on the conversion stores text | cut |
| v1 day reader | `new Date(text)` inside `normalizeDateValue` | Internal month and weekday table, checked in UTC | `legacyDateValue.internal.ts` | Engine parsing overflows impossible days, and a local check skips days a zone skipped | Markdown reader, migration | Steps 1 and 3 | A v1 date outside four-digit years stays text | rearchitect |
| v54 date field | Copied verbatim | `toDateString()` text becomes a day | `migratePlateV54Ast.internal.ts` | v1 wrote that shape until 2026-04-18 | Changeset | Step 3 | none for current documents | rearchitect |
| Markdown writer | Day as attribute, text as child text | Authored text gets a `text` attribute; a day keeps its `value` attribute | `BaseDatePlugin.ts` | The audit's job is a value that survives Markdown; today v1-shaped text reads back as a day (`probe-roundtrip-a1.log`), and Markdown changes child text at a blank line or an emoji shortcode | Docs, spec | Step 1 round-trip cases | Authored text now writes as an attribute instead of child text | rearchitect |
| Demo days | A day read at module load | Two fixed days | registry examples | The block route prerenders at build time, so server and browser would hold different days | `date-value.tsx` and its `cn` twin | Step 5 grep, step 11 | The demo shows no Today until a reader inserts a date | rearchitect |

## Steps

The chips task t_b25e023d authorizes the build, because the date audit's Pursue continues into this plan and its build under Autopilot. One code delegate builds steps 1 to 5 in its own worktree from the plan's commit. The lead reviews its diff, reruns the step 5 probe, then builds steps 6 to 11. The plan lands as one commit through `land.mjs`, so a phase exit is a build checkpoint, not a landing. Each phase ends with a keep or fix-forward call on its own proof. Each new case names its base failure or the planted defect that shows it can fail. Base runs go through `node tooling/scripts/proof-worktree.mjs --expect-fail` at `a28e4eecbe`. The lead typechecks spec files with `pnpm exec tsc -p packages/platejs/tsconfig.test.json --noEmit` and compares that run with the same run at base. Each copied spec runs in its own `bun test` process, because two files that mock one module cannot share a process.

### Phase 1: package reader, insert and migration

Exit: keep when steps 1 to 3 pass.

- [x] 1. Add `lib/legacyDateValue.internal.ts` with `parseLegacyDateValue(text: string): string | undefined`. It matches `^(Sun|Mon|Tue|Wed|Thu|Fri|Sat) (Jan|…|Dec) (\d{2}) (\d{4})$` on the trimmed text and builds that day with `Date.UTC`. It returns the `YYYY-MM-DD` day only when the result's `getUTCFullYear`, `getUTCMonth`, `getUTCDate` and `getUTCDay` match the text. In `BaseDatePlugin`'s Markdown mapping, one local function reads a carrier's text: it trims the text and returns `parseLegacyDateValue(trimmed) ?? trimmed`. The reader keeps a string `text` attribute from `readTagAttributes().attributes` as written, treats a bare `text` attribute as absent, and decodes nothing when it is blank. Otherwise it runs that function on the `value` attribute or the first text child, and decodes nothing when the result is blank. The writer writes `<date value>` for a day and `<date text="…" />` for any other text, and its text branch calls `preserve('value')`. Proof: `pnpm --filter platejs test:partition:date`, `test:partition:markdown` and `typecheck:partition:date` pass, and the spec typecheck adds no error. `dateElement.spec.ts` keeps its four cases and adds these:
  - `<date value="Mon Mar 23 2026" />` reads as `2026-03-23`, a guard that passes at base and fails under a planted attribute-exact reader.
  - `<date>Fri Feb 30 2026</date>` and `<date>Tue Mar 23 2026</date>` stay text, which fails at base, where they read as `2026-03-02` and `2026-03-23`.
  - A stored `Mon Mar 23 2026` writes `<date text="Mon Mar 23 2026" />` and reads back as the same text, which fails at base, where it reads back as `2026-03-23` (`probe-roundtrip-a1.log`).
  - Stored `' sometime next week '` and `' 2026-03-23 '` each read back exactly. Each fails under a planted writer that marks only text the v1 reader converts.
  - `<date text="Mon Mar 23 2026" />` reads as written, which fails at base, where it decodes nothing.
  - Each round trip reports no `markdown-property-omitted` diagnostic, which fails under a planted writer without `preserve('value')`.
  - After the diff panel's first round, the writer gives all authored text a `text` attribute. Stored `one\n\ntwo`, `next\n\nweek`, `:smile:` and `next :smile:` each lost text through child text, one case each (`r1-markdown-red-a1.log` in `panel-diff-r1`). The final cases fail the same way against the build's writer (`r2-markdown-red-final-spec-a1.log` in `panel-diff-r2`).
  - After the diff panel's second round, the shared tag attribute codec writes a NUL character as `&#0;` and reads it back, because Markdown turns a literal NUL into U+FFFD before the tag reader runs. Stored `one\u0000two` reads back as `one\uFFFDtwo` at base and before the fix (`r2-nul-base-a1.log`, `r2-nul-head-a1.log`), and its case fails alone with only the codec change reverted (`r2-markdown-codec-reverted-a1.log`).
- [x] 2. In `BaseDatePlugin`'s `update.insert`, default `value` to `new Date()`, store `formatDateValue(value)` for a valid `Date` and nothing for an invalid one, and store `value.trim()` for a string, nothing when blank. Then delete `normalizeDateValue` and `LEGACY_DATE_REGEX` from `dateValue.ts` with their `dateValue.spec.ts` cases, and run `pnpm brl`. Proof: `test:partition:date` and `typecheck:partition:date` pass, and the spec typecheck adds no error. `git grep -w -E 'normalizeDateValue|LEGACY_DATE_REGEX' -- packages` finds nothing. The cases:
  - The legacy insert cases at `BaseDatePlugin.spec.tsx:207-296` now expect `Mon Mar 23 2026` stored as typed, which fails at base, where insert stores `2026-03-23` (`probe-legacy-a2.log`).
  - An invalid `Date` and a blank string insert nothing, and each fails under a planted insert that skips its check.
  - With no value and the clock pinned to 2026-03-23 23:30 in `America/Los_Angeles`, insert stores `2026-03-23`, which fails under a planted `toISOString()` day.
  - With the clock pinned to 2026-03-23, inserting `new Date(2026, 2, 24, 12)` stores `2026-03-24`, which fails under a planted insert that formats the clock instead of the supplied `Date`. Inserting `'2026-03-24'` stores it unchanged.
  - The placement cases keep passing.
- [x] 3. In the v54 date branch, set `legacyValue = rawDate ?? (date === undefined ? undefined : (parseLegacyDateValue(date) ?? date))`, keeping the raw-string collision check before it. An existing `value` equal to the raw `date` or to its converted day passes, and the node stores the converted day. Proof: `pnpm --filter platejs test:partition:migrations` and `typecheck:partition:migrations` pass, and `pnpm check entrypoint-graph` passes with the new import. `migratePlateV54Ast.spec.ts` adds these cases:
  - A v1 `date: 'Mon Mar 23 2026'` migrates to `value: '2026-03-23'`, which fails at base (`probe-legacy-a2.log`).
  - A v1 `rawDate: 'Mon Mar 23 2026'` stays as written, and fails under a planted conversion of `rawDate`.
  - A v1 `date: 'Fri Feb 30 2026'` stays as written, and fails under a planted `new Date(text)` reader.
  - A v1 `date: '2026-03-24'` keeps its day, and fails under a planted branch without the `?? date` fallback.
  - A node with `value` and `date` both `'Mon Mar 23 2026'` migrates to `value: '2026-03-23'`. It fails under today's value check, which throws on the converted day.
  - Under `TZ=Pacific/Apia`, a v1 `date: 'Fri Dec 30 2011'` migrates to `value: '2011-12-30'`, which fails under a planted reader that checks the day with `parseCanonicalDateValue` (`probe-bun-tz-a1.log`).

### Phase 2: copied UI

Exit: keep when steps 4 and 5 pass. These files read phase 1's exports, so a failure here is fixed forward, never reverted alone.

- [x] 4. In copied `date-static.tsx`, add the static `getDateLabel` from Public API. In `date-static.spec.tsx`, drop the `platejs/date` mock and use the real codec under a clock pinned to 2026-03-23 09:00 local. Proof: `bun test ./apps/www/src/registry/components/editor/date-static.spec.tsx` passes. The cases:
  - `2026-03-23` renders `March 23, 2026`, which fails at base, where it renders `Today`.
  - With the module imported once under `UTC`, the same value renders `March 23, 2026` with `process.env.TZ` set to `Pacific/Kiritimati` and then `Etc/GMT+12`. It fails under a planted label that formats `parseCanonicalDateValue`'s local noon with a host-zone formatter created at import (`probe-intl.log`, `probe-bun-tz-a1.log`).
  - `sometime next week` renders as written, and fails under a planted label without the `parseCanonicalDateValue` check.
- [x] 5. In copied `date.tsx`, add the live `getDateLabel` from Public API. In `date.spec.tsx`, drop the `platejs/date` mock, keep the React, calendar and popover mocks, and pin the clock to 2026-03-23 09:00 local. In `date-value.tsx` and its `cn` twin, replace the chip computed from the clock at module load with the fixed day `2025-05-08`. Then delete `getDateDisplayLabel` and `isSameCalendarDay` from `dateValue.ts` with their spec cases, and run `pnpm brl`. Proof: `bun test ./apps/www/src/registry/components/editor/date.spec.tsx`, `test:partition:date` and `pnpm --filter www typecheck` pass. `git grep -w -E 'getDateDisplayLabel|isSameCalendarDay' -- packages` finds nothing, and `git grep -n -E 'new Date|toISOString' -- apps/www/src/registry/examples/values/date-value.tsx apps/www/src/registry/examples/values/cn/date-value.tsx` finds nothing. The cases:
  - `2026-03-22`, `2026-03-23` and `2026-03-24` render `Yesterday`, `Today` and `Tomorrow`, and fail under a planted label without the relative-word lookup. `2026-04-01` renders `April 1, 2026`, and `sometime next week` and the impossible `2026-02-30` render as written, each its own case. Without the `parseCanonicalDateValue` check, `2026-02-30` renders March 2, 2026 and `sometime next week` throws a RangeError (`r1-date-slow-planted-noparse-a1.log` in `panel-diff-r1`).
  - Under `TZ=America/Los_Angeles` at 23:30 on March 23, `2026-03-23` and `2026-03-24` render `Today` and `Tomorrow`, which fails under a planted label that reads today as the UTC day (`r1-date-slow-planted-utcday-a1.log`).
  - `renderToString` of `2026-03-23` holds `Today`, and `hydrateRoot` over it under the same clock reports no recoverable error and shows `Today`. It fails under the label that drew words after hydration, whose server HTML holds `March 23, 2026` (`date-slow-planted-hydrated-a1.log`).
  - Under `TZ=Asia/Tokyo`, a calendar pick of March 24 writes `{ value: '2026-03-24' }` through the real `formatDateValue`, which fails under a planted `toISOString()` day.

  The lead then reruns the pre-acceptance probe on the final label in `perf-a2/`, which repairs the first probe as the plan panel's second round asked. Its contract is frozen here, before any run of its new arms and cohorts:
  - Cohorts: mount and hydrate of 10, 200 and 2,000 chips spread around today, of 2,000 chips all within a day of today, and of 2,000 chips of authored text.
  - Arms: base, the label at `a28e4eecbe`; candidate, the label copied from the final `date.tsx` and checked with `diff`; a same-code copy; full date, the candidate without the mounted read and relative words; and a planted arm that spins 30 times the candidate's own time.
  - Correctness guard: every chip's server and hydrated text equals a label the probe computes itself from the value and the pinned clock, before any timing counts. A wrong-day formatter and a label without Yesterday and Tomorrow each fail the guard with its own assertion.
  - Product line: the candidate's median is at most 1.25 times base in every cohort.
  - Mechanism line: the candidate's median is at most 1.25 times full date on mount cohorts and 2 times full date on hydrate cohorts, which allows one extra render per chip after hydration.
  - Load limit 14. Each line runs through `paired-timing.mjs`, one config per budget and reference arm.

  A conclusive miss sends the live label back to `architect`. An inconclusive line stays a gate. When the host's load keeps a line inconclusive, a suggested task reruns the probe on a quiet host, as `.agents/pstack/rules/time.md` says, and the Close names it.

  The first run of this contract judged the label that drew words after hydration. At load 10.54 it missed the product line conclusively, at 2.39 times base on hydrate-relative-2000 and 1.57 times on hydrate-authored-2000 (`paired-product-hydrate-a2.log`). A split label and a store selector missed too. `architect-a2` then ran. Its runners and judge picked a clock-free full date, and the run kept relative words computed during render instead, as the Hard cuts section says. The contract reruns on that label through `words-product.json`, `words-mechanism-mount.json` and `words-mechanism-hydrate.json`, new configs beside the frozen ones whose candidate arm `words-label.tsx` matches the final `date.tsx` label (`label-diff-a1.log`). Its product runs were inconclusive at loads 31.81 and 21.81, though the second put the candidate at 0.03 to 1.11 times base across its cohorts (`paired-words-product-a2.log`). The mechanism mount run was inconclusive on noise as well as load. Mount-10 sat at 1.212 times full date against its 1.25 line, inside same-code noise of 0.263, and mount-2000 and mount-authored-2000 also sat inside their noise (`paired-words-mechanism-mount-a1.log`). The mechanism hydrate run was inconclusive on load alone (`paired-words-mechanism-hydrate-a1.log`). Mount-10 is the line closest to a conclusive miss. The quiet-host rerun runs all three configs, and a line counts only once it clears both the load limit and its noise rule. The label function alone costs base's time on relative chips and less on the rest (`label-micro-a1.log`).

### Phase 3: docs, generated output, release and teaching

Exit: keep when steps 6 to 11 pass.

- [x] 6. Run `plate-docs` on `content/docs/(plugins)/(elements)/date.mdx`. Replace "Date normalization" with "Date values": the insert input table without the old-shape row, where old v1 dates convert, and that each copied item owns its label and locale. Fix the Picker table, the Ownership and API tables' package names to `platejs/date` and `platejs/date/react`, drop both helpers from the API table, and change line 194's "HTML parser" to the Markdown reader, which reads both tag forms and keeps a `text` attribute as written. Carry every change to `date.cn.mdx`, whose insert parameter still says `input.date`, and audit example coverage. Proof: the docs checks `plate-docs` names, and step 11's drive of both pages.
- [x] 7. Drop `getDateDisplayLabel` and `normalizeDateValue` from the `./date` exclude list in `apps/www/api-reference.config.json`. Run `pnpm plite:packages:build` in this worktree, then `pnpm --filter www api-reference`. Proof: `pnpm --filter www api-reference:check` passes, and the manifest names neither helper.
- [x] 8. Run `pnpm --filter www build:registry` after steps 4 to 7, keep its output, and add a registry changelog entry for `date` and `date-static`, as `changeset` says. Proof: `pnpm --filter www build:registry --check` passes, `git grep getDateDisplayLabel -- apps/www/public/r apps/www/src/__registry__` finds nothing, and `pnpm --filter www typecheck` passes.
- [x] 9. Amend `.changeset/date-v54-runtime.md`: `getDateDisplayLabel` and `normalizeDateValue` are removed, with the migration to copy the label and write the value directly; `insert` stores a string as typed, with the line "Pass a `Date` or `formatDateValue(date)`; a `toDateString()` string is now stored as text"; the v54 migration converts a v1 `toDateString()` date; Markdown writes all authored text as `<date text>`, so it reads back unchanged. Proof: the `changeset` skill's checks, and each removed name exists in v1's `@platejs/date`.
- [x] 10. Rewrite the Date section of `markdown-editing-spec.md` per its opening reconciliation rule: one `value` holds a `YYYY-MM-DD` day or authored text, `parseCanonicalDateValue` tells them apart, the `toDateString()` shape converts only in the v54 migration and the Markdown reader, the writer gives all authored text a `text` attribute, the live renderer computes relative words during render and the static one prints the full date. Close the payload drift item at `current-evidence.md:146` and update `:190`. Run `best-api repair`, whose owner is `docs/plans/topics/date.md`. Proof: `PLATE_BASELINE_BASE=a28e4eecbe75238a877d013930570d749a582fa0 pnpm check removed-api-teaching` passes, `node .agents/rules/plate-next/scripts/sync-resources.mjs --check` passes, and `teaching-sweep.mjs getDateDisplayLabel normalizeDateValue` finds only the v1 template and history.
- [x] 11. Hand drive the date pages as `verify`'s hand drive reference says, with the cells `node tooling/scripts/hand-drive.mjs scope` lists for the changed files, `/docs/date` and `/cn/docs/date` included. Proof: `hand-drive.mjs check` passes, the page shows no hydration error, a date inserted from the toolbar reads Today, the 2024-01-01 chip reads January 1, 2024, a calendar pick changes the chip, and both docs pages show the parsed heading, body and loaded demo.

## Completion gates

| Gate | Applies | Proof |
| --- | --- | --- |
| Package specs for `date`, `markdown` and `migrations` | yes | `r2-test-date-a1.log`, `r2-test-migrations-a1.log`, `r3-test-markdown-a2.log` |
| Spec typecheck through `tsconfig.test.json`, compared with base | yes | `close-spec-tsc-a1.log` against the base run |
| Benchmark pre-acceptance probe | yes: the live label moves owner and reads the clock per chip | partial: `paired-product-hydrate-a2.log` missed on the label drawn after hydration; every run on the final label was inconclusive on load (`paired-words-product-a3.log`), and t_6cf08868 reruns it |
| `pnpm brl` | yes, `platejs/date` exports change | Steps 2 and 5 logs |
| Blast radius before delegating | yes | the brief's census and the lead's `git grep` of each changed symbol |
| Copied UI specs, API reference and registry build | yes | `step7-api-reference-check-a1.log`, `close-build-registry-check-a1.log`, `step8-www-typecheck-a1.log` |
| `plate-docs` | yes | Step 6, `close-check-docs-a1.log` |
| Registry changelog | yes, `date` and `date-static` change | Step 8 |
| Changeset | yes, `platejs` changes | the `changeset` skill's checks, run after step 9's edits |
| `best-api repair` | yes, two public helpers leave `platejs/date` | `best-api-teaching-sweep-a1.log`, `best-api-forward-a1.log`, run after step 10's edits |
| `oxlint --type-aware` before the diff panel | yes | `r3-oxlint-a2.log`, `close-lint-task-a1.log` |
| Panel on the diff | yes, reviews row `api-build` | three `seats` rows |
| `pstack:thermos` | skip: the `api-build` row owed a panel on the diff from the first slice | none |
| Playtest | skip: `playtest.mjs scope` names no scenario catalog for these files | none |
| `check-plate-feature.mjs` | skip: not a feature-delivery plan | none |
| Hand drive | yes | `drive/hand-drive-check-a1.log`, `close-hand-drive-check-a1.log` |
| `review-ledger.mjs check` | yes, at the close | `close-review-ledger-a1.log` |
| `land.mjs --check 'pnpm check --affected'` | yes | its run at landing |

## Close

### Reversals and deviations

- The first live label drew relative words after hydration. It missed step 5's frozen product line conclusively, at 2.39 times base on hydrate-relative-2000 (`paired-product-hydrate-a2.log`), so the label went back to `architect`. Its runners and judge picked a clock-free full date. The plan kept the words computed during render instead, because the Pursue's call site keeps them, and offered the cut's question as decide chip t_6942b9cb (Defaults row "Editor chip words").
- Plan panel round 2 gave the writer a child-text branch for text that reads back exactly. Diff panel round 1 found that Markdown still changes such text at a blank line or an emoji shortcode, so the writer now gives all authored text a `text` attribute. That fix is the writer's one replacement.
- Diff panel round 2 found that the shared tag attribute codec turned a NUL character into U+FFFD. The fix changes `packages/platejs/src/markdown/lib/internal/markdownTags.ts`, a path outside the brief, logged as a started row in the suggested-tasks ledger.
- `best-api repair` and the `changeset` skill ran after steps 9 and 10 had made their edits, not before them. Both checked those edits again and found nothing to change (rows "best-api repair" and "changeset checks").
- While this run landed, upstream renamed `date.slow.tsx` to `date.spec.tsx` in `a2eebd1d65`, and `009c8c3a5b` changed the Hard cuts rule so a cut's question becomes a `decide` chip instead of a scope file. The rebase kept this run's spec under the new name, and the run deleted its `date-relative-words` scope file and offered decide chip t_6942b9cb, whose session writes the scope file. Upstream's new checks also failed the first landing. The date specs set `TZ`, so `tooling/entrypoints/entrypoint-turbo.mjs` adds it to platejs's test-task env and `packages/platejs/turbo.json` regenerates, and `tooling/oxlint/plate-baseline.json` drops the `platejs/date` mock this run deleted.
- Step 5's probe never ran on a quiet host. As the Time budget rule says, the rerun went to suggested task t_6cf08868, so step 5 closes with its measurement handed off, not proven.

### What landed

- `platejs/date` exports `BaseDatePlugin`, `formatDateValue` and `parseCanonicalDateValue`. `getDateDisplayLabel` and `normalizeDateValue` are gone from `packages/platejs/src/features/date/lib/dateValue.ts`, with their cases in `packages/platejs/src/features/date/lib/dateValue.spec.ts`.
- `update.insert` in `packages/platejs/src/features/date/lib/BaseDatePlugin.ts` stores a valid `Date` as its local day and a string trimmed, as typed. It inserts nothing for an invalid `Date` or a blank string, and today when the input is missing. `packages/platejs/src/features/date/lib/BaseDatePlugin.spec.tsx` now expects typed v1 text stored as typed.
- The copied `apps/www/src/registry/components/editor/date.tsx` prints Today, Yesterday or Tomorrow during render and the full date otherwise. The copied `apps/www/src/registry/components/editor/date-static.tsx` always prints the full date, so the HTML and Word export that `apps/www/src/registry/components/editor/plugins-static.ts` installs never says Today. Both format the stored day in UTC, and their specs, `apps/www/src/registry/components/editor/date.spec.tsx` and `apps/www/src/registry/components/editor/date-static.spec.tsx`, run on the real codec. `apps/www/src/registry/registry-features.ts` is unchanged, because the label needs no mounted hook.
- The demo values in `apps/www/src/registry/examples/values/date-value.tsx` and `apps/www/src/registry/examples/values/cn/date-value.tsx` hold fixed days.
- The v54 migration in `packages/platejs/src/migrations/migratePlateV54Ast.internal.ts` and the Markdown reader turn v1 `toDateString()` text into a day when its weekday matches, through one internal reader that `tooling/entrypoints/entrypoint-dag.mjs` already lets `migrations` import. An impossible day or a wrong weekday stays text, and `packages/platejs/src/migrations/migratePlateV54Ast.spec.ts` covers both.
- The Markdown writer writes `<date value>` for a day and `<date text>` for any other text, and the shared tag attribute codec carries a NUL character. `packages/platejs/src/markdown/lib/dateElement.spec.ts` covers each case, a day the host zone skipped included.
- `content/docs/(plugins)/(elements)/date.mdx`, `content/docs/(plugins)/(elements)/date.cn.mdx`, the Date section of `docs/editor-behavior/markdown-editing-spec.md`, the payload item in `docs/editor-behavior/current-evidence.md`, `.changeset/date-v54-runtime.md`, the registry changelog entry, and `apps/www/api-reference.config.json` with its generated manifest describe the new shape.
- The ownership follows `VISION.md`, `docs/vision/common.md` and `docs/vision/plate.md`, which this plan reads and does not change.

### Proof

- Steps 1 to 3. The date, markdown and migrations partitions pass on the final package bytes (`r2-test-date-a1.log`, `r2-test-migrations-a1.log`, `r3-test-markdown-a2.log`). Each insert and migration case fails under its planted defect (`build-a1/plant-*.log`).
- Markdown. Each new case fails at base or against the build's writer (`r2-markdown-red-final-spec-a1.log`). The NUL case fails alone with only the codec change reverted (`r2-markdown-codec-reverted-a1.log`). The skipped-day case fails when its zone is planted as UTC (`r3-apia-planted-utc-a2.log`).
- Steps 4 and 5. The live label cases fail under a label that reads today as the UTC day and under a label without the parse check (`r1-date-slow-planted-utcday-a1.log`, `r1-date-slow-planted-noparse-a1.log`). The hydration case fails under the label drawn after hydration (`date-slow-planted-hydrated-a1.log`).
- Steps 7 and 8. The API reference check, the registry build check and the www typecheck pass (`step7-api-reference-check-a1.log`, `close-build-registry-check-a1.log`, `step8-www-typecheck-a1.log`).
- Step 10. The removed-API teaching check and the resource sync check pass (`close-removed-api-teaching-a1.log`, `close-sync-resources-a1.log`). A forward test of the documented calls through the date entrypoint passes (`best-api-forward-a1.log`), and the teaching sweep finds the removed names only in this plan, the v1 template and history (`best-api-teaching-sweep-a1.log`).
- Step 11. The hand drive covers 73 cells (`drive/hand-drive-check-a1.log`, rechecked in `close-hand-drive-check-a1.log`). Insert > Date showed Today, a calendar pick changed the chip, both docs pages showed the new Markdown text, and 63 load routes answered 200 with no page error (`drive/load-cells-a1-a1.log`).
- Lane 8's predicted benefit held for the copy, the exports and v1 dates. Its cost claim, that the live chip costs what it costs today, waits on t_6cf08868.

### Proof limits

- Step 5's probe is inconclusive on load and on noise. Mount-10 sits closest to its line, at 1.212 times full date against 1.25. Suggested task t_6cf08868 reruns all three configs on a quiet host.
- The hand drive ran at desktop width in the built-in Chromium pane only.
- Paragraph text still turns a NUL character into U+FFFD, a CommonMark limit outside the date's carrier.
- Server HTML reads the server's day, so a reader whose day differs sees React redraw that chip (Failure mode 1).

### Diff panel

Three rounds ran on the diff, each with Opus, Astra and Sol at xhigh. Round 1 applied one critical finding, child text that lost authored text at a blank line or an emoji shortcode. Round 2 applied one, the tag codec turning a NUL character into U+FFFD. Round 3 found no critical finding, and its one warning fixed a false clause in the changeset. Every warning and nit was applied or dismissed with a reason, except the probe gate, which t_6cf08868 owns.

### Counts

29 items: the 11 steps and the 18 completion gates. 24 done, 1 partial (the probe, which t_6cf08868 reruns on a quiet host), 3 skipped (thermos, Playtest and check-plate-feature, each with its reason in the gates table), 0 blocked, and the `land.mjs` gate runs when this commit lands.

## Open work

- Time the live label on a quiet host. Owner: zbeyens. Stop: suggested task t_6cf08868 lands or is dropped, tracked in the suggested-tasks ledger.
- Decide whether the live chip drops its relative words. Owner: zbeyens. Stop: decide chip t_6942b9cb lands or is dropped, tracked in the suggested-tasks ledger.
- A day a time zone skipped prints as stored text (Defaults row "Days a time zone skipped"). Owner: zbeyens. Stop: a report of a chip on such a day.

## Evidence

Model: claude-opus-5-5 at xhigh effort, read from this session's metadata.

Prior work. `node tooling/scripts/review-ledger.mjs show date` names the [2026-10-04 audit](../research/review-records/2026-10-04-date-audit.json) as the head, a Pursue no plan adopted. A search of `docs/plans` for `getDateDisplayLabel`, `normalizeDateValue` and `date label` found only the [2026-10-04 ledger triage](2026-10-04-ledger-triage-audit.md), which queued this audit.

### Requirements

- One `value` holds a `YYYY-MM-DD` day or authored text, and the v54 migration preserves authored text ([date.mdx](../../content/docs/(plugins)/(elements)/date.mdx), `migratePlateV54Ast.spec.ts:141,260`).
- Package defaults stay neutral, and copied renderers own presentation ([plate.md:106-113](../vision/plate.md), [plate.md:1129-1137](../vision/plate.md)). Sibling live and static items duplicate label helpers ([plate.md:1171-1186](../vision/plate.md)).
- The static kit draws HTML and Word export ([plate.md:1194-1201](../vision/plate.md)), so a static label must not go stale.
- The audit's job is one date value that survives Markdown, migration and editing ([2026-10-04 audit](../research/review-records/2026-10-04-date-audit.json), its summary and requirements).
- Editor creation and replacement accept current documents only, and normalizers never recognize historical shapes; old data converts through the explicit migration ([plate.md:521-531](../vision/plate.md)).
- The spec's Date section names Notion as the primary UX reference and lets a bundled renderer show relative labels ([markdown-editing-spec.md](../editor-behavior/markdown-editing-spec.md)).

### Probes

Each probe logs to the run directory, and the decision log cites it.

- At base, the v54 migration copies `date: 'Mon Mar 23 2026'` into `value` unchanged, its label is that raw text, the calendar selects nothing, insert of the same text stores `2026-03-23`, and today's value labels `Today` (`probe-legacy-a2.log`).
- `Intl.DateTimeFormat('en-US', { dateStyle: 'long' })` prints local noon of 2026-03-23 as `March 23, 2026` in five zones from UTC+14 to UTC-12. Formatting the same instant in UTC prints March 22 and March 24 at the extremes (`probe-intl.log`).
- A value attribute round-trips quotes, angle brackets, a backslash and double spaces exactly (`probe-attr-a1.log`).
- Bun applies a runtime `TZ` change, and under `Pacific/Apia` local noon of 2011-12-30 falls on the 31st (`probe-bun-tz-a1.log`).
- At base, `'Fri Feb 30 2026'` converts to `2026-03-02` and `'Mon Mar 23 0999'` to `999-03-23` (`probe-overflow-a1.log`).
- At base, a stored `Mon Mar 23 2026` writes `<date>Mon Mar 23 2026</date>` and reads back as `2026-03-23` (`probe-roundtrip-a1.log`).
- The live label's pre-acceptance probe (`perf-a1/`) mounts and hydrates 10, 200 and 2,000 chips under happy-dom, with the base label against the planned one. Single smoke runs put 2,000 chips at about 133 ms to mount and 116 ms to hydrate at base, against about 31 and 32 ms planned (`smoke-base-a2.log`, `smoke-candidate-a2.log`). The known-bad run, which prints relative words on the server, fails with the probe's own assertion (`known-bad-a2.log`). The paired run measured the planned label at 0.08 to 0.49 times base, but it was inconclusive, because the host's load reached 20.21 against a limit of 14 and the planted arm, at 1.6 times the candidate, could not cross the budget (`paired-a2.log`).
- The repaired probe (`perf-a2/`) times each label in its own bun process under happy-dom and checks every chip's server and hydrated text first. The label drawn after hydration missed the product line on the two hydrate cohorts at load 10.54 (`paired-product-hydrate-a2.log`). A full date from a month table ran at most 1.04 times base and one through a UTC formatter 1.21 times on hydrate-relative-2000, both inconclusive under load (`paired-fields-product-a1.log`, `paired-utc-product-a1.log`). Timed alone, the render-time words label costs 465 ns per relative chip against base's 453, with overlapping ranges, and less on authored text and spread days (`label-micro-a1.log`).
- v1 wrote `<date>` child text until `ba095aaaf5` on 2026-04-18, then `<date value>` for any `date` without `rawDate` (`origin/main:packages/markdown/src/lib/rules/defaultRules.ts:354-362`), so a `toDateString()` date saved earlier exports as an attribute.

### Failure modes

1. When the server's day differs from the reader's, server HTML and the first client render disagree on a relative word, and React redraws from the nearest Suspense boundary, as it does today. Step 5's hydration case covers one shared clock, and decide chip t_6942b9cb asks whether to drop the words.
2. A v1 date outside four-digit years, or one whose weekday does not match, stays text after migration. v1 wrote neither through `toDateString()` for a real date.
3. An app pinned to either removed helper fails to compile. The changeset gives the migration.
4. In a zone that skipped a stored day, `parseCanonicalDateValue` rejects it, so the chip prints the stored text, and the first browser render differs from server HTML, so React re-renders that chip. A day next to the skipped one can print the full date instead of a relative word. Deferred until a report of a chip on such a day (owner zbeyens).

Rollback is reverting the one landing commit; no current document changes shape.

### Lanes

1. **Keep the current design. Loses.** npm keeps English copy and a host-clock, host-locale label, and exports freeze `Today`.
2. **Strongest deletion: canonical-only values. Loses.** The migration and docs preserve authored text, a stored-data law.
3. **A label option in the package, such as a locale or word list. Loses.** It grows package presentation config instead of moving the label, as the audit found.
4. **One shared registry label file. Loses.** [plate.md:1180-1183](../vision/plate.md) forbids a third file that only shares labels, and it couples two independent items.
5. **Absolute labels everywhere, with a calendar-field parser (Astra and Sol). Loses.** It removes the shipped relative words the spec allows and the audit's call site keeps, breaks the parser's type, and adds a picker adapter to every live copy, to fix days a zone skipped.
6. **Copied labels with relative words after hydration. Loses.** One extra render per chip missed step 5's frozen product line (`paired-product-hydrate-a2.log`).
7. **A clock-free full date in the live chip (architect-a2, all three runners). Loses for now.** It meets the budget and keeps server HTML equal to the browser, but drops words the Pursue kept, so it waits on decide chip t_6942b9cb.
8. **Copied labels, relative words computed during render, conversion at persistence boundaries. Wins.** Predicted benefit: no copy or clock in npm, exports print a fixed date, the live chip costs what it costs today, and v1 dates become selectable days. The Close marks it held or falsified.

Architect. Three runners, Opus, Astra and Sol, designed the target from one grounding, and an Opus cross-judge scored them blind. It scored Opus's copied labels with relative words after hydration 20, Astra's calendar fields with absolute labels 19 and Sol's public legacy decoder 15. The plan takes Opus's base. It drops the judge's required graft, an attribute-only Markdown writer, because blast radius showed v1 wrote old dates as attributes too, so an exact attribute read would turn them into text. It rejects the calendar-field graft and names the skipped-day limit instead. It takes Astra's month-table reader and Opus's spec-section row. The plan panel's first round changed three picks. Both labels now format the stored day in UTC from `Date.parse(value)`, because a module-level formatter keeps the zone it was created in. The writer now marks text the v1 reader would convert with a `text` attribute, because the audit's job is a value that survives Markdown. The second round widened that marker to any text child text would not read back exactly, replaced the demo's clock with fixed days, and rebuilt the performance probe around a full-date arm and per-chip labels. That probe failed the label drawn after hydration, so `architect-a2` ran three runners on the live label alone. All three dropped the relative words. An Opus cross-judge scored Opus's month-table full date 18, Astra's UTC formatter with a year floor 17 and Sol's UTC formatter 15. The plan keeps the words instead, computed during render, because the Pursue's call site keeps them. It takes the judge's grafts that still apply: new probe files beside the frozen ones, and the impossible-day case.

### Dependents

- `migrations`: [migratePlateV54Ast.internal.ts](../../packages/platejs/src/migrations/migratePlateV54Ast.internal.ts) imports the new internal reader. Affected.
- `markdown`: the date tag's reader lives in `BaseDatePlugin`, and `dateElement.spec.ts` covers it. Affected.
- `ui`: [plugins-static.ts](../../apps/www/src/registry/components/editor/plugins-static.ts) installs `BaseDateKit`, which the HTML and Word export paths draw through. Unaffected, because the kit keeps its name.
- `react`: `DatePlugin` wraps `BaseDatePlugin` and adds nothing. Unaffected.

### History

- The [2026-10-04 audit](../research/review-records/2026-10-04-date-audit.json) is the governing verdict. This plan cuts `normalizeDateValue`, which it listed as kept, because its only remaining job was the legacy conversion it asked this plan to check.
- The [2026-07-10 package review](2026-07-10-plate-next-csv-cursor-date-package-reviews.md) kept display labels in the package under earlier doctrine.

### Upstream checkouts

Read from source only: Lexical `dd5c41b131`, Tiptap `91c51be53c`, ProseMirror `c7f2f1d7bd`, Slate `945a484df2` and CKEditor 5 `14e73cc31b`. BlockNote and Notion were read from their public docs.
