# Markdown regression fixes

Status: executed, reviewed and approved for PR delivery
Playbook: bug-fix

## Brief

### What will change?

Markdown export and import now preserve heading links, trailing paragraph breaks, trailing list breaks and sized table images. The implementation uses shared conversion rules. Review also removed a redundant content classifier.

### What could go wrong?

The table change supports registered block tags with no child content. Full repository checks, production builds and the browser engine matrix were not run. The earlier browser replay predates the behavior-preserving classifier cleanup.

## Main changes

| Case | Before | Current behavior |
| --- | --- | --- |
| 1 | A heading containing a bare URL throws during Markdown export. | HTML link fragments are valid phrasing while remaining valid flow content. The heading exports. |
| 2 | Consecutive trailing paragraph breaks introduce a backslash and lose a break. | Trailing breaks use HTML breaks and survive export and import. |
| 3 | List-item trailing breaks disappear. | List paragraphs use the shared paragraph encoder and preserve trailing breaks. |
| 4 | A sized image inside a table cannot be written on one line. | Childless registered block tags round-trip through table cells; the imported image retains width 200. |

## Solution review

The four fixes belong in the Markdown converter. They correct shared syntax handling without adding editor state, example-page workarounds or new public options. Review found one unnecessary helper and removed it. The PR panel also found a mixed-CRLF trailing-break regression. The paragraph producer now consumes CRLF as one newline, and an added case in the existing table test verifies the correction.

| Fix | Root cause and chosen solution | Alternative considered |
| --- | --- | --- |
| 1. Heading links | The shared content classifier rejected HTML in inline content, although link encoding can emit HTML. Accept HTML in both inline and block contexts. | A heading-specific or URL-specific exception would leave the shared classification wrong. |
| 2. Paragraph breaks | Markdown hard-break syntax does not preserve the final break sequence. Encode that sequence as HTML breaks in the existing paragraph encoder. | Converting every break to HTML would change ordinary output unnecessarily. Post-processing the exported string would lose document context. |
| 3. List breaks | The list serializer bypassed paragraph encoding. Reuse the paragraph encoder while keeping list structure and property accounting in the list serializer. | A second break-repair loop inside list serialization would duplicate paragraph rules. |
| 4. Table images | An attributed image uses a registered block tag, but the table writer rejected that syntax and the reader treated it as misplaced. Permit childless block tags on a table line and preserve their block meaning on import. | An image-specific exception would duplicate plugin knowledge. Tags with child content need a separate flattening policy and remain outside this change. |

The data flow remains editor nodes, Markdown syntax nodes, then text. The table writer and reader implement opposite directions of the same syntax rule. Existing attribute escaping protects table separators, quotes and line endings.

The classification fix made `isMdLineContent` identical to `isMdPhrasingContent`. Its only remaining caller now uses `isMdPhrasingContent`, and the redundant helper, type import and stale comment are removed. This follows the Laziness Protocol principle by deleting a second representation of the same rule.

The recommendation is to keep these implementations. They are the simplest supported solutions among the alternatives reviewed. This judgment covers the four reported failures and their existing consumers, not every possible Markdown document or custom mapping.

## Reproduction and expected result

