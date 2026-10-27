# Autoformat marks and indent keys from the beta sweep

Status: pushed, waiting for an owner to rebase it onto origin/next and open the PR
Playbook: bug-fix
Plans: 2026-10-19-intraword-script-shorthand.md

## Brief

### What will change?

Seven beta sweep issues are fixed: Tab and Backspace indent as the toolbar does, autoformat types `≱`, `***both***` and `==highlight==` correctly, and `H~2~O` and `X^2^` give subscript and superscript.

### What could go wrong?

`~` and `^` now open inside a word, an exception to zbeyens's MARK-004 rule that he has not confirmed yet. A closing `~` or `^` can take 0.2 s in a 1,000-leaf paragraph that starts with a backtick.

## Teach

Plate turns typed Markdown shortcuts into marks or symbols with input rules. A mark rule waits for the closing character, then looks back for the opener. A text substitution swaps a typed pattern for a symbol as soon as it ends.

Most of these bugs came from two rules racing. AutoformatKit swapped `~2` for `₂` and `==` for `≡` before the mark rule saw its closer, and a short pattern such as `~=` won over `!~=`. Subscript and superscript also refused any opener after a letter, so `H~2~O` stayed plain.

The fixes let the longest substitution win, teach the highlight rule the `≡` opener, drop the digit substitutions, and give the script rules a private exception for an opener inside a word. Tab and Backspace now ask the same indent target lookup the toolbar uses.

## Demo

1. Open `/docs/autoformat`, click at the end of the intro paragraph and press Enter. Type `H~2~O X^2^ and 3~5天~ !>= ***both*** ==yellow== ` key by key. You should see H₂O X², plain `3~5天~`, `≱`, bold italic *both* and a highlighted yellow, with no `≡` left.
2. Open `/docs/indent`, put the caret at the start of the second indented paragraph and press Backspace. It moves one level out instead of joining the paragraph above. Then select from the first paragraph into the second and press Tab. Both indent one level, and focus stays in the editor.

## Main changes

- Tab indents every indent target in the selection with the toolbar's lowest-target lookup, so a Details title and a two-paragraph range indent instead of moving focus (#5199, #5200).
- A text substitution rule tries the longest pattern that ends at the caret first, and AutoformatKit also maps `≯=` and `≮=` to `≱` and `≰` (#5202).
- The bold-italic combo rule opens and closes with `***` (#5203), and BasicMarksKit highlights text that opens with `≡` and closes with `==` (#5201).
- Backspace at the start of an indented paragraph removes one indent level before it joins (#5205).
- `toReactPlugin(Base, { component })` keeps its component through `.configure()` and `.extend()`, so subscript and superscript render as `<sub>` and `<sup>` in the kit.
- AutoformatKit drops the `~0`–`~9` and `^0`–`^9` digit substitutions, and the mark rule moves into a private factory that lets `ScriptRules` accept an opener inside a word (#5204). The same move stops the apply step from deleting the character after the caret mid-paragraph.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| How the nine commits land | One squashed commit through the repo's landing script, its body listing each fix (look) | Keep the nine commits in the PR | keep commits | detail |
| zbeyens's MARK-004 rule | Ship the script exception and ask him in the PR (look) | Hold the PR until he confirms | hold for zbeyens | small |

## MARK-004 exception

MARK-004 in the editor-behavior spec keeps a mark shortcut plain when its opener follows a non-space character, so `2*3*4` and `snake_case_name` stay text. This PR adds one exception for subscript and superscript, which MARK-002 asks for with `H~2~O` and `X^2^`. Inside a word, `~` or `^` opens only after an ASCII letter, a digit or `)`, and the text between must be ASCII letters or digits with an optional sign at either end. With the inline-code plugin installed, it also stays plain inside inline code and wherever one more typed backtick would wrap it in code. Every other mark rule keeps MARK-004 unchanged. zbeyens owns both rows, so this PR asks him to confirm the exception; the spec and `current-evidence.md` already record it as waiting on him.

## Verification

- Package tests pass on the rebased tree: core, standard-basic-nodes 149, standard-indent 19 and react-core 342, each with its partition typecheck; the AutoformatKit and playground kit tests pass 34.
- `/docs/autoformat` and `/docs/indent` were driven key by key at 1280 px on the rebased tree, with model and DOM read back; the registry is fresh after `build:registry --check`.
- Not run: `api-reference:check`, which needs built packages, a type-aware oxlint, and a full-project typecheck.

## Open work

- zbeyens confirms the MARK-004 exception. owner: zbeyens. stop: his review on this PR.
- A mark rule's backward opener search is slow in long paragraphs, which the script exception now also pays. owner: the branch's next owner. stop: a linear search with the timing probe.
- AutoformatKit still turns `a==word==` into `a≡word≡`. owner: the branch's next owner. stop: a boundary-checked `==` substitution.
- A strict code-quality review of the branch left four follow-ups: the substitution rule could reuse the mark rule's opener search, the React adapter could keep its component inside `wrapPlatePlugin`, Shift+Tab cannot outdent a Details from its title while Tab now indents it, and the `≡ … ==` highlight closer could move behind `HighlightRules`. owner: the branch's next owner, once this PR merges, the last one with zbeyens. stop: each task's own check.
- The editing subject file lists the remaining items, each with its owner and stop.
