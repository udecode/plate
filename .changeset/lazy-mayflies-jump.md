---
"@udecode/plate-autoformat": major
---

breaking changes:
- `autoformatBlock`:
  - signatude changed from `(editor: TEditor,
  type: string,
  at: Location,
  options: Pick<AutoformatRule, 'preFormat' | 'format'>)` to `(editor: TEditor, options: AutoformatBlockOptions)`
  - moved the checks from `withAutoformat`
- `autoformatInline`:
  - renamed to `autoformatMark`
  - signatured changed from `(editor: TEditor, options: Pick<AutoformatRule, 'type' | 'between' | 'markup' | 'ignoreTrim'>)` to `AutoformatMarkOptions`
- `AutoformatRule` is now `AutoformatBlockRule
  | AutoformatMarkRule
  | AutoformatTextRule;`
  - `mode: 'inline'` renamed to `mode: 'mark'`
  - `markup` and `between` have been replaced by `match: string | string[] | MatchRange | MatchRange[]`: The rule applies when the trigger and the text just before the cursor matches. For `mode: 'block'`: lookup for the end match(es) before the cursor. For `mode: 'text'`: lookup for the end match(es) before the cursor. If `format` is an array, also lookup for the start match(es). For `mode: 'mark'`: lookup for the start and end matches. Note: `'_*'`, `['_*']` and `{ start: '_*', end: '*_' }` are equivalent. 
  - `trigger` now defaults to the last character of `match` or `match.end` (previously `' '`)
- the plugin now checks that there is no character before the start match to apply autoformatting. For example, nothing will happen by typing `a*text*`.
