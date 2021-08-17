---
"@udecode/plate-autoformat": minor
---

features:
- new rules:
  - `autoformatArrow`, `autoformatLegal`, `autoformatLegalHtml`, `autoformatPunctuation`, `autoformatComparison`, `autoformatEquality`, `autoformatFraction`, `autoformatMath`, `autoformatDivision`, `autoformatOperation`, `autoformatSubscriptNumbers`, `autoformatSubscriptSymbols`, `autoformatSuperscriptNumbers`, `autoformatSuperscriptSymbols`
- types:
  - `AutoformatMarkOptions`: options for `autoformatMark`
  - `AutoformatTextOptions`: options for `autoformatText`
  - `AutoformatBlockOptions`: options for `autoformatBlock`
  - `AutoformatCommonRule`: rule fields for all modes
  - `MatchRange`
  - `GetMatchPointsReturnType`
- `mode: 'block'`, `autoformatBlock`: 
- `mode: 'mark'`: `type` now accepts `string[]` to add multiple marks
- new `mode: 'text'` that can be used to replace `match` by any text using the `format` option
  - `match: string | string[]`
  - `format: string
    | string[]
    | ((editor: TEditor, options: GetMatchPointsReturnType) => void)` – `string`: the matched text is replaced by that string – `string[]`: the matched texts are replaced by these strings (e.g. smart quotes) – `function`: called when there is a match.
- `getMatchPoints`: used by `autoformatMark` and `autoformatText` to get the matching points
- `getMatchRange`: maps `match` and `trigger` option to start to match, end to match and triggers.
- `isPreviousCharacterEmpty`
