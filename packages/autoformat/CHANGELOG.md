# @platejs/autoformat

## 53.0.0

### Major Changes

- [#4941](https://github.com/udecode/plate/pull/4941) by [@zbeyens](https://github.com/zbeyens) – Deprecate `@platejs/autoformat`. Markdown shortcuts and text substitutions are now authored as `inputRules` on each feature plugin, and `AutoformatPlugin` remains only as an inert compatibility export.

  **Migration:**

  1. Remove `AutoformatPlugin` from your plugins and replace `@platejs/autoformat` after migrating rules.
  2. Replace each old `AutoformatRule` with the matching rule factory on the plugin that owns the feature. See the table below.
  3. Replace symbol substitutions (arrows, fractions, smart quotes, legal, math operators) with `createTextSubstitutionInputRule` registered on a local `createSlatePlugin`.
  4. Replace `rules[].query` with `enabled` on the rule factory call. Replace the global code-block guard with a per-plugin `enabled` check.
  5. Drop `enableUndoOnDelete` — undo-on-delete is the built-in behavior.
  6. Replace custom `AutoformatRule` definitions with `createRuleFactory` from `platejs`.

  ```tsx
  // Before
  import { AutoformatPlugin } from "@platejs/autoformat";

  const editor = createPlateEditor({
    plugins: [
      AutoformatPlugin.configure({
        options: {
          enableUndoOnDelete: true,
          rules: [
            { match: "# ", mode: "block", type: KEYS.h1 },
            { match: "**", mode: "mark", type: KEYS.bold },
            {
              match: "* ",
              mode: "block",
              type: "list",
              format: (editor) =>
                toggleList(editor, { listStyleType: KEYS.ul }),
            },
          ],
        },
      }),
    ],
  });

  // After
  import { BoldRules } from "@platejs/basic-nodes";
  import { BoldPlugin } from "@platejs/basic-nodes/react";
  import { HeadingRules } from "@platejs/basic-nodes";
  import { H1Plugin } from "@platejs/basic-nodes/react";
  import { BulletedListRules } from "@platejs/list";
  import { ListPlugin } from "@platejs/list/react";

  const editor = createPlateEditor({
    plugins: [
      H1Plugin.configure({ inputRules: [HeadingRules.markdown()] }),
      BoldPlugin.configure({
        inputRules: [BoldRules.markdown({ variant: "*" })],
      }),
      ListPlugin.configure({
        inputRules: [BulletedListRules.markdown({ variant: "-" })],
      }),
    ],
  });
  ```

  ### Rule Map

  #### Basic blocks — `@platejs/basic-nodes`

  | Old rule                                                         | New rule                                                                                                                                           |
  | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `{ match: '# '..'###### ', mode: 'block', type: KEYS.h1..h6 }`   | `HxPlugin.configure({ inputRules: [HeadingRules.markdown()] })` — register on each `H1Plugin`..`H6Plugin`                                          |
  | `{ match: '> ', mode: 'block', type: KEYS.blockquote }`          | `BlockquotePlugin.configure({ inputRules: [BlockquoteRules.markdown()] })`                                                                         |
  | `{ match: ['---', '—-', '___ '], mode: 'block', type: KEYS.hr }` | `HorizontalRulePlugin.configure({ inputRules: [HorizontalRuleRules.markdown({ variant: '-' }), HorizontalRuleRules.markdown({ variant: '_' })] })` |

  #### Basic marks — `@platejs/basic-nodes`

  | Old rule                                                             | New rule                                                      | Owning plugin         |
  | -------------------------------------------------------------------- | ------------------------------------------------------------- | --------------------- |
  | `{ match: '**', mode: 'mark', type: KEYS.bold }`                     | `BoldRules.markdown({ variant: '*' })`                        | `BoldPlugin`          |
  | `{ match: '__', mode: 'mark', type: KEYS.underline }`                | `UnderlineRules.markdown()`                                   | `UnderlinePlugin`     |
  | `{ match: '*', mode: 'mark', type: KEYS.italic }`                    | `ItalicRules.markdown({ variant: '*' })`                      | `ItalicPlugin`        |
  | `{ match: '_', mode: 'mark', type: KEYS.italic }`                    | `ItalicRules.markdown({ variant: '_' })`                      | `ItalicPlugin`        |
  | `` { match: '`', mode: 'mark', type: KEYS.code } ``                  | `CodeRules.markdown()`                                        | `CodePlugin`          |
  | `{ match: '~~', mode: 'mark', type: KEYS.strikethrough }`            | `StrikethroughRules.markdown()`                               | `StrikethroughPlugin` |
  | `{ match: '~', mode: 'mark', type: KEYS.sub }`                       | `SubscriptRules.markdown()`                                   | `SubscriptPlugin`     |
  | `{ match: '^', mode: 'mark', type: KEYS.sup }`                       | `SuperscriptRules.markdown()`                                 | `SuperscriptPlugin`   |
  | `{ match: '==', mode: 'mark', type: KEYS.highlight }`                | `HighlightRules.markdown({ variant: '==' })`                  | `HighlightPlugin`     |
  | `{ match: '≡', mode: 'mark', type: KEYS.highlight }`                 | `HighlightRules.markdown({ variant: '≡' })`                   | `HighlightPlugin`     |
  | `{ match: '***', mode: 'mark', type: [bold, italic] }`               | `MarkComboRules.markdown({ variant: 'boldItalic' })`          | `BoldPlugin`          |
  | `{ match: '__*', mode: 'mark', type: [underline, italic] }`          | `MarkComboRules.markdown({ variant: 'italicUnderline' })`     | `BoldPlugin`          |
  | `{ match: '__**', mode: 'mark', type: [underline, bold] }`           | `MarkComboRules.markdown({ variant: 'boldUnderline' })`       | `BoldPlugin`          |
  | `{ match: '___***', mode: 'mark', type: [underline, bold, italic] }` | `MarkComboRules.markdown({ variant: 'boldItalicUnderline' })` | `BoldPlugin`          |

  Register each family on its owning plugin:

  ```tsx
  BoldPlugin.configure({
    inputRules: [
      BoldRules.markdown({ variant: "*" }),
      BoldRules.markdown({ variant: "_" }),
      MarkComboRules.markdown({ variant: "boldItalic" }),
      MarkComboRules.markdown({ variant: "boldUnderline" }),
      MarkComboRules.markdown({ variant: "boldItalicUnderline" }),
      MarkComboRules.markdown({ variant: "italicUnderline" }),
    ],
  });
  ```

  #### Code block — `@platejs/code-block`

  | Old rule                                                                                | New rule                                                                                |
  | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
  | ` { match: '```', mode: 'block', type: KEYS.codeBlock, format: insertEmptyCodeBlock } ` | `CodeBlockPlugin.configure({ inputRules: [CodeBlockRules.markdown({ on: 'match' })] })` |

  #### Lists — `@platejs/list` and `@platejs/list-classic`

  | Old rule                                                                                                   | New rule                                                                                       |
  | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
  | `{ match: ['- ', '* '], mode: 'block', format: toggleList(..., { listStyleType: KEYS.ul }) }`              | `BulletedListRules.markdown({ variant: '-' })`, `BulletedListRules.markdown({ variant: '*' })` |
  | `{ match: /^\d+\.$ \|^\d+\)$ /, matchByRegex: true, format: toggleList(..., { listStyleType: KEYS.ol }) }` | `OrderedListRules.markdown({ variant: '.' })`, `OrderedListRules.markdown({ variant: ')' })`   |
  | `{ match: '[] ', mode: 'block', format: toggleList(..., { listStyleType: KEYS.listTodo }) }`               | `TaskListRules.markdown({ checked: false })`                                                   |
  | `{ match: '[x] ', mode: 'block', format: toggleList + setNodes({ checked: true }) }`                       | `TaskListRules.markdown({ checked: true })`                                                    |

  ```tsx
  ListPlugin.configure({
    inputRules: [
      BulletedListRules.markdown({ variant: "-" }),
      BulletedListRules.markdown({ variant: "*" }),
      OrderedListRules.markdown({ variant: "." }),
      OrderedListRules.markdown({ variant: ")" }),
      TaskListRules.markdown({ checked: false }),
      TaskListRules.markdown({ checked: true }),
    ],
  });
  ```

  Replace `@platejs/list` with `@platejs/list-classic` imports when using the classic list model. The factory names are identical.

  #### Math — `@platejs/math`

  | Old rule               | New rule                                                                                         |
  | ---------------------- | ------------------------------------------------------------------------------------------------ |
  | Inline equation `$…$`  | `InlineEquationPlugin.configure({ inputRules: [MathRules.markdown({ variant: '$' })] })`         |
  | Block equation `$$…$$` | `EquationPlugin.configure({ inputRules: [MathRules.markdown({ on: 'break', variant: '$$' })] })` |

  #### Link — `@platejs/link`

  | Old behavior           | New rule                                   |
  | ---------------------- | ------------------------------------------ |
  | `[text](url)` markdown | `LinkRules.markdown()`                     |
  | Autolink on paste      | `LinkRules.autolink({ variant: 'paste' })` |
  | Autolink on space      | `LinkRules.autolink({ variant: 'space' })` |
  | Autolink on Enter      | `LinkRules.autolink({ variant: 'break' })` |

  ```tsx
  LinkPlugin.configure({
    inputRules: [
      LinkRules.markdown(),
      LinkRules.autolink({ variant: "paste" }),
      LinkRules.autolink({ variant: "space" }),
      LinkRules.autolink({ variant: "break" }),
    ],
  });
  ```

  #### Text substitutions (arrows, fractions, legal, math operators, smart quotes)

  Move these to a local `createSlatePlugin` with `createTextSubstitutionInputRule`:

  ```tsx
  import {
    createSlatePlugin,
    createTextSubstitutionInputRule,
    KEYS,
  } from "platejs";

  const isTextSubstitutionBlocked = (editor) =>
    editor.api.some({ match: { type: [editor.getType(KEYS.codeBlock)] } });

  const ShortcutsPlugin = createSlatePlugin({
    key: "shortcuts",
    inputRules: [
      createTextSubstitutionInputRule({
        enabled: ({ editor }) => !isTextSubstitutionBlocked(editor),
        patterns: [
          { format: "→", match: "->" },
          { format: "⇒", match: "=>" },
          { format: "½", match: "1/2" },
          { format: "™", match: ["(tm)", "(TM)"] },
          { format: ["“", "”"], match: '"' },
        ],
      }),
    ],
  });
  ```

  Each pattern set is just data — `autoformatArrow`, `autoformatLegal`, `autoformatMath`, `autoformatPunctuation`, `autoformatSmartQuotes`, and `autoformatLegalHtml` from the old package map 1:1 onto `patterns` arrays. `AutoformatKit` in the Plate registry is pre-built with all of them.

  #### Custom rules

  Old `AutoformatRule` objects have no direct replacement. Build a rule family with `createRuleFactory`:

  ```tsx
  import { createRuleFactory } from "platejs";

  const MyRules = {
    markdown: createRuleFactory({
      type: "blockMatch",
      match: "!! ",
      format: "my-block",
    }),
  };

  MyPlugin.configure({ inputRules: [MyRules.markdown()] });
  ```

  ### Option removals

  - `enableUndoOnDelete` — removed. Backspace on a rule-inserted node restores the source text by default.
  - `rules[].query` — replaced by `enabled` on the rule factory call.
  - `rules[].preFormat` / `rules[].format` — replaced by rule-family `format` and `resolve` callbacks inside `createRuleFactory`.
  - `rules[].trigger` — rule families set their own trigger. Override it with the `trigger` option on a custom `createRuleFactory` call.

  See the [Autoformat](/docs/autoformat) doc for the kit path and the [Plugin Input Rules](/docs/plugin-input-rules) guide for the full runtime.
