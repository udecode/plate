# Shard 001: Reduction Source Scan

Scope:
Find source-backed patterns for reducing or classifying generated editor stress
failures after Slate v2 desktop stress/replay transport is green.

Sources sampled:
- Existing Slate v2 fuzzing research artifact for dedupe.
- Slate v2 generated stress artifact/failure path, scenario reducer, and
  scenario contracts.
- Lexical playground test recorder.
- CodeMirror view random draw/decorations tests.
- WPT editing fixture table.

Top leads:
- `replay-reduction:failed-artifact-candidates`: keep reducer metadata on
  failed stress artifacts, not only successful scenario results.
- `replay-reduction:candidate-command`: make candidates directly executable by
  label and keep reduced replay traces separate from full replay traces.

Rejected leads:
- DOM-mutation import stress is already promoted elsewhere.
- Lexical recorder is already covered by Slate's replay/selection artifact
  model.
- CodeMirror random tests support invariant pressure but do not add reducer
  transport.
- WPT fixture tables are useful corpus pressure, not replay reduction.

Next query:
None for this shard. Close as promoted-kept unless a future failing stress row
shows the reduction candidates need automatic minimization beyond labeled
candidate replay.
