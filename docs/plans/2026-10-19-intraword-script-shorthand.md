---
review_scopes: [editing, styles]
review_basis: []
work_kind: implementation
review_commit: ba684851c2fe876555dbb1f27d6f52282c3dae15
review_inputs: [docs/editor-behavior/markdown-editing-spec.md, packages/platejs/src/lib/plugins/input-rules/createInputRules.ts, packages/platejs/src/features/basic-nodes/lib/BaseMarkPlugins.ts, packages/platejs/src/features/basic-nodes/lib/BaseMarkPlugins.spec.tsx, apps/www/src/__tests__/package-integration/autoformat/current-kit.slow.tsx]
---

# Typed H~2~O and X^2^ become subscript and superscript

Status: executed, one local commit waiting on your review and zbeyens's MARK-004 confirmation before push
Playbook: plan

## Brief

### What will change?

Typed H~2~O or X^2^ gives a subscript or superscript 2 (udecode/plate#5204). Inside a word it fires only after an English letter, digit or closing parenthesis, around English letters or digits. Chinese text, faces like (^3^) and spaceless math stay plain.

### What could go wrong?

Some cases still fire inside a word, such as 2^3^4. After bold text, the after-space rule applies. A stray earlier backtick keeps H~2~O plain. A 1,000-leaf paragraph that starts with a backtick slows the closing key to 0.2 s.

## Teach

Plate turns typed Markdown shortcuts into marks. When you type the closing character, a rule looks back for the opening one and marks the text between. One rule decides every shortcut, and it refuses an opener that follows any character other than a space, so 2*3*4 and snake_case_name stay plain.

That same check is why H~2~O stays plain: the tilde follows H. The spec asks for both things, so the two rows disagree.

This plan keeps the shared rule and adds one private exception for the subscript and superscript shortcuts. Inside a word, the opener must follow an English letter, a digit or a closing parenthesis, and the text between must be English letters or digits with an optional sign at either end. So a double tilde, an escaped tilde, 3~5天 and (^3^) stay plain. The exception also refuses inline code, and any match the inline-code rule would close into code.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| What may sit between the delimiters inside a word | English letters or digits, with an optional plus or minus at either end (look) | Anything without spaces, as in Pandoc, which also marks 3~5天 and ^_^ | pandoc tokens | big |
| What may come right before the opener inside a word | An English letter, a digit or a closing parenthesis (look) | Any character except the same delimiter or a backslash, which also marks (^3^) and 好的^w^ | any predecessor | small |
| Where the exception lives | Private to the subscript and superscript shortcuts, no new option (look) | A public option on the general mark rule | public option | big |
| Script shortcuts after a space | Unchanged, spaced text still allowed | Pandoc's no-spaces rule everywhere | pandoc everywhere | small |
| Script shortcuts inside a word in inline code | Stay plain (look) | Apply like anywhere else | script in code | small |
| The equality shortcut that turns a==word== into a≡word≡ | Left alone here, offered as its own task (look) | Fix it in this change | fix equality too | small |
| A mark shortcut without a separate closing pair, such as italic or subscript, typed in the middle of a paragraph deletes the next character | Fixed here, because typing H~2~ into existing text hits it (look) | Leave the moved code as it was | keep the space bug | small |
| Two backticks, then a word with a caret superscript | Marks, because the inline-code rule never closes code there either (look) | A separate backtick check that keeps it plain | double backtick plain | small |
| Code rules turned off while the code plugin stays installed | The script exception still refuses where the code rule would have matched (look) | Ask only an enabled code rule | enabled code rule | small |
| How the script exception finds an inline-code opener | Asks the inline-code rule's own backward search, about 0.2 s per closing key in a 1,000-leaf paragraph that starts with a backtick (look) | A hand-written reverse pass over text leaves, fast, but it reads backticks inside read-only inline elements that the code rule skips | faster search | small |
| Delivery | One local commit, no push until you and zbeyens review | Push and open a PR | push | detail |

## What other editors do

The design runners read the Pandoc manual's subscript and superscript section; the other rows come from each project's documented syntax and were not run in this plan.

| Editor | Sub/sup typing shortcut | Opens inside a word | What may sit inside |
| --- | --- | --- | --- |
| Pandoc (subscript, superscript extensions) | `~x~`, `^x^` | yes, `H~2~O`, `2^10^` | anything without spaces, unless escaped |
| markdown-it-sub, markdown-it-sup | `~x~`, `^x^` | yes | anything without spaces, unless escaped |
| Typora (Markdown Reference, opt-in setting) | `~x~`, `^x^` | yes, its example is `H~2~O` | escaped spaces allowed |
| ProseMirror, Tiptap, Lexical, Slate | none in their default Markdown shortcut sets | n/a | n/a |
| Plate before this plan | `~x~`, `^x^` after a space only | no | trimmed text, inner spaces allowed |
| Plate after this plan | same shortcuts | yes, after an ASCII letter, digit or `)`, outside inline code | after a space: unchanged; inside a word: letters or digits with an optional sign at either end |

## Layer and owner

| Delta | Responsibility | Decision |
| --- | --- | --- |
| added | Intra-word mark shorthand | The mark rule's resolver and apply move into a private factory, `markInputRule.internal.ts`, that takes an optional intra-word acceptor. `createMarkInputRule` passes none, so every public caller keeps the after-whitespace rule. `ScriptRules` passes the script acceptor, which owns the predecessor, token and inline-code checks. |

The internal file sits in `platejs` core (`packages/platejs/src/lib/plugins/input-rules/`), outside the barrel, because `tooling/scripts/brl.sh:53` excludes `*internal*`. `ScriptRules` in `packages/platejs/src/features/basic-nodes/lib/BaseMarkPlugins.ts` imports it, as `BaseCommentsPlugin.ts:20` already imports `lib/editor/editorUser.internal`; the plan panel's Sol seat confirmed the entrypoint edges are allowed.

## Main changes

- `createMarkInputRule`'s resolver and apply move into `markInputRule.internal.ts`. The resolver becomes `resolveMarkSpan(context, config, acceptIntraWord?)`, and `createMarkSpanInputRule(config, acceptIntraWord?)` wraps it. When the character before the opener is not whitespace, the resolver asks `acceptIntraWord({ content, context, previousChar, start })` instead of refusing outright, where `start` is the opener's point. `createMarkInputRule` passes nothing, so its behavior and type stay as they are.
- `ScriptRules.markdown` passes an acceptor that requires a previous character matching `[A-Za-z0-9)]` and content matching `^[+-]?[A-Za-z0-9]+[+-]?$`. It refuses while the code mark is active at the caret, pending toggles included, and when a text leaf from the opener's leaf to the caret's carries the code mark. When the block text before the caret holds a backtick, it refuses if `resolveMarkSpan(context, { start: '`' })`, the inline-code rule's own resolver, finds a code span ending at the caret. So the script exception and the code rule cannot disagree.
- The rule's apply step compared two points by identity, so a rule without `end` deleted a collapsed range after the caret, which removed the next character when the shortcut completed mid-paragraph. It now deletes only a non-empty range (`RangeApi.isCollapsed`).
- The checks run only on a `~` or `^` whose opener follows a letter, digit or `)`. With no backtick before the caret, the closing key costs within noise of the after-space path up to 1,000 leaves. With a backtick at the start of a 1,000-leaf paragraph it costs about 190 ms, the code rule's own search cost, which Open work tracks.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Script shorthand inside a word | refused | accepted for an ASCII token after a letter, digit or `)`, outside inline code | `ScriptRules` acceptor | MARK-002 asks for `H~2~O` and `X^2^`; the predecessor and token keep CJK ranges, kaomoji and spaceless math plain | no caller change | Steps 1, 2 and 6 | chains such as `2^3^4` | rearchitect |
| Script shorthand after whitespace | trimmed content, inner spaces allowed | unchanged | `createMarkSpanInputRule` | the issue does not need a change there | none | Step 1 keeps ` ~foo bar~` | none | keep |
| Emphasis, strike, highlight, combo shorthand | after-whitespace rule | unchanged | `createMarkInputRule` | MARK-004 | none | Step 1 keeps `a**word**` and `a~~word~~` literal | none | keep |
| `createMarkInputRule` public type and semantics | `MarkInputRuleConfig` | unchanged | input rules | no new option for one caller | none | typecheck, `api-reference:check` | none | keep |

## Scope

In: the private factory and its intra-word hook, the script acceptor, their tests, spec rows MARK-002 and MARK-004 and the Inline Mark Autoformat Ownership bullet, the evidence drift line, the input-rules guide, the subscript and superscript pages with their Chinese twins, a `platejs` changeset.

Out: AutoformatKit's `==` substitution, mark shortcuts after a space inside inline code, an escaped closer after a space, the `^o` degree shortcut, the previous-character read at a leaf boundary, the autoformat demo's text, and the false `matchDelimitedInline` sentence in the input-rules guide.

## Steps

- [x] 1. Write the failing tests first in `packages/platejs/src/features/basic-nodes/lib/BaseMarkPlugins.spec.tsx`, each typed key by key, one case per failure mode. Marks: `H~2~` and `X^2^` mark only the digit; `10^-3^`, `Ca^2+^` and `(a+b)^2^` mark. After code: `` `x` `` closed by the code rule then ` H~2~`, a code leaf holding a backtick then ` H~2~`, ``` ``a`b`` H~2~ ```, a loaded paragraph holding a bare backtick between spaces then ` H~2~`, and `H~2~` typed in the middle of a paragraph that ends in a backtick mark. ``` ``a^b^ ``` marks, as the code rule never closes it. Literal: `a**word**`, `a~~word~~`, `\~2~`, `H~2\~`, `x^2+y^`, `(^3^)`, `3~5天，需要2~`, `` `a^b^ ``, `` \` `a^b^ ``, and `` a`b and `x^2^ ``; with the code mark on, `a^b^`; a code leaf `a^b` followed by plain `c`, then `^`. Each place the code rule takes a backtick across leaves follows it: a bold leaf then `` `x `` then ``^2^` `` gives code; a code leaf `` `x `` then ` H~2~` stays literal; plain `` `x `` then a code leaf `` ` `` then ` H~2~` gives subscript, and without the space stays literal; with code toggled on right before the closer, `H~2~` and `X^2^` type the closer as code; `` `a ``, a read-only inline element holding a backtick, then ` H~2` or ` X^2` keeps the closer literal, as the code rule wraps across that element. `*a*` typed before ` then` keeps the space. Unchanged after a space: ` ~foo bar~` gives subscript. `~~strike~~` with Strikethrough and Script rules in both plugin orders gives strikethrough. In `apps/www/src/__tests__/package-integration/autoformat/current-kit.slow.tsx`: `H~2~O X^2^` typed key by key with the shipped kits gives plain `H`, sub `2`, plain `O X`, sup `2`, and `` a`b and `x^2^ `` stays literal. Proof: a base run logs the mark cases red and every literal and unchanged case green.
- [x] 2. Build `markInputRule.internal.ts` and the script acceptor, and rebind `createMarkInputRule` and `ScriptRules.markdown`. Proof: Step 1's tests green, the `platejs` core and basic-nodes partitions green, `apps/www/src/__tests__/package-integration/playground/playground-rules.slow.tsx` green, the `platejs` core and basic-nodes typechecks clean, the spec typecheck clean in the task's files, `pnpm brl` leaves the barrel unchanged, `pnpm --filter www api-reference:check` not run because it needs built packages, with both exported signatures unchanged in source, and a timing probe of the closing `~` keystroke, intra-word against after-space on the candidate, with paragraphs of 10, 100 and 1,000 leaves, with and without a backtick at the paragraph start, and a 3,000-character single leaf.
- [x] 3. Reconcile the law. Update MARK-002, MARK-004 and the Inline Mark Autoformat Ownership bullet in `docs/editor-behavior/markdown-editing-spec.md`, and the Mark autoformat drift line, which records the escaped-closer and leaf-boundary deviations in `docs/editor-behavior/current-evidence.md`. Proof: the rows name Step 1's tests.
- [x] 4. Through `plate-docs`, update `content/docs/(guides)/plugin-input-rules.mdx` (the shortcut sentence near line 283 and the `ScriptRules` row near line 968) and `content/docs/(plugins)/(marks)/subscript.mdx`, `superscript.mdx` and their `.cn.mdx` twins, with the example coverage audit. Proof: `pnpm --filter www build:source`, `pnpm --filter www check:docs`, `pnpm --filter www build:registry` then `--check`.
- [x] 5. Add a `platejs` patch changeset for the `ScriptRules` behavior. Proof: the changeset skill's rules; no registry source changes, so no registry changelog entry.
- [x] 6. Hand drive `/docs/autoformat` on the `www-drive` server: type `H~2~O X^2^` and `3~5天~` key by key, read back marks and DOM, screenshot. Proof: `node tooling/scripts/hand-drive.mjs check` log on the plan's files.
- [x] 7. Writing passes, the `api-build` panel on the diff, the last checks and one local commit that says Fixes #5204. Proof: the decision log's `writing`, `panel` and `build` rows; nothing pushed.

## Completion Gates

| Gate | Evidence |
| --- | --- |
| blast-radius before code | done: `createMarkInputRule` callers keep their behavior except the apply fix, which reaches every rule without `end` (italic, inline code, script, `≡` highlight) |
| plate-docs on each docs page | done: `build:source` and the docs parity check pass, `build:registry` then `--check` fresh; `api-reference:check`, the first link of `check:docs`, not run because it needs built packages |
| Hand drive | done: `/docs/autoformat` at 1280 px after the round-3 revert, and `hand-drive.mjs check` covers all six pages |
| best-api repair | skipped: no public signature changes; `createMarkInputRule` and `ScriptRules.markdown` keep their types |
| oxlint before the diff panel | partial: oxlint on the five task code files exits 0, not type-aware |
| api-build panel on the diff | done: three rounds, the cap; round 3's critical was answered by reverting round 2's walk |
| changeset | done, `.changeset/script-shorthand-inside-word.md` |
| zbeyens confirms the MARK-004 script exception | pending, before any push |

## Proof

The Step 1 draft ran at `ba684851c2` with 12 intra-word mark cases red and 22 literal or unchanged cases green (decision log row `proof`, round 2 cases). The earlier base control at `ba684851c2` typed 23 cases into Base bold, italic, underline, strikethrough, script and highlight plugins with their markdown rules, without CodeRules, the `≡` highlight rules, three of the four combo rules or AutoformatKit. Every intra-word opener stayed literal, `a ~foo bar~` gave subscript `foo bar`, `\~2~` stayed literal and `~~strike~~` gave strikethrough (decision log row `proof`).

## Panel gate

Round 1 (Opus, Astra, Sol) found three critical issues. Pandoc's grammar turns CJK ranges, kaomoji and spaceless math into marks. Escaped closers became marks. Intra-word openers fired inside inline code. The token acceptor and its inline-code check answer all three, and the after-space law stays unchanged. Challenge delta: improved. Pandoc's whitespace-only content rule and the spaced-script cut were removed, and the script policy moved from a core grammar union into `ScriptRules`' acceptor.

Round 2 (Opus, Astra, Sol) found the inline-code check still weak. Whole-block backtick parity counted backticks inside code and escaped backticks, and the caret-only mark check missed an opener inside a code leaf. Both Codex seats rated these critical and Opus rated them a warning and a nit. The acceptor now walks text leaves, treats code leaves as opaque and refuses when the match touches code. Opus also showed that faces with letter or digit content, such as (^3^), still fired, so the opener must now follow a letter, digit or `)`. Challenge delta: improved.


Round 3 (Opus, Astra, Sol), the last plan round, found that backtick parity still misread delimiter runs: two backticks then `a^b^`, and `` a`b and `x^2^ ``, where a later backtick closes a code span. Both Codex seats rated it critical and Opus a warning. The acceptor now applies the code rule's own opener test to the last backtick run, so parity and escape counting are gone. Both Codex seats also showed the leaf walk grows with the paragraph, so Step 2 now measures it. These changes go to the diff panel. Challenge delta: improved.

Diff round 1 (Opus, Astra, Sol) found that the hand-written backtick check still disagreed with the inline-code rule. Both Codex seats rated it critical: it misread a backtick at the start of a text run and a backtick inside a code leaf. The acceptor now asks the code rule's own resolver, and three tests reproduce the cases. Opus found the law, docs and changeset claimed limits that fail at a leaf boundary, and an Ownership bullet that wrote the escaped-closer bug into the law; this round fixes both. Sol's point about disabled code rules stays a Defaults pick. Challenge delta: improved.

Diff round 2 (Opus, Astra, Sol) found that dropping the caret's code check lost a code mark toggled on right before the closer. Sol rated it critical, Astra a warning and Opus a nit. The check is back, with a test for each script. Astra and Sol showed the code-rule lookup cost 200 ms per closing key in a 1,000-leaf paragraph with an early backtick; a reverse leaf pass now finds the backtick and hands it to the shared check, and Opus's two fuzz oracles still find 0 mismatches. Opus showed the docs claimed the backtick limit even when the code shortcut is off, so the texts now say so. Challenge delta: improved.

Diff round 3 (Opus, Astra, Sol), the last round, found that round 2's reverse leaf pass read a backtick inside a read-only inline element, which the code rule's search skips. So `` `a ``, a read-only element holding a backtick, then ` H~2~` gave a subscript where the next backtick would wrap it in code. Both Codex seats rated it critical. The pass is gone and the acceptor asks the code rule's resolver again, with a test for each script that fails on the pass. The 190 ms closing key moves to Open work under the backward-search task. Opus rated the round ship with four nits. Removing the pass also removed the overlapping walks and the cost claim. A non-selectable inline element needs no change, since the code rule leaves that case plain too. The long doc lines were reflowed. Challenge delta: improved, with one fix reverted.

## Close

Typed `H~2~O` and `X^2^` now give subscript and superscript 2, key by key, in the shipped kits and on `/docs/autoformat` (udecode/plate#5204). One local commit holds it; nothing is pushed.

Reversal first. Diff round 2 swapped the inline-code lookup for a fast reverse leaf pass. Round 3 showed that pass reads a backtick inside a read-only inline element, which the inline-code rule skips, so the lookup went back to the inline-code rule's own resolver. Two spec cases fail on the pass and pass now. The price is about 190 ms on the closing key in a 1,000-leaf paragraph that starts with a backtick, which `t_9281fdf0` owns.

Proof, from the log rows' scopes:

- The spec has 65 cases, all passing. The core partition passes 635 and standard-basic-nodes 148. The AutoformatKit and playground kit tests pass 34.
- The core and standard-basic-nodes partition typechecks exit 0. No full-project typecheck ran.
- Opus's fuzz oracles find 0 mismatches over 1,026 leaf structures and 5,461 typed prefixes.
- The inline-code oracle wraps across a read-only element and leaves a non-selectable one plain, and the script rule now agrees with both.
- The hand drive on `/docs/autoformat` reads `H`, sub `2`, `O X`, sup `2`, with `3~5天~` and `` `x H~2~ `` plain, in the model and the DOM.
- Not run: `api-reference:check`, which needs built packages, and type-aware oxlint.

Counts: 7 of 7 steps done; plan panel 3 rounds; diff panel 3 rounds with 4 critical findings applied, 1 of them by revert; 1 warning deferred to `t_9281fdf0`.

Open work moved to the editing subject file's Open work with owners and stops. The one that blocks a push is zbeyens confirming the MARK-004 exception.

## Open work

- AutoformatKit turns typed `a==word==` into `a≡word≡`, because its unpaired `==` substitution has no boundary check (`apps/www/src/registry/components/editor/autoformat.tsx:28`, `packages/platejs/src/lib/plugins/input-rules/createInputRules.ts:499`). Pre-existing, not touched by this plan. owner: natamox, offered as its own task. stop: a boundary-checked `==` substitution with a kit test.
- Mark shortcuts after a space run inside inline code: `inputRuleVeto` covers node types only (`packages/platejs/src/lib/plugins/input-rules/InputRulesPlugin.ts:192-202`). owner: zbeyens, input rules. stop: a mark-aware veto or an accepted limit.
- The character before an opener reads as empty at a leaf boundary (`packages/platejs/src/lib/plugins/input-rules/markInputRule.internal.ts:50-58`), so the after-whitespace law applies there and the script acceptor is never asked. owner: zbeyens. stop: a block-text read with a split-leaf test.
- An escaped closer after a space still marks, such as ` ~2\~` and ` *a\*` (`packages/platejs/src/lib/plugins/input-rules/markInputRule.internal.ts:79`). Pre-existing for every mark rule. owner: zbeyens, input rules. stop: the factory refuses content that ends in a backslash, with a test.
- A mark rule's backward search for its opener is slow when it scans far back: a typed backtick costs 340 to 530 ms in a 1,000-leaf paragraph whose only backtick is at its start (`packages/plitejs/src/editor/before.ts`). Pre-existing for every mark rule. A closing `~` or `^` inside a word in that paragraph costs about 190 ms, because the script exception asks the same search. owner: natamox, suggested task `t_9281fdf0`. stop: a backward search linear in the scanned text, with the timing probe.
- The autoformat demo says nothing happens when a character comes before a shortcut, which is no longer true for `~` and `^` (`apps/www/src/registry/examples/values/autoformat-value.tsx:35`). owner: natamox. stop: one demo line with a registry changelog entry.
- `^o` becomes `°` before a closing `^` arrives, so `x^o^` cannot be typed (`apps/www/src/registry/components/editor/autoformat.tsx:97-99`). owner: natamox. stop: an ordering or boundary rule for the degree shortcut.
- The input-rules guide says `matchDelimitedInline` runs under `createMarkInputRule`, which is false (`content/docs/(guides)/plugin-input-rules.mdx:926`). owner: natamox. stop: one corrected sentence.
- zbeyens owns MARK-002 and MARK-004 (`docs/editor-behavior/current-evidence.md:158`). Following the code rule means one stray backtick earlier in a paragraph keeps H~2~O plain after it, where CommonMark and Pandoc leave an unclosed backtick literal. owner: zbeyens. stop: his confirmation before push.
