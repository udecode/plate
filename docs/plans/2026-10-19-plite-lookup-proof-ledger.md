# Keep each page read until the page or the editor changes it

Status: landed, the frozen benchmark rerun waits in t_b445720d
Page: https://claude.ai/artifact/4CLo1Vjci8M1Eu6j3cNQ4U
Playbook: bug-fix

## Brief

### What will change?

The public DOM lookups still refuse old page text, but they keep each page read until the page or the editor changes it. After one select-all reads the page, the next one after a keystroke rereads only that paragraph. They also refuse editable text no string owns, and a text host with no editor root above it.

### What could go wrong?

A kept read could vouch for a page that changed with no record. In tests, every lookup also reads the page fresh and fails on any difference. The new observer adds work to every page change. No benchmark ran on a quiet host, so the speed gain is unmeasured until t_b445720d reruns them.

## Teach

The lookups from the plan before this one read the page on every call. That is correct, but a select-all over ten thousand paragraphs reads ten thousand hosts each time, about twelve times the old cost.

Most of that page did not change. So each read is kept: this text, in these hosts, read equal to the editor. A mutation observer that never pauses reports every page change, and a lookup collects those reports before it trusts a kept read. A new editor text is a new object, so its old read no longer matches. A flow repaint that only moves bounds changes the record fields the read saved.

Only a page read creates a kept read. When a kept read is missing or doubtful, the lookup reads the page as before, so the first select-all after mount still reads every host. A test mode runs both answers on every lookup and fails on any difference.

## Main changes

- New `packages/plitejs/src/dom/plugin/dom-text-proofs.ts` keeps one ledger per mounted root, created on the first checked lookup and disposed with the root runtime or when the root element changes. Its own `MutationObserver` watches text, children and the attributes the readers read, never pauses, and is drained with `takeRecords()` at every checked lookup and in its own callback.
- A record inside a text host drops the reads of every text host above its target, so text that changes in a nested editor or an inner wrapper drops the outer host's read. A record that changes `data-editor`, or a batch of more than 2,000 records, drops every kept read. An element that gains or loses `data-editor-node` or `data-editor-text-flow-host` drops its own read and, like an added or removed host, the next host's link or every link. So a flow host that marks itself after mount, as every new paragraph does, costs one reread, not all of them. Records count even when their target has since left the page or moved under a nested editor. An element removed with text hosts in it drops their reads and every page-order link, and an element added with text hosts in it, a text host nested inside another included, drops the reads of the hosts inside it and the link of the next host after it. `data-editor-path` is not watched, because it changes on every block below an Enter, so the ledger keeps no read that a path id names.
- A text's kept read is keyed by the immutable model `Text` object. It holds the host and key it was read for, every host the runtime maps to that key, the members of the runtime's element set for the key, the revision of each of those hosts and members, and each flow host's record shape. A member that was off the page or in another root when the text was read still drops the read when it enters this root. A host's kept read holds the text ids it shows in page order and a link to the previous text host.
- `captureDOMTextFlowShape` and `isDOMTextFlowShapeCurrent` in `dom-text-flow-index.ts` save and compare the values the flow readers slice page text by: each record's segment count and shift, and each segment's bounds, length, string element and text node. They compare values, not record objects, because the flow builds new records for every paragraph below an Enter. They replace the planned flow revision, because `editable-text-flow.tsx` writes bounds through its own mutable record types, which a read-only index type cannot stop.
- An expanded range walks the model texts from the first text of its start's first host to the last text of its end's last host, the same interval the fresh reader checks. Each text needs a kept read that still holds, or a fresh read of it that grants one, and its hosts must follow the previous text's hosts in page order. Each host's kept read, flow shape included, is checked once per lookup, and a fresh host read bumps that host's revision, so a text's kept read inside the walk needs no shape check of its own. The first text with no mapped host takes the range's first host. A text drawn by one host is checked against that host's read instead of reading the page again. The runtime maps a text to its host only once a lookup touches it, so a text with no mapped host takes the previous text's host while that host has texts left, or else the next text host on the page, when that host's read lists the text's key. A text with no host found either way passes when coverage hides it. Any doubt falls back to the fresh reader, so the ledger can only answer yes sooner.
- `dom-editor.ts` maps a point offset only into the strings of the point's own text host, never into a text host nested inside it. A plain text host that draws another text host of the same root reads as stale, so the checked lookups return `null` for it, because a range between its own strings would include the nested text.
- A plain text host that holds editable text outside its own strings reads as stale, like a flow host with text no segment owns. Text inside a `contenteditable="false"` island or a placeholder in the host does not count. A range also reads as stale when editable text sits between two consecutive text hosts it spans (`drawsTextBetween`). The fresh reader checks each gap, and each kept page-order link holds only when its gap had none. A record that adds or changes text outside every host resets the link of the next host, and removed text resets every link.
- A text host with no editor root above it, such as one behind a shadow root or under a root that lost `data-editor`, reads as stale, so both lookups return `null` for it. Before, the point check passed it and the range check was skipped.
- The saved flow shape also holds each record's key, because a host's kept read lists the keys its records named.
- `test/react/vitest-setup.ts` turns on an audit, through `auditDOMTextProofs` from `src/dom/internal`, that runs the fresh reader beside every checked lookup, throws when the answers differ, and counts point and range answers that came from kept reads separately. `PLITE_PROOF_AUDIT=off` turns it off, as the benchmark config does.
- Benchmark harness: the planted arm doubles each timed call by waiting out that call's own duration, because a second call would now hit a kept read. New extra lines time the first select-all after mount, select-all after a block insert near the top of 10k blocks, typing, and a 1,000-block insert, all with the ledger running.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| When proofs start | On the first checked lookup in a root, so editors that never call the public lookups pay nothing | Prove the whole root at mount | eager proofs | small |
| What revokes a proof | The ledger's own observer, which never pauses, plus model node identity and saved flow record fields | Keep the integrity observer connected through React commits and share its records, which changes its repair rules | shared observer | small |
| Coverage | Read on every call, as today | Cache it and revoke on coverage changes | coverage cache | small |
| Cold reads | The first read after mount or after a change that drops every kept read has no budget against base; it must cost at most 1.25 times the read-every-host design | Freeze a cold budget against base, which only text written into the page at render time could meet | cold budget | big |

