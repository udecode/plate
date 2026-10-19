# External text engines

One canonical Text is edited through a foreign input engine, such as CodeMirror, while shared document changes, directed selection, history, authored intent, view permissions and independent view lifetimes hold. Canonical feedback is synchronous and ordered at CodeMirror's `dispatchTransactions` boundary, and `ExternalTextRuntime` delivery stays monotonic when a callback fails. The public slot and the narrow versioned protocol are unchanged. The 2026-10-04 audit found this landed and stopped ([triage audit](../2026-10-04-ledger-triage-audit.md), [ordered-feedback plan](../2026-09-15-external-text-ordered-feedback.md)). `node tooling/scripts/review-ledger.mjs show external-text` prints the full history.

## Layer and owner

```tsx
// the copied code-block renderer
import { createCodeMirrorAdapter } from 'platejs/code-block/codemirror';

const adapter = createCodeMirrorAdapter();

props.slots.externalText({
  adapter,
  ariaLabel: 'Code block',
  config: { language: props.element.language },
});
```

| Responsibility | Decision |
| --- | --- |
| Model, schema, history, authored semantics | Plite; the mounted runtime owns focus, read-only state, DOM coverage and retirement. |
| Input DOM, local text, parser, native commands | CodeMirror. Its private text tree is a rendering representation, not a saved document or undo authority. |
| Ordering | The adapter applies the local batch, finishes observer notification, then publishes one composed canonical action. Canonical transactions bypass local filters and apply synchronously; a recursive-dispatch guard runs before nested view mutation, and canonical state wins over a stale outer prediction. |
| Callback failure | `ExternalTextRuntime` keeps a per-view failure revision and one bounded synchronous refresh, so an older delivery never overwrites newer canonical state. Neither owner queues transactions. |
| Protocol | `plitejs/react/external-text`: ten public types and six actions; exactly one Text per element, one projection per mounted element, directed UTF-16 offsets and version checks. |
| Customization | The copied component's `extensions` and `loadLanguage`; no plugin or public editor handle. |
| Packaging | One optional `platejs/code-block/codemirror` subpath; CodeMirror peers are optional at the package root. |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| Queued canonical feedback with rejection resets | Reproduced `agoodd` on screen against canonical `Ragood`; deleted. |
| Listener-only synchronous feedback | Later observers saw the correction before the prediction. |
| A `dispatch` result carrying the canonical reply | A protocol break with no caller; the raw textarea already applies feedback synchronously. |
| A transaction escape, text-session manager, acknowledgement store or adapter subscription layer | Adds authority and lifecycle work the actions and commit fence already cover. |
| Separately saved CodeMirror documents or undo stacks | Duplicate canonical state. |
| Universal native or universal CodeMirror rendering | Drops optional code-engine features or the full-DOM job. |
| Flattening rich children or arbitrary roots into the protocol | Unsafe; the one-Text grammar has its own job. |

## What other editors do

Not compared beyond CodeMirror's own dispatch contract (`@codemirror/view` 6.41.0 returns to idle before update listeners run).

## Main changes

- Queued feedback and `dispatchingToPlite` coordination are gone from the CodeMirror adapter.

## Open work

- Physical IME, assistive technology and keyboard-to-paint latency are outside the claim, and repository-wide browser closure waits on unrelated native selection failures. owner: the next external-text review. stop: a device run.