Use [the original demo](http://localhost:3001/blocks/docx-demo) and [the fixed demo](http://localhost:3002/blocks/docx-demo). Import the same input, choose **Export as Markdown**, then import the downloaded file.

| No. | Input | Expected result after export and import |
| --- | --- | --- |
| 1 | A level-two heading containing `https://example.com` | Export completes, and the heading and link remain. |
| 2 | `a<br/><br/>`, a blank line, then `END` | Two trailing breaks remain after `a`, with no added backslash. |
| 3 | `- a<br/>`, a blank line, then `END` | The list item retains its trailing break. |
| 4 | A table cell containing an image with width 200 | The image remains inside the cell and retains width 200. |

## PR review

Two same-family panel rounds used GPT-6 Astra, GPT-6 Sol and GPT-6 Luna. The first found the CRLF regression, confirmed by a failing public conversion test and fixed at the paragraph producer. All three reviewers reported no findings on the correction in the second round. A separate concern about an image inside paragraph children used a schema-invalid document and was rejected after an exact runtime probe.

The evidence audit used Claude Opus 5.5 and a conversation digest. Its useful limits are retained below: browser proof predates cleanup, local logs are not available in a fresh checkout, and table-tag behavior is directly tested with an image. Broad checks and production builds remain outside this verification.

## Browser evidence

The recorded replay used the actual Import and Export controls on [the DOCX demo](http://localhost:3002/blocks/docx-demo), then imported the downloaded Markdown again. That replay verified the visible results before the classifier cleanup. The cleanup has a fresh converter test run; browser actions were not repeated for it.

[Replay record](artifacts/markdown-regression-fixes/browser-proof.md) lists the four inputs and results. [Downloaded-file assertions](artifacts/markdown-regression-fixes/downloads-proof.log) passed for heading links, paragraph breaks, list breaks and image width. The file probe uses the test editor plugin set; separate page reimports establish the demo result.

Image round-trip screenshot: `docs/plans/artifacts/markdown-regression-fixes/cell-image-roundtrip.png`.

## Checks

The final checks run against the branch synchronized with `next`. Logs remain local artifacts; reviewers can rerun the committed package tests and commands below.

| Command | Result | Local evidence |
| --- | --- | --- |
| `pnpm --filter platejs test:partition:markdown` | 275 passed | [Log](artifacts/markdown-regression-fixes/pr-rebased-markdown.log) |
| `pnpm --filter platejs test:partition:standard-list` | 49 passed | [Log](artifacts/markdown-regression-fixes/pr-rebased-list.log) |
| `pnpm exec bun test ./packages/platejs/src/markdown/lib/commonmarkSurface.slow.ts` | 28 passed | [Log](artifacts/markdown-regression-fixes/pr-rebased-slow.log) |
| `pnpm --filter platejs typecheck:partition:markdown` | Passed | [Log](artifacts/markdown-regression-fixes/pr-rebased-types.log) |
| `pnpm --filter www build:registry --check` | Fresh generation | [Log](artifacts/markdown-regression-fixes/pr-rebased-registry-check.log) |
| Registry source check | Passed | [Log](artifacts/markdown-regression-fixes/pr-rebased-source.log) |
| Scoped `ultracite check` and `oxlint --type-aware` | Passed | [Lint](artifacts/markdown-regression-fixes/pr-lint-check.log), [type-aware lint](artifacts/markdown-regression-fixes/pr-lint-types.log) |
| Saved browser downloads parsed with the current converter | 4 passed | [Log](artifacts/markdown-regression-fixes/pr-rebased-downloads.log) |

The saved-download check validates the recorded files against the final parser. It does not repeat browser export. Full `pnpm check`, production builds and the browser engine matrix were not run.

## Scope

Repair four reproduced Markdown conversion regressions and verify the affected import and export paths. HTML and DOCX conversion work is outside this patch.

Original base: 002891202b86757fdadedf11bb5b72dcb266b63d. The delivery branch is synchronized with `next` at c70bacbd4a. Branch: codex/markdown-regression.

## Steps

- [x] Reproduce heading export failure and repair phrasing classification. Proof: `artifacts/markdown-regression-fixes/md01-base-red.log` and `packages/platejs/src/markdown/lib/gfmSurface.spec.ts`.
- [x] Reproduce and repair repeated trailing paragraph breaks. Proof: `artifacts/markdown-regression-fixes/md02-base-red.log` and `packages/platejs/src/markdown/lib/deserializer/paragraphBreaks.spec.ts`.
- [x] Reproduce and repair trailing list breaks. Proof: `artifacts/markdown-regression-fixes/md03-base-red.log` and `packages/platejs/src/markdown/lib/serializer/standardList.spec.ts`.
- [x] Reproduce and repair attributed table images. Proof: `artifacts/markdown-regression-fixes/md05-red.log`, `md05-green2.log` and `packages/platejs/src/markdown/lib/table.spec.ts`.
- [x] Run affected checks and browser replay. Proof: `Checks` and `artifacts/markdown-regression-fixes/browser-proof.md`.
- [x] Review the retained code and release note. Proof: `Solution review` and `.changeset/markdown-plite-runtime.md`.
- [x] Refresh the report. Proof: `node .agents/pstack/plan-page.mjs docs/plans/2026-10-08-markdown-regression-fixes.md`.

## Close

Four converter fixes remain, with four added regression tests, one added CRLF case in an existing test and one corrected slow assertion. The staged Markdown diff verifies those counts. The final review removed one redundant classifier and corrected CRLF normalization at the paragraph producer. The four repairs reuse existing conversion rules. Both panel rounds are complete. Final converter, type, lint and registry checks passed after synchronization with the target branch. The package changeset describes the user-visible fixes.
