# Wordgard audit material dossiers

## Clipboard benchmark contract repair

Matrix concept: `WG-VIEW-011`.

Priority: P1 proof-contract repair. The runtime clipboard architecture and
public API stay unchanged.

### Decision

Repair the benchmark caller, not `createBasePlugin`. The current benchmark uses
an obsolete configuration-aware initial codec callback even though current
Plate codecs declare their format from the constructor/extension context.

Measured failure:

```text
TypeError: getOptions is not a function
benchmarks/slate-v2/donor/core/current/clipboard-large-payload.mjs:239
```

`pnpm check:plite` passed typecheck and every Plite-family package-test owner,
then failed its contracts stage on this benchmark. Chromium closure did not
run after the fail-fast contract error.

### Current public shape

The benchmark currently calls the public plugin API like this:

```ts
createBasePlugin({
  codecs: ({ defineCodecs, getOptions }) => {
    const { format } = getOptions();

    return defineCodecs({ [format]: benchmarkCodec });
  },
  key: "benchmarkPlateCodec",
  options: { format: unconfiguredFormat },
}).configure({
  options: { format: benchmarkFormat },
});
```

No current Plate source owner uses `getOptions`; the callback receives
`defineCodecs` but not a runtime `getOptions` function.

### Proposed public shape

No API change. The benchmark should use the supported public call shape and
capture its test format explicitly:

```ts
import { createBasePlugin } from "@platejs/core";
import { ContentSlice } from "@platejs/plite";

const codec = {
  scope: "document" as const,
  decode: ({ data }: { data: string }) =>
    ContentSlice.fromJSON(JSON.parse(data)),
  encode: ({ slice }: { slice: ContentSlice }) => JSON.stringify(slice),
  query: () => true,
};

const createPlateBenchmarkCodecPlugin = (format: string) =>
  createBasePlugin({
    codecs: ({ defineCodecs }) => defineCodecs({ [format]: codec }),
    key: "benchmarkPlateCodec",
  });
```

The exact codec body and counters remain local to the benchmark. Do not add
`getOptions` back to the public authoring context merely to preserve a stale
fixture.

### Current internal shape

- `packages/core/src/lib/plugin/createBasePlugin.ts:930-976` evaluates initial
  codec declarations from the constructor context.
- `packages/core/src/lib/plugin/pluginAuthoringContext.ts:20-55` brands codec
  maps through `defineCodecs`.
- `benchmarks/slate-v2/donor/core/current/clipboard-large-payload.mjs:234-267`
  asks that context for the absent `getOptions`.

The relevant benchmark and runtime invocation are unchanged at local HEAD. A
type-only working-tree diff exists in `createBasePlugin.ts`, but it does not
supply the missing runtime function and is not the failure cause.

### Proposed internal shape

Only the benchmark fixture changes:

1. Pass the MIME format into its plugin factory.
2. Remove the stale options/configure dependency from this fixture.
3. Keep the real Plate codec compilation, query, encode, decode, slice, fit,
   commit, timing, and counter boundaries.

No core plugin, codec compiler, clipboard runtime, document format, or
serialized value changes.

### Material value and proof matrix

Current job improved: restore the strict Plite handoff gate and ensure the
large-payload benchmark measures the live codec API instead of crashing before
measurement.

| Proof kind    | Requirement                                                                                              |
| ------------- | -------------------------------------------------------------------------------------------------------- |
| Correctness   | Focused benchmark contract reaches encode, decode, fit, and commit assertions                            |
| Type/API      | Add or retain a TypeScript/source contract proving the benchmark uses the supported codec callback shape |
| Property/fuzz | N/A: no codec semantics change; existing bounded payload corpus remains                                  |
| Browser       | N/A for fixture repair; strict Chromium closure must subsequently run and pass                           |
| Benchmark     | Fresh finite metrics and required artifact pass the benchmark authority check                            |
| Regression    | `pnpm check:plite` passes all strict stages                                                              |

### Adoption, deletion, and proof impact

- Adoption: one benchmark fixture caller.
- Deletion: remove the stale `getOptions`, `options`, and `.configure(...)`
  path from this benchmark plugin.
- Dependencies: Plate codec authoring context, Plite DOM clipboard/host codecs,
  benchmark runner, and strict proof graph.
- Public API and package behavior: unchanged.

### Route

- Primary planning owner after user acceptance: `plate-plan`, scoped to one
  benchmark/proof repair packet.
- Dependent planning owner: N/A.
- `best-api`: N/A because the correct outcome keeps the public API.
- `plite-plan`: N/A unless the focused benchmark exposes a substrate failure
  after the stale caller is repaired.

### Exit gate

The packet closes when the focused clipboard benchmark passes with fresh
metrics and `pnpm check:plite` completes typecheck, package tests, contracts,
and Chromium closure.

## Mobile input phase proof

Matrix concepts: `WG-VIEW-009`, `WG-VIEW-010B`, `WG-PROOF-004`.

Priority: P2 proof/workflow packet. This is not permission to change editor
behavior.

### Decision

Keep Plite's selective event ownership. Repair the raw-device proof entrypoint,
then prove iOS and Android event phases on actual device or emulator lanes.
Change runtime code only if a captured trace violates the existing exactly-once
command contract.

