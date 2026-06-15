# Generated Stress Replay Reduction

Question:
How should Slate v2 reduce, classify, and replay generated editor stress
failures after desktop stress and project-specific replay commands are green?

Scope:
- Source-backed testing/oracle patterns for replay reduction, minimization,
  failure triage, seed/shard identity, and generated editor/browser stress.
- Prefer local source reads from cloned OSS/editor/browser-test repos.
- Convert only a source-backed invariant into a Slate-native test, helper,
  docs packet, or no-code decision.

Explicit exclusions:
- No pagination work.
- No runtime patch from snippets, issue titles, or README claims.
- No TinyMCE or CKEditor code-path evidence in durable ledgers.
- No duplicate DOM-mutation import stress lead; that is owned by
  `docs/slate-v2/research/2026-06-13-editor-property-fuzzing-oracles/`.

Current Verdict:
Promoted-kept. Slate already owned reduction candidate generation, but failed
stress artifacts did not include candidates because the generated stress test
only passed `result.reductionCandidates` after a successful run. The kept
packet moves candidate summarization into stress artifact creation so running,
failed, and passed artifacts all expose reduction metadata.

Stop Rule:
Stop this research packet after one replay-reduction lead is promoted with
owner, proof kind, and verification command, or after sampled leads are rejected
as duplicates/not applicable with reopen conditions.

Local Evidence Gap:
Slate v2 now emits replayable generated stress artifacts across Chromium,
Firefox, and WebKit, and each artifact carries a project-specific replay
command. The remaining gap is failure economics: if a generated scenario fails,
the artifact should help future agents reduce the reproducer or classify the
failure without replaying a large action sequence by hand.

Promoted Lead:
- `replay-reduction:failed-artifact-candidates`
- owner: `slate-browser` / generated stress
- proof kind: stress artifact contract plus focused generated stress artifact
  audit
- verification commands:
  `bun --filter slate-browser build && bun --filter slate-browser test:core -- scenario.test.ts`
  `bun -e "import { createStressArtifact } from './playwright/stress/stress-utils.ts'; ..."`
  `STRESS_ROUTES=richtext STRESS_FAMILIES=paste-normalize-undo PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/stress/generated-editing.test.ts --project=firefox --grep "richtext paste-normalize-undo"`

Follow-up Promoted Lead:
- `replay-reduction:candidate-command`
- owner: `slate-browser` / generated stress replay
- proof kind: reduced replay command and separate reduced trace artifact
- verification commands:
  `bun --filter slate-browser build && bun --filter slate-browser test:core -- scenario.test.ts`
  `bun -e "import { artifactStepsToScenarioSteps, createStressArtifact } from './playwright/stress/stress-utils.ts'; ..."`
  `STRESS_REPLAY=<artifact> STRESS_REDUCTION=prefix:12 bun test:stress:replay:firefox`

Supporting Source Notes:
- Lexical's recorder supports replayable browser steps plus HTML/selection
  snapshots, but not automatic shrinking.
- CodeMirror has random view/decorations invariant tests, but sampled rows do
  not emit replay/shrink artifacts.
- WPT editing data is fixture-table evidence, not reducer machinery.
