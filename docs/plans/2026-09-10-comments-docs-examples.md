# Comments documentation and examples

Status: complete. Local implementation and verification passed.

## Outcome and scope

Make `/docs/comment` teach Comments through four focused examples, followed by
integration details and compact API reference. Preserve the familiar Charlie/Bob
conversations. Keep the mixed Comments/Suggestions example on Discussion.

## Acceptance and proof

| Unit | Required outcome | Evidence |
| --- | --- | --- |
| Core comments | Existing conversations; create, reply, edit, resolve, cancel; minimal feature setup | Passed real `/blocks/comment-demo` interactions |
| Overlaps and history | Both overlapping threads reachable; edits map ranges; deletion retains access; undo/redo restore highlighting | Passed `/blocks/comment-overlap-demo` interactions |
| Local persistence and recovery | Save/reload document and threads together; labeled simulated failure retains draft; retry succeeds once | Passed `/blocks/comment-persistence-demo` interactions |
| Read-only and static | Document rejects edits; comments remain readable; static output paints matching ranges | Passed `/blocks/comment-review-demo` interactions |
| Documentation | Preview, minimal setup, distinct examples, integration, API; composition linked to Discussion | Passed `/docs/comment` desktop and 390px layout, independent examples, and import-recipe link |
| Registry and types | Registered examples and complete imports; generated registry/changelog and source/type checks | Passed full www typecheck, registry build/source check, lint, changelog check and final docs check |

## Source obligations

- [Task workflow](../../.agents/skills/task/references/workflow.md): current
  checkout, source proof, no publication authority. Branch verified `next`.
- [Plate Docs](../../.agents/skills/plate-docs/SKILL.md) and its plugin, MDX,
  page-shape and API-example references: latest-state prose, preserve contracts,
  smallest setup, real preview proof, source build and docs parity.
- [Technical Writing](../../.agents/skills/technical-writing/SKILL.md): preserve
  factual content, code and meaningful fixtures through the rewrite.
- [Plate UI](../../.agents/skills/plate-ui/SKILL.md): reuse copied components,
  explicit feature configuration, public imports and registry generation.
- [Registry Changelog](../../.agents/skills/registry-changelog/SKILL.md): source
  MDX entry, generated JSON and check. No package changeset for example-only work.
- [Verify Plate](../../.agents/skills/verify-plate/SKILL.md): serving source identity,
  actual Browser controls, native input, final routes and retained screenshots.
- Poteto feature method: own the coupled examples locally; check fixture/setup
  before continuing, then docs and final interaction proof. No additional agent
  or review invocation is necessary; Autoreview does not run on `next`.

## Decisions

- Use existing Comments API and copied Discussion UI; no package API change.
- Save/reload stays in memory and is labeled as such. Simulated submission
  failure demonstrates the existing composer's retry behavior.
- Read-only describes document editing, not application authorization.
- Keep all proof and completion states in this plan; artifacts live in
  `artifacts/comments-docs-examples/`.

## Preflight checkpoint

- Four examples are drafted. A focused source-first TypeScript program covering
  all four examples, shared fixtures and the docs setup fence passes. The setup
  uses `EditorValueInput<Value>`; the public input type requires its value type.
- Fixture proof confirms both excerpt ranges and all four familiar messages.
- Overlap fixture proof confirms both IDs at the shared word, expansion on
  insertion, undo/redo, collapsed ranges after full-text deletion and restoration.
- Focused formatting/lint passes for the five example/fixture files.
- Prose audit has no findings. Intentional preservation changes are the four
  focused previews, smaller kit setup, static install commands, and moving the
  complete import recipe to the existing Editor document-migration section.
  Boundary behavior replaces the internal `nearest` implementation term.
- Temporary proof receipts and pending sources are under
  `/tmp/comments-docs-20260910/`. Browser proof remains pending.
- The independent `pull` task requested a temporary source/generator freeze for
  its conditional publication. Its owner preserved the three new example files
  outside the compile graph and will restore them before releasing the window.
  Remaining drafts are outside the checkout. This task has no publication grant.
- Doctor reports stale managed app/browser artifacts. Final verification will
  use a fresh source-backed dev server; no managed-build freshness claim is made.

## Final evidence

- [Browser receipts](artifacts/comments-docs-examples/browser-proof.json) bind
  each example and the combined page to observed actions and outcomes.
- [Source identity](artifacts/comments-docs-examples/source-identity.json)
  records the ten authored source files and the source-backed server on 3296.
- Full www typecheck passed, including docs source parity and registry source
  checks. Registry generation produced 371 canonical payloads and 15 overlays.
  Changelog consistency, focused lint and the final docs check passed.
- The page preserves all 20 API table entries and the complete import recipe,
  linked under Editor document migrations. Preview heights keep short examples
  compact and expose retry/static content at 390px.
- Screenshots were inspected for conversations, overlaps, failed-send recovery
  and desktop/narrow docs. Raw browser screenshot capture avoided scaling in
  the in-app screenshot wrapper. This is desktop browser and responsive-layout
  proof, not physical mobile-device proof.
- A concurrent registry regeneration invalidated the initial core attempt by
  refreshing the page. The complete scenario was rerun after generation settled.
- The preview server is intentionally retained for local review. Temporary
  viewport overrides were reset. No package API changes, commit, push, or PR
  were performed by this task; another task published the earlier planning file.
