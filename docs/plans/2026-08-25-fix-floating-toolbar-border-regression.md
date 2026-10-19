# Fix floating toolbar border regression

Objective:
Restore the homepage link floating toolbar's visible shadcn surface while
preserving all eight registry styles and link interaction behavior.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-25-fix-floating-toolbar-border-regression.md

Task source:
- Direct user report with screenshot
  `/var/folders/md/2qpw448d4tx0dgncw_kqdpk80000gn/T/codex-clipboard-89f453a6-1f90-443b-adf4-d23ebc037a27.png`.
- Exact case: click the homepage `slash command` link with a collapsed caret.
- Expected: opaque toolbar with a visible edge, editor focus, working Edit link,
  and working Escape return.

Completion threshold:
The exact case fails before the fix; the canonical preview style owner is fixed
without hard-coding one installed style; active markers fail closed under tests;
lint, www typecheck, registry and Tailwind builds pass; Chromium passes 5/5.

Verification surface:
- `apps/www` homepage `/` in Browser and Chromium.
- Registry style transform tests and the exact link toolbar browser test.
- Scoped Ultracite, www typecheck, registry build, Tailwind build, and SHA-256 fingerprints.

Constraints:
- Keep Base/Nova as defaults and preserve all eight shadcn styles.
- Do not redesign link behavior, change public APIs, edit `templates/**`, commit,
  push, create a PR, or mutate a tracker.

Boundaries:
- Website source-preview styling owns the defect, not Plite selection or link logic.
- Installed registry payloads keep static selected-style materialization.
- This is a local uncommitted candidate, not delivery proof.

Blocked condition:
Block only after three exact repro strategies fail or concurrent server writes
prevent stable final proof. Neither condition remains.

Task state:
- current_phase: closeout
- current_phase_status: completed
- goal_status: ready_to_complete

Current verdict:
- Locally fixed and verified at 98% confidence.
- Root cause: `link.tsx` emitted `cn-popover-content`; installed JSON expanded it,
  but the live website loaded no scoped CSS for raw registry markers.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | Exact screenshot case, non-goals, proof surface, and 5/5 threshold recorded before implementation |
| Skills read | yes | `autogoal`, `patch`, and Browser instructions read before task actions |
| Active goal | yes | Goal created against this plan before implementation |
| Source of truth read | yes | Screenshot, live computed styles, registry source, generated payload, transform, and sibling Plate source inspected |
| Existing solution search | yes | `docs/solutions` and nearby plans contained no owner-specific fix |
| TDD decision | yes | Exact Chromium case failed on transparent background before the fix |
| Mutation authority | yes | No commit, push, PR, tracker, or template mutation authorized |
| Release artifact decision | yes | No changeset/changelog because this is website-only preview infrastructure with no package/public API change |

Work Checklist:
- [x] Exact prompt, scope, non-goals, proof, and handoff caveat recorded first.
- [x] Exact report reproduced with transparent background, zero border, no shadow, and zero radius.
- [x] Registry/provider/style owners and generated payload behavior traced.
- [x] Hard-cut counterfactual rejected deleting markers because installed style variants require them.
- [x] Canonical preview owner repaired instead of hard-coding Nova in `link.tsx`.
- [x] Generated preview CSS covers every active marker across all eight pinned styles.
- [x] Nova is the site default and create-preview restores the prior body style.
- [x] Browser proof covers edge/background, editor focus, Edit link focus, and Escape return.
- [x] Transform tests, scoped lint, www typecheck, registry and Tailwind builds pass.
- [x] Browser screenshot and computed paint inspected on final local source.
- [x] Exact Chromium case passes 5/5 with retries disabled and no runtime errors.
- [x] No exports, manifests, lockfiles, agent rules, templates, public APIs, PRs, commits, pushes, or trackers changed.
- [x] Final ref, fingerprints, proof boundary, and remaining risk recorded.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Named verification threshold | yes | Red-to-green case, tests, lint, typecheck, builds, Browser paint, and Chromium 5/5 complete |
| Bug reproduced before fix | yes | Chromium failed because background was `rgba(0, 0, 0, 0)` |
| Targeted verification | yes | `link:floating-toolbar-visible-boundary` covers paint and focus lifecycle |
| Typed source | yes | `pnpm --filter www typecheck` passed after the accumulator type repair |
| Package graph | N/A | No export, manifest, dependency, lockfile, or install change |
| Agent rules | N/A | No agent-owned file changed |
| Browser surface | yes | Browser screenshot and Nova computed styles inspected on localhost |
| Browser errors | yes | Runtime recorder found no task-owned page errors; successful paint proves the local CSS path |
| Fresh pushed ref | N/A | No commit or push authorized; proof is explicitly local |
| Retry-free stability | yes | Chromium passed 5/5, one worker, zero retries |
| Registry output | yes | 380 canonical payloads and 15 sparse overlays materialized |
| Templates | N/A | `templates/**` untouched |
| Changeset/changelog | N/A | Website preview fix only; no package/public registry component behavior changed |
| Autoreview | N/A | Current branch is `next`, where repo instructions prohibit `autoreview` |
| PR/tracker sync | N/A | No external mutation requested |
| Final lint | yes | Scoped Ultracite passed after scoped formatting |
| Output budget | yes | Reads were scoped/capped; one minified CSS diff was truncated, then inspection switched to selectors and hashes |
| Final handoff | yes | Outcome, design, verification, local caveat, and fingerprints recorded below |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Exact red repro and owner trace | implementation |
| Implementation | completed | Generated scoped preview CSS and default/cleanup ownership | verification |
| Verification | completed | Tests, lint, typecheck, builds, Browser, Chromium 5/5 | closeout |
| PR / tracker sync | N/A | No external mutation authorized | closeout |
| Closeout | completed | Final ledger and fingerprints | user handoff |