## Steps

- [ ] Repair the planted arm in `lookup.bench.test.tsx` and confirm on the current tree that it still rejects every frozen line.
- [x] `DOMTextProofs` with its observer, host links, revocation rules and flow shapes, wired into `dom-editor.ts`, with the audit mode.
- [x] Contract cases that read twice, check the second answer came from a kept read, change the page the way a React commit does, and expect `null`, with records taken at the next lookup and in the observer callback: text the editor never applied, blocks reordered on the page, a host added between two read hosts, an element between them becoming a host, a wrapper inside a host becoming a host, a nested editor changing text the outer flow reads, and flow bounds moved with no page write. Plus a paragraph move the page has not painted. All earlier cases stay green with the audit on.
- [ ] React suite and the 17 Chromium example specs with the audit on, each reporting a non-zero count of answers from kept reads.
- [ ] Rerun the frozen protocols from the run directory's `bench` folder: `node .agents/rules/benchmark/scripts/paired-timing.mjs config-tight.json`, `config-edit.json` and `config-gesture.json`, each with a new measurements file, and the extra lines.

## Verification

- The contract file, the react suite and the Chromium specs pass with the audit on, and each run reports answers from kept reads.
- Every frozen line passes, the cold lines stay under their ceiling, or the plan pivots again.

## Close

Reversal first. Diff round 3 reversed round 2's dismissal of a root that loses `data-editor`: Sol showed a kept lookup still answered there, and Astra reached the same pass with a text host behind a shadow root. A text host with no editor root above it now reads as stale.

What landed: the checked lookups keep each page read in a per-root ledger until a record or a new editor text drops it, and a test audit runs the fresh reader beside every checked lookup. Round 3 also made the lookups refuse editable text that no string owns, inside a plain host or between two hosts a range spans, and added each flow record's key to the saved flow shape.

Proof: the contract file passes 63 of 63 with the audit on, and each round-3 rule, reverted alone, fails its own case. The 17 Chromium example specs pass 377 with 6 skipped, the same counts as round 1. The react suite passed 1,610 of 1,612. The kernel authority case fails the same way at base. The 1,001-block selection case hit its 5 s timeout under parallel load at 5.8 s and passes alone at 1.8 to 2.4 s, against base's 1.0 to 1.8 s with the audit running both readers. The IME decoration file passes 3 of 3 on the tree and on base.

Limits: no frozen benchmark line was measured on a quiet host, so the budgets are unproven, not missed. The planted arm cannot fail the gesture line, so Steps 1, 4 and 5 stay open and move to the tasks below. The browser build runs no audit, so the Chromium run proves outcomes, not kept-read counts.

## Open work

- The open work of `2026-10-19-plite-owed-text-paint.md` carries over unchanged.
- The frozen tight, gesture, edit and cold protocols ran only on a loaded host, so each line is logged inconclusive. Suggested task `t_b445720d` reruns them on a quiet host from the landed commit and first fixes the planted gesture arm and the base arm's React Compiler paths. owner: zbeyens. stop: that task lands or is dropped. A conclusive miss there is a pivot finding for this design.
- Plate's table navigation and the registry's lint and discussion popovers still call the checked range lookup, which now returns `null` while text lags. Suggested task `t_bd61f59e` decides each caller. owner: zbeyens. stop: that task lands or is dropped.
- No contract case removes the rule that counts a record whose target has left the page, because jsdom 20 delivers no record for a write inside a removed subtree. owner: zbeyens. stop: a jsdom with transient observer registrations, or a browser contract, runs that sequence.
