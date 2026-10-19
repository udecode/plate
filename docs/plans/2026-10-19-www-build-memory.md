# Fit the website build within the Standard machine

Status: building, testing bounded webpack concurrency after the first two trials exhausted memory.
Playbook: bug-fix

## Brief

### What will change?

The website build should finish on the existing machine. Try a smaller heap first, then remove unnecessary parsing, then reduce compilation parallelism only if needed. Keep the smallest change that passes.

### What could go wrong?

A smaller heap may still be too small for this build. A successful local build cannot prove the remote memory limit is respected. Each candidate needs its own remote result.

## Teach

The build turns the website source and documentation into deployable pages. Its JavaScript heap limit currently equals the machine's entire memory allowance, although native code and other processes need memory too.

The first trial reserves memory for those other uses. Later trials remove repeated parsing or reduce simultaneous compilation only if the earlier trial fails.

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
- Discard a trial when evidence disproves its benefit. Keep no speculative flags.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Remote verification | Test a preview with existing specs | Test locally only | local | detail |
| Trial order | Change one thing per build | Apply every proposed change together | together | detail |

## Steps

- [x] Reproduce the reported failure. Proof: Vercel baseline reports out_of_memory and an OOM event.
- [x] Test the smaller heap alone. Proof: dpl_EMZQ7SYF5FUwYXRukuzRWYuAPPvW failed with out_of_memory and SIGKILL before compilation completed on 4 cores and 8 GB.
- [x] If needed, test direct source text rewriting. Proof: parity passed; dpl_9qoxJSdXNwjZH7Pezr9YW4dfPJgn still failed with out_of_memory on the unchanged machine.
- [ ] If needed, test reduced compiler parallelism. Proof: remote build result on unchanged machine specs.
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

## Open work

- Complete the ordered trials and deliver the passing candidate. owner: this run; stop: remote READY and delivery proof.
