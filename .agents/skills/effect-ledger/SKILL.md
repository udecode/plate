---
description: Check that the effect ledger, the internal judge of native sync, never calls a merge held when it lost work, over every merge the real rebase writes for short command lists on small documents and the intake's queue cases. Eleven planted mutations must read lost, an intent oracle written apart from the ledger must agree, held verdicts must compose, and every merge must reopen as a valid document through createEditor. Use before and after changing packages/plitejs/src/core/change/effect-ledger.ts, the rebase or another file in its coverage record, when the effect-ledger step of pnpm check fails, or when fixing a broken merge the native sync plan's M0.6 names.
argument-hint: '[check | all [shard] | record | case <identity> | update]'
name: effect-ledger
metadata:
  skiller:
    source: .agents/rules/effect-ledger.mdc
---

# Effect ledger

Handle $ARGUMENTS. `check`, or no argument, runs the fast lane. `all <shard>` runs `--all --world=<shard>`, one shard of the full lane, and `all` alone lists the shards to run one at a time. `record` runs `--record-baseline` in each lane whose classes or pins a fix lowered. `case <identity>` runs `--case=<identity>` to print one merge. `update` brings the verification in line with changed code, as Coverage record says.

**The property.** Take a base document and two command lists, one the accepted side's and one the own side's, each run alone from the base. Rebase the own side's changes over the accepted side's with the real rebase. The ledger reads only the changes, never the rebase, and calls the merge `held`, `contested` or `lost`. It never calls a merge held or contested when the oracle, which knows what each command meant, calls it lossy, and it calls every merge a planted break damaged lost. Held verdicts compose: held over a front of the accepted changes and held over the rest means nothing the oracle can see was lost over all of them, under the three limits What it checks names. Every merge the rebase writes reopens as the same document through `createEditor` with the world's schema.

**The harm.** Native sync settles a batch the ledger holds and keeps a batch it calls lost for the owner to review. A ledger that holds a lossy merge deletes someone's saved work with nothing left to recover it. Native sync can settle offline work only when a judge that never calls the rebase reads the result. Panel rounds 1 to 3 of `docs/plans/2026-11-06-native-sync.md` found silent losses that tags at six return sites missed, such as a bold lost under a teammate's italic, a letter typed into an empty paragraph landing outside the quote its paragraph moved into, and two equal paragraph inserts absorbed into one.

## What it checks

`packages/plitejs/scripts/effect-ledger.ts` runs the real rebase and the real ledger exhaustively up to a bound. It checks the TypeScript code itself, not a model of it, because no verifier runs on this code. `effect-ledger-worlds.ts` holds the worlds and queue cases, `effect-ledger-oracle.ts` the intent oracle and `effect-ledger-mutants.ts` the eleven mutations.

1. **Worlds.** Each world is a closed schema and a set of documents. It starts from the `yjs-peer-order` worlds in Plain intent, and adds a named root, overlapping marks, empty paragraphs, a link and a record set:
   - `blocks`: `hp`, `joined`, `pp`, `ppp`, `sets`, `split`.
   - `caption`: `shared`, two media blocks sharing a content root.
   - `empties`: `empties`, three empty keyed paragraphs, and `mixed`.
   - `inline`: `contest`, `link`, `quote`, `quotes`, two quotes of one paragraph each, `split-link`, `split-quote`.
   - `marks`: `marked` and `overlap`, the paragraph `abcde`.
   - `named`: `named`, a media block that owns the root `cap:1`, then a paragraph.
   - `quoted`: `quoted`, whose world offers the ordinary commands and also `move j into i` and `clear i`, as in `yjs-peer-order`.
   - `records`: `records`, a paragraph and the record set `notes`.
   - `spares`: `plain`, a quote of two paragraphs and a paragraph, all with generated ids.
