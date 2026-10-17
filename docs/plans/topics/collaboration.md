# Collaboration binding, transport and presence

The app owns the `Y.Doc`, initial-load readiness, awareness and the provider. One native Yjs binding consumes accepted commits and imports remote changes canonically, and its inferred `api.yjs` exposes presence and compaction methods only when their inputs are supplied. Plate composes that binding with no store of its own, and there is no `read.yjs` or `tx.yjs`. The 2026-10-04 audit found the 2026-09-14 lifetime target live and stopped ([triage audit](../2026-10-04-ledger-triage-audit.md), [lifetime plan](../2026-09-14-collaboration-lifetimes.md)). `node tooling/scripts/review-ledger.mjs show collaboration` prints the full history.

## Layer and owner

```text
app-owned provider → document + explicit readiness + awareness
native Yjs binding ↔ accepted commits / canonical remote imports
mounted editor view → mapped cursor reads → copied Plate presentation
```

| Responsibility | Decision |
| --- | --- |
| Document truth | Accepted canonical changes; a discarded spec or aborted update publishes none of its effects. |
| Remote import | Keeps schema admission, named roots, selection mapping, history policy and shared authored effects; pre-sync room content is never replaced by a placeholder. |
| Transport | The app or provider owns connection, errors and teardown; the editor has no transport commands. |
| Presence | Transient and view-specific; automatic selection publication stays commit-owned. |
| Plate configuration | `YjsPlugin.create(options)` builds the complete descriptor; copied UI derives `CollaborationPlugin` once with `YjsPlugin.require('awareness').map(stage)`. The native owner is the only source of option-dependent document, presence, compaction and cursor-data capabilities. |
| Cursors | Plite owns mapping and neutral reads, Plate supplies unstyled selection decorations, and the copied overlay owns appearance. |
| Custom adapters | `YjsUpdatePolicy` stays for the documented custom-adapter job. |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| Live `tx.yjs` transport calls | Fired provider, awareness and pause effects even when the transaction was discarded or aborted. |
| Plate's nullable `YjsPluginState` copy of the options | A second configuration owner with no reconfiguration job. |
| A neutral Hocuspocus helper | No job the app-owned provider lacks. |
| A generic collaboration session service | Would duplicate the provider and the private binding owner. |
| Awareness merged into document content | Presence has its own expiry and undo semantics. |
| All collaboration inside Plate | Raw Plite examples need neutral synchronization and cursor reads. |
| Generic commit or snapshot broadcast instead of Yjs | Local changes alone give no concurrent or offline convergence or durable relative identity. |

## What other editors do

Not compared in this scope's reviews beyond Yjs itself; the `yjs-collaboration` pages under `docs/research/sources/` hold the provider and binding prior art.

## Main changes

- Transport commands and Plate's duplicate Yjs store are gone; the binding takes its configuration once at construction.

## Open work

- Manual soaks and broader checkout failures recorded by the lifetime plan stay unrun. owner: the next collaboration review. stop: a soak run on the current tree.
