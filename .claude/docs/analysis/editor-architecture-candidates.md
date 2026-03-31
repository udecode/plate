# Editor Architecture Candidates for Plate

This is the opinionated shortlist. Not a market map. Not a graveyard of every editor repo on GitHub. Just the candidates and inspirations actually worth keeping in Plate's future architectural comparison set.

It is intentionally not a prescription for exact features Plate should copy. The current analysis is strong enough to rank and frame the field, not to lock Plate into a shopping list.

## Repos

- [ProseMirror](https://github.com/ProseMirror/prosemirror)
- [Lexical](https://github.com/facebook/lexical)
- [Tiptap](https://github.com/ueberdosis/tiptap)
- [Pretext](https://github.com/chenglou/pretext)
- [Premirror](https://github.com/samwillis/premirror)
- [Slate](https://github.com/ianstormtaylor/slate)
- [edix](https://github.com/inokawa/edix)
- [use-editable](https://github.com/FormidableLabs/use-editable)
- [rich-textarea](https://github.com/inokawa/rich-textarea)
- [@react-libraries/markdown-editor](https://github.com/ReactLibraries/markdown-editor)
- [urql](https://github.com/urql-graphql/urql)
- [TanStack DB](https://github.com/TanStack/db)
- [VS Code](https://github.com/microsoft/vscode)
- [Language Server Protocol](https://github.com/microsoft/language-server-protocol)
- [EditContext API docs](https://developer.mozilla.org/en-US/docs/Web/API/EditContext_API)
- [Open UI Richer Text Fields](https://open-ui.org/components/richer-text-fields.explainer/)

## Clone Or Update

Run this from `/Users/zbeyens/git/plate` if you want the comparison repos checked out in `..`:

```bash
for repo in \
  ProseMirror/prosemirror \
  facebook/lexical \
  ueberdosis/tiptap \
  chenglou/pretext \
  samwillis/premirror \
  ianstormtaylor/slate \
  inokawa/edix \
  FormidableLabs/use-editable \
  inokawa/rich-textarea \
  ReactLibraries/markdown-editor \
  urql-graphql/urql \
  TanStack/db \
  microsoft/vscode \
  microsoft/language-server-protocol
do
  name="${repo##*/}"
  if [ -d "../$name/.git" ]; then
    git -C "../$name" pull --ff-only
  else
    git clone "https://github.com/$repo.git" "../$name"
  fi
done
```

## Ranking

1. ProseMirror
2. Lexical
3. Tiptap
4. Pretext + Premirror
5. Slate
6. edix
7. use-editable
8. rich-textarea
9. @react-libraries/markdown-editor
10. urql
11. TanStack DB
12. VS Code + Language Server Protocol
13. EditContext API
14. Open UI Richer Text Fields

## Tier 1: Direct Comparison Targets

### ProseMirror

Still the center of gravity.

Why it matters:

- Best substrate for schema, transforms, plugins, and serious document structure.
- Still the cleanest answer to "what does a disciplined rich-text engine look like?"
- If Plate wants to absorb the best ideas in the space instead of inventing weird local alternatives, this is still the first stop.

Take:

If Plate ever compares itself against one core editor architecture, this is the one. Everything else is either reacting to it, productizing it, or trying to escape its complexity.

### Lexical

The strongest non-ProseMirror engine to study hard.

Why it matters:

- Strong modern runtime posture: immutable editor state, command system, own reconciliation strategy.
- Serious performance intent instead of accidental performance.
- Backed by Meta, which matters when evaluating whether ideas survived real product abuse.

Take:

If Plate ever questions its underlying runtime model, Lexical is the real challenger, not a side-show wrapper.

### Tiptap

Not the engine winner. The productization winner.

Why it matters:

- Massive extension surface and polished packaging around ProseMirror.
- Strong docs, onboarding, examples, and "this actually ships in products" energy.
- Useful benchmark for DX, extension ergonomics, collaboration packaging, and ecosystem capture.

Take:

Do not compare Plate to Tiptap as a better engine. Compare Plate to Tiptap as a better developer product.

### Pretext + Premirror

This is the most important future-facing lane.

Why Pretext matters:

- It tackles multiline text measurement and layout without relying on DOM reflow.
- That is a huge missing primitive in web editors, especially for pagination, composition, and layout-aware editing.

Why Premirror matters:

- It treats ProseMirror as document truth and `@chenglou/pretext` as the measurement/layout primitive.
- The local `../premirror` direction is exactly the kind of synthesis worth watching: document engine plus deterministic page composition instead of pretending pagination is a CSS afterthought.

Take:

This is not "another editor." It is the strongest path toward solving the unsolved page-layout problem on the web.

## Tier 2: Important, But Not the Main Bet

### Slate

Important because Plate comes from this world.

Why it matters:

- It shaped a lot of Plate's current mental model and ergonomics.
- It stays attractive because it is flexible and React-friendly.

Why it is not the north star:

- Even its own repo still describes it as beta.
- Historically great for flexibility, less convincing as the long-term answer for strict structure, heavy composition, and platform-grade editor architecture.

Take:

Study Slate to understand your inheritance and its limits, not because it is the future benchmark.

### edix

Very good inspiration repo. Not a core replacement candidate.

Why it matters:

- It is explicitly an experimental, framework-agnostic, small `contenteditable` state manager.
- Its motivation is sharp: full editor frameworks are too much for small editing surfaces, but raw `contenteditable` is a mess.

Take:

`edix` is a scalpel, not the next spine. Worth studying for lightweight surfaces, not for replacing Plate's serious document architecture.

### use-editable

Still one of the cleanest small-surface inspirations.

Why it matters:

- It is a tiny React hook for turning elements into editable, fully renderable content surfaces.
- Great example of "I want a custom editable surface without dragging in a cathedral."

Take:

This is not a full editor framework. It is a strong reminder that not every editable surface deserves the full Plate stack.

### rich-textarea

A very relevant companion to the `edix` line of thinking.

Why it matters:

- It aims to keep native textarea behavior while adding highlighting, decoration, autocomplete, and caret-aware interactions.
- Strong example of going "smaller than a full editor" without falling back to dumb plain text.

Take:

Good inspiration for lightweight, high-polish text surfaces. Not a contender for Plate's core document model.

### @react-libraries/markdown-editor

Narrower, but still useful.

Why it matters:

- Markdown-first editing surface with SSR support and externally controllable editing events.
- Useful example of a focused editing package that is trying to stay controllable instead of becoming an everything-framework.

Take:

Relevant as a markdown-surface inspiration, not as a major architecture benchmark.

## Tier 3: Cross-Domain Architecture Inspirations

### urql

Not an editor. Still extremely relevant.

Why it matters:

- Highly customizable pipeline architecture through exchanges.
- Clear stance on normalized caching and composable behavior layers.

Take:

This is useful when thinking about editor infrastructure, not text rendering.

### TanStack DB

One of the best non-editor inspirations on the list.

Why it matters:

- Normalized collections.
- Sub-millisecond live queries.
- Instant optimistic writes.

Take:

If Plate wants better projections, indexes, or derived editor state, TanStack DB is a smarter inspiration than another random editor repo.

### VS Code + Language Server Protocol

This is the service architecture model worth studying closely.

Why it matters:

- Stable core editor plus protocolized external intelligence.
- Analyzers, completions, diagnostics, and actions can live outside the core UI process.

Take:

If Plate ever grows semantic services, AI analyzers, structural linting, or document reasoning, this is the right mental model.

### EditContext API

Important future platform primitive.

Why it matters:

- The web platform is finally acknowledging that serious custom text editing needs more direct control than classic `contenteditable`.
- This is the kind of primitive that could eventually let editors escape a lot of legacy DOM pain.

Take:

Do not bet Plate on it yet. Track it aggressively.

### Open UI Richer Text Fields

More important than it looks.

Why it matters:

- It is standards work aimed at text controls that need more than plain `<input>` and `<textarea>` behavior.
- That matters for mentions, autocomplete, highlighting, structured inline chips, and similar rich text-entry surfaces.

Take:

This is not a framework. It is a signal about where the platform should go next.

## How To Use This List

### Core comparison set

For future architecture work, the real comparison set should be:

- ProseMirror
- Lexical
- Tiptap
- Pretext + Premirror

That is the serious shortlist.

### Secondary influence set

Use these for tactical ideas, not for "should we rebuild Plate around this?":

- Slate
- edix
- use-editable
- rich-textarea
- @react-libraries/markdown-editor

### Cross-domain influence set

Keep these in the room when designing next-gen Plate architecture:

- urql
- TanStack DB
- VS Code
- Language Server Protocol
- EditContext API
- Open UI Richer Text Fields

This is not a mandate to copy them. It is a lens for what deserves deeper research when the question is architecture, layout, services, or future platform bets.

## Bottom Line

ProseMirror is still the architectural benchmark.

Lexical is the strongest engine challenger.

Tiptap is the best productization benchmark.

Pretext, especially combined with the `../premirror` direction, is the most important future-facing bet because it attacks the layout and pagination problem that web editors still mostly fake.

The smartest non-editor inspirations are TanStack DB and the VS Code/LSP model.

`edix`, `use-editable`, `rich-textarea`, and `@react-libraries/markdown-editor` matter because they show how to build lighter editing surfaces without dragging a whole cathedral into every text field.

## Sources

- [ProseMirror](https://prosemirror.net/)
- [ProseMirror GitHub](https://github.com/ProseMirror/prosemirror)
- [Lexical](https://lexical.dev/docs/intro)
- [Tiptap](https://tiptap.dev/docs/editor/getting-started/overview)
- [Slate](https://github.com/ianstormtaylor/slate)
- [edix](https://github.com/inokawa/edix)
- [use-editable](https://github.com/FormidableLabs/use-editable)
- [rich-textarea](https://github.com/inokawa/rich-textarea)
- [@react-libraries/markdown-editor](https://github.com/ReactLibraries/markdown-editor)
- [urql](https://github.com/urql-graphql/urql)
- [TanStack DB](https://github.com/TanStack/db)
- [VS Code Language Server Extension Guide](https://code.visualstudio.com/api/language-extensions/language-server-extension-guide)
- [Language Server Protocol](https://microsoft.github.io/language-server-protocol/)
- [MDN: EditContext API](https://developer.mozilla.org/en-US/docs/Web/API/EditContext_API)
- [Open UI: Richer Text Fields](https://open-ui.org/components/richer-text-fields.explainer/)