Wordgard's blanket mobile keydown bypass is not the target architecture.
`../wordgard/src/editor/input.ts:711-713` skips all iOS/Android `Backspace` and
`Enter` keydown handling. That is a useful pressure case, but copying it would
also bypass custom bindings without proving which later native phase owns the
semantic edit.

### Current public shape

- `Editable` exposes ordinary DOM strategy and `onDOMBeforeInput` context.
- `Editable` deliberately has no public `onCommand` surface; extensions own
  model transforms.
- There are no platform-specific `mobile`, `android`, `ios`, `preferKeydown`,
  or `preferBeforeInput` flags.

Exact owners:

- `packages/plite-react/test/surface-contract.tsx:85-159`
- `packages/plite-react/test/surface-contract.tsx:482-505`

Current public use:

```tsx
import { Editable } from "@platejs/plite-react";

<Editable
  onDOMBeforeInput={(event, context) => {
    context.editor.update(() => {});
    event.preventDefault();
    return true;
  }}
/>;
```

### Proposed public shape

The proposed public use is identical to the current use above. No public API
change.

Do not add device flags, mobile key maps, public command interception, or a
second input policy surface. If the raw trace exposes a real product policy
choice, route the proposed call shape through `best-api` before adoption.

### Current internal shape

- `packages/plite-react/src/editable/editing-kernel.ts:82-183` assigns each
  command to explicit browser event families and model/native ownership.
- `packages/plite-react/src/editable/input-router.ts:1-240` reconciles
  `beforeinput` and `input` while retaining captured selection and repair
  targets.
- `packages/browser/src/playwright/native-event-trace.ts:290-433` captures and
  diagnoses native event chains.
- `packages/browser/src/core/release-proof.ts:85-146` distinguishes direct
  device artifacts from semantic or proxy evidence.

The raw proof plumbing is not currently runnable from this checkout:

- Root `package.json` has no `test:mobile-device-proof` or
  `test:mobile-device-proof:raw` script.
- `bun tooling/plite/donor/proof/mobile-device-proof.mjs` fails because line 22
  resolves `tooling/plite/packages/browser/src/core/release-proof.ts`, which
  does not exist.
- No raw artifact was supplied, so no Android/iOS behavior claim is made.

### Proposed internal shape

One device-lab proof owner should:

1. Restore one root-owned raw proof command and point it at
   `packages/browser/src/core/release-proof.ts`.
2. Drive the Plite rich-text route through real Android Chrome and iOS Safari
   device/emulator sessions.
3. Capture `keydown`, `beforeinput`, `input`, composition, selection, DOM delta,
   target ranges, and command/commit trace for every case.
4. Assert exactly one semantic command/commit or one deliberate native edit,
   followed by coherent model value, DOM value, and selection.
5. Emit a validated release-proof artifact. Viewport, synthetic event, CDP,
   agent-browser proxy, and direct-text Appium rows do not satisfy this gate.

Required cases:

- iOS swipe/autocapitalization text insertion;
- Android virtual `Enter`;
- Android virtual `Backspace`;
- custom `Enter` and `Backspace` extension bindings;
- composition confirmation where `Enter` is not an editor command;
- marked text, empty block, inline void, and selection replacement;
- follow-up type, undo, and redo after each phase path.

### Material value and proof matrix

Current job improved: honest release confidence for native mobile input without
adding platform policy to the public editor API.

| Proof kind        | Requirement                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Correctness       | Real-device event/selection/DOM/commit traces pass every required case exactly once                                       |
| Type/API          | Existing `Editable` surface contract still proves no public command or mobile flag is added                               |
| Property/fuzz     | Keep current generated mixed-editing coverage; add device fuzz only if a failing trace produces a stable raw input driver |
| Browser           | Retain Chromium/Firefox/WebKit and mobile-viewport rows; add real Android Chrome and iOS Safari artifacts                 |
| Benchmark         | N/A for proof-only repair; require a targeted latency benchmark before accepting any runtime strategy change              |
| Failure isolation | Missing, proxy, synthetic, or malformed artifacts fail closed and cannot satisfy raw-device claims                        |

### Adoption, deletion, and proof impact

- Adoption: proof runner, device descriptors, trace artifact, and assertions
  only.
- Deletion: none before a failing trace. If a trace proves duplicate ownership,
  delete the losing platform special case instead of stacking another bypass.
- Public docs: keep raw mobile behavior unclaimed until the artifact passes.
- Tests: retain current package/browser rows; the raw lane adds evidence they
  cannot provide.
- Dependencies: `@platejs/plite-react`, `@platejs/browser`, a real
  Appium/device lane, Android Chrome, and iOS Safari.

### Route

- Primary planning owner after user acceptance: `plite-plan`, scoped to the
  Plite browser proof/workflow packet and its fail-closed artifact contract.
- Execution owner selected by that plan: Plite browser proof/workflow.
- Conditional implementation owner: `plite-plan` may add a runtime packet only
  if the trace exposes an architecture or behavior gap.
- `best-api`: N/A unless a public call shape is proposed.
- Dependent planning owner: N/A initially. Route a separate `plate-plan` only
  if a failing trace is caused by Plate shortcut/plugin policy rather than
  Plite input ownership.

### Exit gate

This packet closes only when the proof command is runnable and the required raw
Android/iOS artifacts pass. Until then, the correct status is `proof-needed`,
not “mobile input proven.”
