# Fit the website build within the Standard machine

Status: building, testing disabled webpack caching after the 4 GB trial exhausted its heap.
Playbook: bug-fix

## Brief

### What will change?

The website build should finish on the existing machine. Four trials still exhausted memory. The next trial disables webpack caching, which retains build data, while keeping the 4 GB heap cap.

### What could go wrong?

Disabling the cache can make repeated builds slower. The next preview must finish on the existing machine before the fix counts as working.

## Teach

The build turns the website source and documentation into deployable pages. Its JavaScript heap limit currently equals the machine's entire memory allowance, although native code and other processes need memory too.

The first trials reduced the heap cap, removed repeated parsing and limited simultaneous module compilation. They still exhausted memory. The 4 GB trial hit JavaScript's heap limit. The next trial removes webpack's retained cache data.

## Scope

- User request: "ok go try each one until fixed. @Vercel check then".
- Exit condition: a fresh preview build of the final candidate reaches READY on the existing Standard 4-vCPU/8-GB Vercel machine; affected output remains valid; delivery uses land.mjs.
- Baseline commit: 86dcab04963a75d49762ade381ff6bb54d59abdb.
- Baseline deployment: dpl_7DuJwcbx2Ydo4gxZfpv7uerNuze7, errorCode out_of_memory.
- No production promotion, release, build-machine upgrade or shared setting change.
- Throughput checkpoint: one remote build at a time; inspect and prepare checks while it runs.

## Main changes

- Trial 1 changes the Next build heap limit from 8192 MiB to 6144 MiB.
- Trial 2 is conditional on trial 1 failing. Replace the unchanged ts-morph parse round trip with direct import rewriting after proving output parity.
- Trial 3 is conditional on earlier trials failing. Lower webpack module parallelism to 4.
- Trial 4 follows the third failure. Set the heap cap to 4096 MiB and place it after inherited Node options.
- Trial 5 follows the fourth failure. Disable webpack caching in the async-docs build hook.
- Trials are cumulative. A failed trial proves that the combination was insufficient, not that each change has no benefit.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Remote verification | Test a preview with existing specs | Test locally only | local | detail |
| Trial order | Change one thing per build | Apply every proposed change together | together | detail |

## Steps

- [x] Reproduce the reported failure. Proof: Vercel baseline reports out_of_memory and an OOM event.
- [x] Test the smaller heap alone. Proof: dpl_EMZQ7SYF5FUwYXRukuzRWYuAPPvW failed with out_of_memory and SIGKILL before compilation completed on 4 cores and 8 GB.
- [x] If needed, test direct source text rewriting. Proof: parity passed; dpl_9qoxJSdXNwjZH7Pezr9YW4dfPJgn still failed with out_of_memory on the unchanged machine.
- [x] If needed, test reduced compiler parallelism. Proof: dpl_Gdo7r7TL9zVFYpLwYn9VYy3c3UUy failed with out_of_memory and SIGKILL before compilation completed on the unchanged machine.
- [x] Test the 4096 MiB cap. Proof: dpl_Fpyr7JrvpM5tnWV5kzrD6okngfqw reached V8's heap limit near 4144 MB and exited SIGABRT before compilation completed.
- [ ] Test without webpack caching. Proof: affected configuration checks and a matching remote READY build on unchanged machine specs.
- [ ] Review and run affected checks. Proof: final diff, writing passes and scoped successful checks.
- [ ] Deliver and check the published result. Proof: land.mjs commit on origin/next and matching READY preview.

## Verification

- Original failure is confirmed remotely. Build status, source identity and logs are retained in the main checkout's ignored run directory.
- The acceptance check is build completion under the existing machine limit. No build-speed claim is made.
- Browser-visible behavior, editor runtime and document-size performance are unchanged by a heap-only fix.

## Evidence

- Run directory: docs/plans/artifacts/2026-10-19-www-build-memory in the main checkout.
- Baseline: baseline-vercel.json.
- Heap-only trial: heap-final-vercel.json. The smaller heap alone did not satisfy the exit condition.
- Parser parity: parser-parity-original.json and parser-parity-candidate-a1.log cover all 433 tracked registry TypeScript inputs. They prove text parity only.
- Broader parity: registry-text-parity-a1.log covers all 948 tracked registry text files, including MDX, JSON and CSS. The probe compares the removed parser step with raw text; source review confirms the same import rewriting receives that text.
- Parser trial: parser-final-vercel.json. Removing the repeated parse did not satisfy the exit condition.
- Parallelism trial: parallel-final-vercel.json. The four-module limit did not satisfy the exit condition.
- Four-gigabyte trial: heap4096-final-vercel.json. The V8 heap error confirms the lower cap was effective for the failed worker in this deployment.
- Worker source inspection: Next's default parallelServerCompiles and parallelServerBuildTraces are false. The webpack worker loop awaits each compiler's worker exit. Overlapping compiler workers are not the source explanation under this configuration.
- Option probe: heap4096-options-a1.log checks the actual build command prefix on local Node 24 with absent, hyphenated and underscored inherited 8192 MiB flags. All cases retain the final 4096 MiB cap. This does not observe Vercel's actual inherited options.
- Option limit: worker-memory-cause.md records a synthetic mixed-alias sequence that Next's formatter reorders. The script does not guarantee the cap for every possible inherited option sequence. The failed fourth deployment itself demonstrates its actual worker hit the smaller cap.
- Cache guidance: https://nextjs.org/docs/app/guides/memory-usage#disable-webpack-cache documents webpack caching as a memory consumer. Trial 5 tests disabling it; no memory reduction is claimed before the remote result.
- Previous successful build: dpl_B1Ne4A6WYd5cYREtsXYxoiAZdN9s at cca5fb5e62e522251c1236da212d082869d29459. Its logs report 2 cores and 8 GB, so it is a historical comparison with different CPU allocation, not a controlled baseline.

## Open work

- Complete the ordered trials and deliver the passing candidate. owner: this run; stop: remote READY and delivery proof.