2. **Commands.** Each side's commands come from the document it sees at that moment, the `yjs-peer-order` list with `bold` and `italic` spans and `replace i`, which types over the middle of a line, in `marks`, `move-wrap` in `empties` and `put` and `drop` in `records`. Typed letters are unique per side and per command, so a letter names who wrote it. A command counts only when a solo editor runs it, it changes the document and the document it leaves reopens through `createEditor`. The check skips a side that no editor can reopen alone. Run it says which lists each lane pairs.
3. **Queue cases.** `queueCases()` reproduces the intake's generator: its six documents, its seed, its draw per command and its order, up to three commands a side and 40 samples per length pair. It gives the intake's 2,088 cases. Only the typed letter differs from the intake's probe, so each stays unique.
4. **Candidates.** Each case rebases twice, once with `transformInternalDocumentChange(over, own, value, { keepEqualEdits: true })` and once with `DocumentChange.transform(own, over, value)`. The check calls them, and the ledger never does. Equal chains from the two count as one merge with two leaves.
5. **Ledger.** `createEffectLedger(base)` folds each side's changes and the merged chain into token streams whose tokens keep where they came from. It reads only each change's sections, records and root lifecycle. `judge` compares three ways: a fact one side changed takes that side's value, and a fact both changed apart is a race. The facts are presence, marks, block properties, nesting, the inline elements around a letter, parent, pairwise order and whether two letters or blocks share a block or a parent, per letter and per block, plus records and roots. A property compares as a set of members only where the schema declares it a set at that place, through `getCompiledPropertyMergeStrategy`; every other array compares in order. Where a block moves between places and one document reads the property as a set and another as a whole value, both judges read the arrays as members, so equal values read equal. A base letter that both sides keep in the same base container stays in it. The base's records come from `getValueRecords`, so a value that does not show them in its JSON still has them. An edit to a block or a letter the other side deleted, a property write, a move or a mark, is an effect the merge has to keep, so the merge that drops it with the deletion is lost. A letter's block and place belong to its block, which answers for them while it stays. Each born letter and block keeps its neighbors and siblings, with stated exceptions where the other side parted them, moved them or turned them around, and two blocks one side wrote keep their order. A born letter keeps its inline elements and every mark its side gave it, and gains a mark only by following the other side's change to the base letters around it. A born block keeps its properties. A letter whose neighbors are gone stays in its block, or past the other side's split on a half of that block, and a letter alone in its block stays in it, unless the other side joined that block into the one it lands in. A letter alone in a line its side split away from the base letters of its block stays apart from them. A born letter follows the nearest base letters around it that the other side kept, past the ones it deleted. The empty half of a split at a line's start is a line too. `contested` means each side deleted a letter the other deleted and wrote letters there, as in `foxdog`. `lost` wins over `contested`, and each names what it read.
6. **Rules.** A leaf records every rule it breaks.
   - `effect-ledger-soundness`: the oracle calls the merge lossy and the ledger says held or contested. The oracle reads whole documents and knows each command's meaning only through the letters and facts each side left. Its rules are separate from the ledger's. It shares the ledger's reading of set-valued properties and records, and uses the ledger's three-way rule for records and roots, so a fault there passes both. Its race row, `lossy conflict`, counts too.
   - `effect-ledger-mutant`: `plantMutants` writes a break into the merged chain's last change and the ledger reads it held or contested. In the fast lane and the whole `--all` lane, a mutant never planted on a held merge also fails, because a mutant that never applied proves nothing.
   - `effect-ledger-law`: the composition law below fails at some cut.
   - `effect-ledger-fixture`: one of `FIXTURES` gets another verdict than the one it names. They hold each round 1 to 3 merge, among them Enter, Backspace and a new paragraph against a typed letter, each held, and a lost merge for each way rounds 1 and 2 of the M0.5 panel found the ledger holding one, each beside a held control where one applies. A fixture marked `open` names a merge the ledger still gets wrong, the plan step that fixes it and each failure it shows today as a signature, such as `verdict held`, `oracle clean`, `law` or `cut 1 held over the front, lost over the rest`. The run counts it open only when it shows exactly those failures. A failure its mark does not name fails the run. So does a named failure it no longer shows, and the fix then removes that signature from the mark, or the whole mark once none is left. An open fixture that never reaches the judgment, such as one that throws or whose command makes no change, fails the run, because it pins no hole. Every run prints each open fixture with its step and signatures. A mark pins only a reading that misses a loss, such as `verdict held` or `oracle clean`. A lost reading's signature leaves out its reasons, so a lost reading with another cause would still match it. Six stay open for M1.2:
     - A split half that holds base letters and follows the source the other side moved, from either side. Each judges a planted copy of that merge, `[c, d, ab]`, so M0.6's fix of the rebase leaves them in force.
     - A born link with no letter that loses its URL or lands in another paragraph, two fixtures.
     - `resume` over a drop of a record put the front already shows.
     - A retype of `cat` to `cart` against a deletion of `cat`, which keeps only the `r`.

     The ledger also reads two right merges as lost, and no fixture pins them. M1.2 fixes both readings: the Defaults placement of the same split half, `[c, ab, d]`, from either side, and `resume` reading accepted's drop as undone where the merge keeps own's concurrent put and the whole reads held.
   - `effect-ledger-plant`: a ledger blind to record effects does not hold a merge that dropped a record put, so the record mutant proves nothing.
   - `effect-ledger-reader`: a fold's tokens or records differ from an encoding of the value the same changes give, so the ledger is reading another document than the one the editor holds.
   - `effect-ledger-invalid`: the rebase or its apply throws, or `createEditor` refuses or rewrites the merged document. The class baseline holds these rows. A case that stays invalid with a command left out of either side counts as `invalid implied` and is not counted, because the shorter form names the broken merge.
   - `effect-ledger-lossy`: the oracle calls the merge lossy, whatever the ledger reads, and the two sides did not race. The class baseline holds these rows at one command a side and for queue cases. Deeper ones run to hundreds of thousands, so each lane pins their count and a digest of their identities, and `--lossy` prints them. The fixture `r2 and r3 empty paragraph moved and wrapped against a letter` files one row too, because the oracle cannot name an unkeyed empty paragraph.
   - `lost, oracle clean` counts a merge the ledger calls lost and the oracle calls clean. A strict ledger produces these, and a false `lost` only keeps a batch for review, but a fix that turns a held merge lost has to show it, so each lane pins their count and digest too. The plan's risk row "the ledger keeps too much" watches it. `held on an ambiguous reading` counts a merge the ledger holds where the oracle found its witness only on one of several readings, and each lane pins it the same way.
   - `effect-ledger-baseline`: a lane's run differs from its record in the class baseline, as Baseline says.
   - `effect-ledger-cpu`: the fast lane used more CPU time than its budget, as Run it says.