Findings:
- The marker was correct for installed registry materialization, but raw website
  source lacked generated marker CSS.
- Inline combobox used the same raw-marker path. Command markers are included,
  and tests require preview coverage of every active marker.
- Nova's visible edge is shadcn's `ring-1` plus shadow, not CSS border width.

Decisions and tradeoffs:
- Generate a small scoped preview stylesheet from the pinned class maps.
- Reject importing roughly 618 KB of full upstream style source, hard-coding
  Nova, or adding DOM mutation machinery.
- Keep existing provider adapters; removing them is unrelated cleanup.

Implementation notes:
- `createPreviewStyleCss` deterministically generates scoped rules.
- The shadcn sync emits TypeScript and CSS from the same eight pinned maps.
- Global CSS imports the artifact; layout defaults to `style-nova`; create-preview restores body style.

Review fixes:
- Scoped Ultracite formatted the generator and browser test.
- Typecheck found a broad accumulator type; it now initializes all eight required keys.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Shell quote/glob mistakes | 2 | Use literal patterns and exact paths | Searches reran successfully |
| Shared dev server stale/exited | 3 | Do not kill shared owners; follow replacement port | Final proof ran on port 3014 |
| Two `Paste link` inputs | 1 | Scope assertion to visible popover | Interaction test passed |
| Generator accumulator type error | 1 | Initialize every named style key | Full www typecheck passed |
| Minified CSS diff too large | 1 | Use selector search and hashes | Later output stayed bounded |

Verification evidence:
- Red: exact Chromium test failed on transparent background.
- Transform: 7 tests and 195 expectations pass.
- Scoped Ultracite and `pnpm --filter www typecheck` pass.
- Registry: 380 canonical payloads and 15 sparse overlays; Tailwind build passes.
- Browser: Nova paint is `oklch(1 0 0)`, 10px radius, 1px ring plus shadow,
  editor focused; screenshot visually confirms it.
- Stability: exact Chromium case passes 5/5 with no retries or runtime errors.
- Baseline ref: `168a4490e2ccf90dd9b1bd3230fb2f528460caa2`.
- Runtime/generator hashes:
  - transform `fc8fbd1342150e9338e9dd5e332e7ca70a13443ab8a38c1d997ae77192748399`
  - sync `11c7fb39fc8b48369bea90044c11ccaebe35e10947f984dc3a7e0b11878a14ae`
  - create preview `ff9a3e6abb72c39d7f574d1e3bc0480f5312643dfe8add61d90eaf7520f669e6`
  - globals `752aea94f07a0878688d601b491deceb840f92eb604923e709e5df318c6b2bee`
  - layout `381af0b522dafc0cdd303f7ea3205d9ae959b1d7fbf9564d3f0125a9edfa33b3`
  - preview TS `3d03b6303b3f97628fce124cbd4f8b73429b6702cef3af9b9888cb4594ff60d5`
  - preview CSS `184ab3d3e775b19060a0a8724326fbab08a3db21f28da0b06e669083cf9247d5`
  - Tailwind `ce573d5486cae12df5f48fcd7d64a953747f3c64be14082f3f67c423b5e59a2b`
- Proof hashes:
  - transform test `f63ce37d817c57195580fda87ef4872e90eb156888e553b988b0bd0262ebc100`
  - browser test `85fe60e1fd190c6a7f58d6a8d3f5319f4a18715e583de6f3f673c3e02acf1131`
  - generated link JSON `423985f6d6d286c509de5cd46328c853654d19f38ad36344fbc264cc4fcdd6f0`

Final handoff contract:
- PR and tracker: N/A; not requested.
- Confidence: 98% local candidate confidence.
- Reproduced: exact homepage case red before the fix.
- Verified: exact homepage case green 5/5 plus source/build proof.
- Outcome: floating link toolbar has its shadcn-defined surface again.
- Caveat: local uncommitted checkout only; not committed, pushed, or shipped.
- Design: scoped preview CSS shares the pinned style-map owner with installed payload materialization.

Final handoff / sync:
- PR: N/A; not requested.
- Issue / tracker: N/A; none supplied.
- Browser proof: complete local Browser inspection and Chromium 5/5.
- Caveat: no release proof; concurrent server ownership changed ports, but the final stable run used the final local source and fingerprints.

Timeline:
- 2026-08-25T23:19:49.528Z Goal created and prompt contract captured.
- 2026-08-26 Red repro, owner repair, generated output, typecheck, and Browser closure completed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | User handoff |
| What is the goal? | Restore the floating link toolbar's shadcn-defined visible surface |
| What have I learned? | Installed materialization worked; live raw-marker preview CSS was missing |
| What have I done? | Added scoped generated CSS, exact proof, generated output, and 5/5 closure |

Open risks:
- No known local functional risk. Delivery remains unproven because no commit,
  push, PR, or deployment was requested.
