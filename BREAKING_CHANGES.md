# Breaking Changes

## 4.0.0

### `@udecode/plate-toolbar`

- `BalloonToolbar`: removed `hiddenDelay` prop.

## 3.0.0

### All UI packages

There was multiple instances of `styled-components` across all the packages.
So we moved `styled-components` from dependencies to peer dependencies.

#### Before

`styled-components` was not listed in your dependencies

#### After

Add `styled-components` to your dependencies

## 2.0.0

### `@udecode/plate-autoformat`

- `autoformatBlock`:
  - signatude changed 

```ts
// Before 
(
  editor: TEditor,
  type: string,
  at: Location,
  options: Pick<AutoformatRule, 'preFormat' | 'format'>
)
```

```ts
// After
(editor: TEditor, options: AutoformatBlockOptions)
```

  - moved the checks from `withAutoformat`
- `autoformatInline`:
  - renamed to `autoformatMark`
  - signatured changed

```ts
// Before
(
  editor: TEditor,
  options: Pick<AutoformatRule, 'type' | 'between' | 'markup' | 'ignoreTrim'>
)  
```

```ts
// After
(
  editor: TEditor,
  options: AutoformatMarkOptions
) 
```

- `AutoformatRule` is now `AutoformatBlockRule
  | AutoformatMarkRule
  | AutoformatTextRule;`
  - `mode: 'inline'` renamed to `mode: 'mark'`
  - `markup` and `between` have been replaced by `match: string | string[] | MatchRange | MatchRange[]`: The rule applies when the trigger and the text just before the cursor matches. For `mode: 'block'`: lookup for the end match(es) before the cursor. For `mode: 'text'`: lookup for the end match(es) before the cursor. If `format` is an array, also lookup for the start match(es). For `mode: 'mark'`: lookup for the start and end matches. Note: `'_*'`, `['_*']` and `{ start: '_*', end: '*_' }` are equivalent. 
  - `trigger` now defaults to the last character of `match` or `match.end` (previously `' '`)
- the plugin now checks that there is no character before the start match to apply autoformatting. For example, nothing will happen by typing `a*text*`.