7. **Mutations.** Each is planted only where its break is real damage, and each one's count is in the summary. A kind plants once per merge, on the first letter or block that qualifies, except the one whose bullet says it plants twice. The kinds that move a letter plant only on letters the merged chain's last change wrote:
   - `drop a born letter`, `delete a kept letter`, `revert an accepted letter`.
   - `duplicate a block`, which copies only a block that holds letters, because a copy of an empty block can repair a dropped one.
   - `move a born letter across a block boundary`, to a block that holds a letter own keeps elsewhere, once for a letter whose neighbors the merge kept and once for one whose neighbors are all gone.
   - `move a letter born in an empty paragraph into an empty sibling` and `... across an accepted split`, which need keyed paragraphs, so only `empties` reaches them.
   - `move a born letter to another place inside a joined block`.
   - `move a split half into the next container of its type`, such as the tail of a paragraph split in a quote into the next quote.
   - `strip an accepted mark from a letter`.
   - `drop a record put`, only in `records`.
8. **Composition law.** Cut the accepted chain anywhere. `resume` takes the held proof of the merge over the front and reads the rest of the accepted changes against the whole merged chain. If the merge over the front is held and `resume` holds too, the merge over the whole chain is held. The check runs the law on each merge not held, with two or more accepted changes, and files each merge with a cut held over the front and over the rest as `effect-ledger-law`, naming its first such cut, whatever the oracle reads. These kinds of cut break the law today, because one step cannot see what they do, and the class baseline holds their rows:
   - The rest rewrites what the front wrote: it deletes a birth or a block the front moved or set a property on, sets a property again, changes again a letter's marks, block properties or nesting that the front changed, or turns back an order or a join. Own's equal edit shares its effect with the front's, and the rewrite takes the shared effect too.
   - The rest wraps a block the other side moved past a line the front inserted. In `public inline/link | accepted insert 1, wrap 2 | own insert 1, move 2 1`, accepted inserts the line `m` before `d` and wraps `d` in a quote, while own inserts `n` at the same place and moves `d` above it. Own's move of `d` above `n` also passes `m`, and each step reads held. Over the whole chain the ledger reads `m` turned around with the quote that holds `d`, and the oracle reads `m` out of its place too.
   - A side splits a block, or moves a letter between two blocks, and the rest deletes or joins a block. The deleted block held the letters that showed the split, so the whole chain reads a letter that fell on either side of it as having left its neighbors. In `internal marks/overlap | accepted enter 0 mid, remove 0 | own enter 0 start`, accepted splits `abcde` after `a` and deletes `a`, while own presses Enter at the start. The merge is an empty line and `bcde`, which is right. The oracle reads it clean, and each step holds it. Over the whole chain, the ledger reads the line own's Enter made as left empty, with its letters elsewhere.
   A caller that judges cell by cell judges such a span whole instead, as the check does and as M1.7 requires. `resume` also forgets a record put the front already shows, as an open fixture shows, and reads accepted's drop as undone where the merge keeps own's concurrent put.
9. **Baseline.** Fix rounds stopped after round 7 (owner's word, 2026-11-09), so the rows they left are a baseline by class in `packages/plitejs/scripts/effect-ledger-classes.json`. A row's class is its rule and its reason with letters, paths and numbers blanked, so one cause is one class. For each lane the file holds each class's count and shortest case, and the lane's pins: its leaves, its unlisted lossy merges, its `lost, oracle clean` merges and its merges held on an ambiguous reading. The classes cover `effect-ledger-soundness`, `effect-ledger-law` and `effect-ledger-mutant`, the ledger's own failures, which M1.2 empties because it is the first step where the ledger releases saved work, and `effect-ledger-invalid` and `effect-ledger-lossy`, the rebase's, which M0.6 empties. A class of the ledger's own failures also records which rows it holds, as the number of rows for each SHA-1 digest of a row's identity. So the check fails when a fix clears one row and a defect adds another in the same class, and when one identity fails more times than its record holds, as a mutant that plants twice on one merge can. The identity names its rebase, because the two rebases can write different merges for one case. The check files a chain that both rebases write once, under the first name, so a fix that makes them write different merges can move a row to the other rebase's name. M0.6, which makes such fixes, removes the lane's members and records the lane again. The rebase's classes record counts only, because M0.6 changes which merges they hold. A lane fails when a class grows, a new class appears, a class of the ledger's own failures holds a row more times than it recorded, the leaf count moves off its pin, or a pinned count grows or keeps its count with another digest. Every other hard rule fails on any row. A class, a row or a pin that falls passes and prints a note.

## Run it

Run every command from the repository root. The check has two lanes, and both fail on the same rules.

- `pnpm check:effect-ledger` runs the fast lane: the fixtures, the record plant, every list of one command against one on every document, a fixed 1/2^`FAST_SAMPLE` of the lists of two, and the queue. Exit 0 is a pass and exit 1 a failure. `pnpm check effect-ledger` runs the same step through the check runner, and `pnpm check --affected` runs it for a change to the scripts or the class baseline, `packages/plitejs/scripts/check-harness.ts`, `config/plite-source-aliases.ts` or `packages/plitejs/src/`. It covers 813,356 leaves. Its gate is CPU time, because its wall time follows the host's load. Its workers and the process that starts them may use at most 2,400 seconds together, the 10 minutes of the four cores it reserves. Cases go to the workers in turn, so each worker builds the command lists of every document. The sum grows with `--jobs`, and the budget holds for the four workers the step runs. It compares the sum with that budget before rounding, fails past it and prints the sum, rounded, as `cpu`. Each process reads its CPU time before its last steps, such as sending its result or judging the baseline, and the sum leaves out pnpm's own process. In a run under `/usr/bin/time -l`, the printed 1,685 seconds were within half a second of the user and system time `time` measured.
- `pnpm check:effect-ledger --all --world=<shard>` runs one shard of the full lane: every list of up to two commands a side on each document of the shard. A shard is a world, `queue` for the queue cases, or one of the documents in `SPLIT_DOCS`, which run on their own because their world would not fit the hour with them: `blocks/ppp`, `blocks/split`, `inline/split-link` and `inline/split-quote`. A world shard leaves those out. The full lane covers 49,402,332 leaves; each shard's leaves and time are in the table below. `--all` alone runs every shard in one command, which takes hours, so run the shards one at a time.
- `pnpm check:effect-ledger --all --sample <k>` runs the sample lane: every list of one command a side and a fixed 1/2^k of the leaves with two, on every document, picked by a hash of the leaf.
- Each lane keeps its own record in the class baseline, keyed `fast`, `sample <k>` or `all <shard>`. `--record-baseline` writes the lane's record from a run with no other failure. It refuses a run whose class grew or gained a row, so the file only shrinks, and a lane it has not recorded, or recorded before its classes held their rows, is written whole. `sample 5` and the `all` lanes wait for the full-lane task to record them that way. Such a first record trusts its run's counts alone, so a row swapped into a class before that record goes unseen.
- `--jobs=<n>` sets the workers. It defaults to `CHECK_CORES`, which the check runner sets to the step's four cores, and otherwise to `DEFAULT_JOBS`. A run with it is still its lane.
- `--doc=<name>`, `--world=<name>`, `--commands=<n>` and `--no-queue` narrow what runs. `--commands=<n>` pairs every list of up to `n` commands a side. Any flag that changes what runs skips the baseline and the pins and exits 1 on any finding, such as `--world=marks --doc=overlap --commands=1 --no-queue`.
- `--case='<identity or part of one>'` prints each matching merge with its verdict, the oracle's reading and the merged document, passing or failing. Add `--world` and `--doc` to make it quick.
- `--lossy` prints every lossy merge, deeper ones included.
- `--fixtures` runs only the fixtures and the record plant.
- `--plant=records` runs a ledger blind to record effects. It exits 0 when the check catches it, that is when a dropped record put reads other than lost, and 1 when it does not.
- After a fix lowers a class, run the lane with `--record-baseline` so the record follows it down. The flag refuses a flag that narrows a lane.
- The fast lane plants the oracle's teeth on a fixed 1/2^`TEETH_SAMPLE` of the merges the oracle reads clean, and plants a kind in `TEETH_ON_EVERY_LEAF` on every one. A kind planted fewer than `TEETH_FLOOR` times fails it.
- `EFFECT_LEDGER_SAMPLES=<n>` prints up to `n` failures of each hard rule instead of 40. It changes only what prints.

| Shard | Leaves | Time at 16 jobs |
| --- | --- | --- |
| `blocks` | 4,984,708 | 6 min |
| `blocks/ppp` | 7,730,312 | 11 min |
| `blocks/split` | 4,434,242 | 6 min |
| `caption` | 1,870,178 | 4 min |
| `empties` | 5,551,400 | 13 min |
| `inline` | 8,483,332 | 10 min |
| `inline/split-link` | 4,210,802 | 6 min |
| `inline/split-quote` | 3,416,498 | 4 min |
| `marks` | 3,291,264 | 4 min |
| `named` | 478,242 | 1 min |
| `quoted` | 1,591,328 | 2 min |
| `records` | 130,050 | 0 min |
| `spares` | 3,225,800 | 4 min |
| `queue` | 4,176 | 0 min |

Each distinct merge reopens through `createEditor`, which is a large part of the cost, so the number of leaves sets the run time. The ledger itself grows with the square of a replacement: `commonPairs` fills a `Uint16Array` of (a + 1)(b + 1) entries for a replacement that deletes `a` tokens and inserts `b`. One fold of a paragraph replaced whole took 0.5 seconds and 59 MB at 1,000 letters, 4.1 seconds and 207 MB at 4,000, 12.7 seconds and 686 MB at 8,000 and 53 seconds and 2.4 GB at 16,000, measured on this machine. Its counts wrap past 65,535 tokens a side, which memory reaches first.

## Read a failure

A failing run prints each failure as its rule and identity, then what it read:

```text
effect-ledger-lossy internal blocks/pp | accepted retype 1 | own enter 1 mid
  block type of d; nesting of d

effect-ledger-invalid internal marks/overlap | accepted bold 0 first | own italic 0 middle
  it reopens as another document

effect-ledger-soundness internal blocks/pp | accepted enter 0 mid | own retype 0
  the oracle calls it lossy (block type of b; nesting of b) and the ledger held: ...

effect-ledger-mutant internal blocks/pp | accepted type 0 start | own type 0 start
  the ledger reads the mutant "move a born letter across a block boundary" held

effect-ledger-law internal inline/split-link | accepted type 0 end, delete 0 end@0 | own remove 0.1
  held over the first 1 accepted changes and over the rest, but not over all of them (y left the letters it stood beside)
```

The identity names the rebase (`internal` for `transformInternalDocumentChange`, `public` for `DocumentChange.transform`), the world and document, then the accepted side's and the own side's commands. In the first failure, the accepted side turns `cd` into a heading while own presses Enter inside it. Alone, each keeps `d` in a heading. Merged, `c` is a heading and `d` a paragraph. In the second, bold on `ab` against italic on `bcd` writes a bold `a`, an italic `b` and plain `cd` and `e` as two text nodes. The merge lost bold on `b` and italic on `cd`, and the editor joins the two plain nodes when it reopens the document, so the merge never was the document a peer would load.

Run `--case='<identity>' --world=<world> --doc=<doc>`, with `--commands=1` when both sides have one command, to print the verdict, the oracle's reading and the merged document. Then tell these apart before you change code:

- **A broken merge.** The document lost a side's work or does not reopen, and the rule is `effect-ledger-lossy` or `effect-ledger-invalid`. Fix the rebase at its cause or turn the merge into a conflict, then run `--record-baseline`. A baselined class waits for `docs/plans/2026-11-06-native-sync.md` M0.6. A new class or a grown one is a rebase change that broke a merge.
- **A ledger hole.** The rule is `effect-ledger-soundness`, `effect-ledger-mutant` or `effect-ledger-plant`, and the merged document has really lost the work. A ledger that holds it deletes saved work, so fix the ledger. Its class stays in the baseline only until M1.2 empties it, and it never grows. `effect-ledger-reader` is a ledger that reads another document than the editor holds, which `viewOfChange` and the fold own.
- **A modeling error.** The merged document keeps both sides' work and the oracle still calls it lossy, or the mutant's break is not damage, such as a letter moved next to a neighbor the other side split or joined away. Fix the oracle's rule or the mutant's precondition, say why in a comment, and check that the mutant still plants on held merges.
- **A law failure.** The rule is `effect-ledger-law`. The merge reads held at each step and not held over the whole. Read the whole's verdict in the merged document. When the whole is right, a cell-by-cell caller would miss a real harm, so make the ledger see it per step, as the rule for a letter whose neighbors are gone does, or name a new limit in What it checks with its example. When the whole is too strict, loosen the rule that fired, in the oracle too when it holds the same rule. Run the shard that holds the document under `--all --world=<shard>`, because the law only reads chains of two accepted changes.
- **A changed pin.** A lane's pinned leaves differ when a command stopped applying or a document changed, its unlisted lossy merges when merges past one command a side lose other work, and its `lost, oracle clean` merges when the ledger reads more or other merges lost. Run `--lossy` or `--case` here and at the base commit, and compare. Record a moved pin only when you know why it moved.
- **An intended change.** A change to what a command does changes what the solo editor accepts too, so the gate follows it. Never weaken a rule or grow a class to get green.

## Findings

This section describes the sync commit, before fix round 7 moved the baseline to classes. Each lane's classes and counts now live in `packages/plitejs/scripts/effect-ledger-classes.json`, and M0.6's "0 invalid merges" has to clear every `effect-ledger-invalid` class. The full lane covers 49,402,332 leaves.

- **Invalid merges.** 44,208 shortest forms: 13,872 in `inline`, 13,220 in `empties`, 5,988 in `blocks`, 5,695 in `marks`, 2,845 in `spares`, 1,670 in `quoted`, 453 in `caption`, 370 in `named`, 76 in `records` and 19 from the queue. They break nesting, reopen as another document, put `tags` on a heading, leave a required container empty, break a content root or make the rebase throw, such as `empties/mixed | accepted wrap 2 | own wrap 2, move 2 0`.
- **The queue.** Its public rebase breaks 11 cases, the intake's count, and its internal rebase breaks 8.
- **Lossy merges.** 1,978 listed entries, at one command a side and from the queue, and each lane pins the deeper ones by count and digest, 62,669 in the fast lane. A merge can lose several things.
- **M0.6's four named merges.** `marks/overlap | accepted bold 0 all | own italic 0 middle` and `... bold 0 first ...` are lossy, and the second is invalid too. It reads as another document here because the check applies changes to a value and reopens it, while an editor applying the same change throws `EditorNoncanonicalChangeError`. `blocks/pp | accepted retype 1 | own enter 1 mid` is lossy. The empty paragraph that moves and wraps against a letter exists only unkeyed, because the keyed `empties/empties` merge lands correctly, so its entry is `fixture r2 and r3 empty paragraph moved and wrapped against a letter`.
- **Records that stop showing.** `change.apply` at `packages/plitejs/src/core/change/document-change.ts` shows `records` in a value's JSON only when its input showed them. Once `drop shared` empties the set, the value keeps its store only in its `WeakMap`, so a later put stays hidden, and `createEditor` opening that value loses the put. The ledger reads the base's records through `getValueRecords`, so it sees the put; the fixture `a dropped record the value does not show` proves it.
- **Letters only the ledger sees leave.** The fixture `a letter leaves its block when the other side removes its neighbor` is `inline/split-link | accepted type 0 end | own remove 0.1`. The rebase moves `y` into the next paragraph. The oracle calls it clean, so the merge is no baseline entry and counts under `lost, oracle clean`.
- **The full lane fails today.** The fast lane passes, and every shard of the full lane but `records` and `queue` fails a hard rule. The classes, each with a sample:
  - `effect-ledger-law` and `effect-ledger-soundness` on "own's edit of X went with it", where a side moves or edits a block and the other side deletes it, in every world with moves. At the sync commit the ledger read who moved from the longest run of nodes that kept their order, so a whole span and its steps could name different movers. It now reads each move from the change that made it, in `effect-ledger-identity.ts`, and the rows that remain are in the baseline. The oracle, which sees only letters, cannot tell a block moved down from the one below it moved up when the moved block's first letters are gone. Samples: `internal blocks/ppp | accepted insert 3, remove 2 | own move 1 2, backspace 1 mid` and `internal inline/split-quote | accepted backspace 1.0 mid, move 0 1 | own type 0 start, remove 1.0`.
  - `effect-ledger-mutant` for `move a born letter across a block boundary`, read held, such as `internal marks/marked | accepted type 0 start, replace 1 | own insert 0, type 2 start`, and for `move a letter born in an empty paragraph into an empty sibling`, such as `internal empties/mixed | accepted insert 0 | own enter 2 start, type 2 start`.
  - `effect-ledger-soundness` on "left the line it was typed alone in", where one side splits a line and the other joins it, such as `internal blocks/split | accepted type 1 end, enter 1 mid | own delete 1 end, backspace 1 mid`.
  - `effect-ledger-law` on whether two letters share a parent across a wrap, such as `internal inline/split-link | accepted wrap 0, delete 0.0 end | own type 0 start, wrap 1`.

## What a pass proves

A pass means no leaf in the lane broke a hard rule outside the class baseline, no class grew, appeared or gained a row, every open fixture shows exactly the failures its mark names, and the lane's pins hold. It does not mean the rebase is right, because the baseline holds its broken merges. It does not mean the ledger is right either, because the baseline also holds the soundness, law and mutant classes that M1.2 empties, and the open fixtures hold merges the ledger gets wrong.

Each row below is a scratch break of the code at `feat(plitejs): add the effect ledger and its exhaustive check`, run on a copy of the tree against a control of the same narrowed bound, before this file had lanes. A narrowed run exits 1 on any finding, so the row counts only the hard rules. Every control counts 0.

| Break | Bound | Hard failures |
| --- | --- | --- |
| Remove `anchor('own', ...)`, so the ledger stops checking where own's births land | `--world=blocks --doc=pp --commands=1 --no-queue` | 156 `effect-ledger-mutant`, 1 `effect-ledger-fixture` |
| Make `facetsIn` return nothing, so block properties and nesting are not compared | the same | 16 `effect-ledger-soundness`, 3 `effect-ledger-fixture` |
| Stop comparing a born letter's marks | `--world=marks --doc=marked --commands=1 --no-queue` | 57 `effect-ledger-mutant`, 4 `effect-ledger-soundness` |
| Stop applying a property write in the fold | `--world=blocks --doc=pp --commands=1 --no-queue` | 185 `effect-ledger-reader`, 16 `effect-ledger-soundness`, 2 `effect-ledger-fixture` |
| Excuse a letter that leaves its block whenever its own move fills the block's sources | `--world=inline --doc=split-link --no-queue` | 4 `effect-ledger-law`, 1 `effect-ledger-fixture` |
| Run a ledger blind to record effects with `--plant=records` | `--world=records --doc=records --commands=1 --no-queue` | 27 `effect-ledger-mutant` |

A break of the rebase fails the whole gate. `bebe875c1b` keeps a lifted block when another peer inserts a block at the lift point. With its `root-change.ts` hunks reversed, the gate at that commit exits 1 with 248 new invalid entries, 116 new lossy entries and 332,815 deeper lossy merges against a pin of 316,338. `internal inline/quote | accepted enter 0.0 start | own enter 0.0 start` is among the new entries. No ledger rule failed in that run, so the ledger called each new lossy merge lost.

The gate with `--jobs=10` gives the same counts, findings and mutant tallies as 16 jobs, so the result does not depend on the worker count.

No check proves the rule that two blocks one side wrote keep their order. Removing `the merge turns ... and its later sibling around` fails no hard rule, and on `named/named` at two commands a side it only moved 48 merges from `lost, oracle clean` to held. Only the ledger reads that rule. The rule for a letter whose neighbors are gone is also ledger-only, and the law and a fixture prove that one.

## Coverage record

Synced at `fix(plitejs): make the effect ledger call every lost merge lost`. The verification describes these files as they stand there:

| File | What the check exercises |
| --- | --- |
| `packages/plitejs/src/core/change/effect-ledger.ts` | `viewOfChange`, `createEffectLedger`, its fold, `judge` and `resume` |
| `packages/plitejs/src/core/change/effect-ledger-identity.ts` | the origins, heirs and move intents the fold gives each node |
| `packages/plitejs/src/core/change/document-change.ts` | `DocumentChange.transform`, `transformInternalDocumentChange`, `getInternalDocumentChangeEntries` and `apply`, including the line that shows a value's records |
| `packages/plitejs/src/core/change/root-change.ts` | the public `sections` and `data` the ledger decodes, and the rebase itself |
| `packages/plitejs/src/core/change/join.ts` | how a rebase rewrites a join |
| `packages/plitejs/src/core/change/enclosure.ts` | how a rebase rewrites a wrap and what it encloses |
| `packages/plitejs/src/core/change/wrap-fidelity.ts` | when a rebase keeps a wrap whole |
| `packages/plitejs/src/core/change/transform.ts` | property modifications across a rebase |
| `packages/plitejs/src/core/change/tokens.ts` | the token kinds the fold reads, and `encodeNodes`, which `effect-ledger-reader` compares it with |
| `packages/plitejs/src/core/record-store.ts` | record ops and `getValueRecords`, which the ledger and oracle read |
| `packages/plitejs/src/core/editor-commands.ts` | the commands each side runs |
| `packages/plitejs/src/create-editor.ts` | how a merge reopens, which the invalid rule reads |
| `packages/plitejs/src/core/schema-compiler.ts` | `getCompiledPropertyMergeStrategy`, which says where a property is a set |

To see whether the verification needs another look, find the sync commit with `git log --oneline -1 --grep 'make the effect ledger call every lost merge lost'`, then run `git log --oneline <that commit>..HEAD --` with the table's files and `packages/plitejs/scripts/effect-ledger.ts`. For each commit it lists, read the diff and confirm three things. The ledger still reads every effect a change can hold, including a new section kind, record op or root lifecycle step. The check still calls both rebases the way native sync will. A new command or property shape that the worlds should reach is in their schemas and commands. Move the sync commit in this file forward, naming its subject, only after that check, a run of `pnpm check:effect-ledger` and a run of each `--all` shard.

## What it does not cover

- Two commands against two in `pnpm check`, outside the fast lane's two documents. The full lane runs them, one shard at a time. Three commands a side outside the queue.
- Whether a `lost` verdict was rightly lost. The oracle reads whole documents, so it cannot see block identity or an empty paragraph, and `lost, oracle clean` counts merges only the ledger read as lost. A false `lost` keeps a batch for review. The plan's risk row "the ledger keeps too much" watches it.
- An unkeyed empty paragraph at the world level. Only a key names an empty paragraph to the oracle, so `empties` keys its lines, and the fixture `r2 and r3 empty paragraph moved and wrapped against a letter` files the unkeyed merge.
- The ledger and the oracle agree on tie, split and turned-around allowances because both were written after reading real merges. Their code is separate, and a wrong allowance in both would pass, as the open fixtures on a split half and an empty link show. Mutants 5 and 8 test the allowances only where they plant.
- A cut that breaks the composition law, as its two kinds say. A caller that judges cell by cell has to judge such a span whole.
- Repeated letters. The oracle needs every letter unique, so no world repeats one, and only fixtures judge a change that deletes a letter and types the same letter again.
- Which rule read a merge lost. A fixture compares only the verdict's kind, so another rule that reads the merge lost hides one that stopped firing.
- Damage a mutant does not plant: a duplicated nested block, a letter born in the first of own's two changes, or a born letter moved into a block only the accepted side wrote. M1.2 widens the mutants.
- A letter that moves to another block once its immediate neighbors are gone, past the ledger. The oracle reads only immediate neighbors, so only the ledger calls such a merge lost, such as the fixture `a letter leaves its block when the other side removes its neighbor`, and it counts under `lost, oracle clean`, not in the baseline.
- Root creation. No command creates a named root, and a lifecycle race reads as a conflict.
- Suggesting, grants and authorization, head install, admission, catch-up cost and the recovery that goes through `compare`. None is a merge the rebase writes, and later steps of the plan own them.
- Three or more peers, undo and redo, selection across a rebase and the browser.
- Duplicated empty blocks. A mutant that copies an empty block can repair a block the rebase dropped, so `duplicate a block` plants only on blocks that hold letters.
- A known finding whose result changes. An identity names the commands, not the result, so a listed merge that gets worse stays green.
- A cost change, which a benchmark owns.

`/pstack:maintain-formal-verification-skill` brings this verification back in line after changes that did not recheck it.
