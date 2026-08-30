# {{TITLE}}

Objective:
TODO: State the end-to-end Plate feature outcome in one sentence.

Goal plan:
{{PLAN_PATH}}

Template:
{{TEMPLATE_PATH}}

Primary template:
docs/plans/templates/plate-feature.md

Applied packs:

- TODO: Add only the packs required by the Feature Manifest.

Flow mode:

- TODO: new package | existing package plus React/registry | headless package | registry-only

Completion threshold:

- Every applicable Feature Manifest row is complete with evidence.
- Every excluded row has an explicit N/A reason.
- Selected packs, Plate Next attestation, P1 review, feature checker, and goal
  checker are closed.

Verification surface:

- TODO: Name package, app, registry, docs, browser, release, and agent checks.

Constraints:

- Use one Feature Manifest through every phase.
- Load worker skills only when their phase is active.
- Do not add package-generation tooling.
- Do not copy worker doctrine into this plan.

Boundaries:

- Source of truth: TODO.
- Allowed edit scope: TODO.
- Browser surface: TODO or N/A with reason.
- Release surface: TODO: package changeset, registry changelog, both, or N/A.
- Non-goals: TODO.

Output budget strategy:

- TODO: Prefer manifests, counts, and focused proof over broad output.

Blocked condition:

- TODO: Name the external decision or unavailable proof that stops work.

Feature Manifest:
| Surface | Applies | Owner | Artifacts | Consumer | Proof | Status |
| --- | --- | --- | --- | --- | --- | --- |
| API | pending | pending | pending | pending | pending | pending |
| Package | pending | pending | pending | pending | pending | pending |
| React adapter | pending | pending | pending | pending | pending | pending |
| Registry UI | pending | pending | pending | pending | pending | pending |
| Composition | pending | pending | pending | pending | pending | pending |
| Registry metadata/examples | pending | pending | pending | pending | pending | pending |
| Docs | pending | pending | pending | pending | pending | pending |
| Release artifacts | pending | pending | pending | pending | pending | pending |
| Proof | yes | plate-feature | pending | maintainers | pending | pending |
| Plate Next attestation | pending | plate-next | pending | maintainers | pending | pending |
| Review/handoff | yes | autoreview | pending | user | pending | pending |

Package file evidence:

- Package: pending or N/A with reason.
- Manifest command / file count: pending or N/A with reason.
- Package fingerprint: pending or N/A with reason.
- File: `pending`
- [ ] `pending` — score: pending — verdict: pending — owner: pending — evidence: pending — next: pending.

When package attestation applies, link the Package and Plate Next manifest rows
to this section. Add one checkbox per package file. Check a file only at score
`100`; otherwise leave it unchecked with a concrete owner and next action.

Package boundary contract:
| Contract | Decision | Evidence |
| --- | --- | --- |
| shared Plate host | pending or N/A with reason | pending or N/A with reason |
| Plite ownership | pending or N/A with reason | pending or N/A with reason |
| external dependency ownership | pending or N/A with reason | pending or N/A with reason |
| entrypoint direction | pending or N/A with reason | pending or N/A with reason |
| Oxlint coverage | pending or N/A with reason | pending or N/A with reason |

Phase state:

- current phase: intake
- status: in_progress
- next phase: API and layer gate

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Feature Manifest complete before source writes | pending | pending |
| Flow mode selected | pending | pending |
| Public API decision owner selected | pending | pending |
| Manual package decision recorded | pending | pending |
| Conditional packs selected | pending | pending |
| Active goal checked or created | pending | pending |

Work Checklist:

- [ ] Fill every Feature Manifest row before source writes.
- [ ] Settle public shape and layer ownership.
- [ ] Create any new package manually from two current sibling patterns.
- [ ] Resolve the package host, Plite ownership, external dependency ownership,
      headless/React direction, and Oxlint coverage rows for every applicable
      package change.
- [ ] Implement and prove package semantics.
- [ ] Add only applicable package React adapters.
- [ ] Add applicable copied registry component families.
- [ ] Wire applicable kits, static bindings, metadata, dependencies, and examples.
- [ ] Write current-state docs and classify release artifacts.
- [ ] Run selected package, app, registry, docs, browser, and stale-surface proof.
- [ ] Reuse this manifest for Plate Next attestation without mass-attesting packages.
- [ ] Run P1 autoreview and close accepted findings before goal completion.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Manifest coverage | yes | Run `node tooling/scripts/check-plate-feature.mjs {{PLAN_PATH}}` | pending |
| Selected pack closure | yes | Close every selected pack | pending |
| Package proof | pending | Run owner-selected package proof | pending |
| Package boundary proof | pending | Run `pnpm test:manifests`, scoped lint, and the affected Oxlint override audit, or record N/A | pending |
| Registry/browser proof | pending | Verify runnable copied UI or record N/A | pending |
| Docs/release proof | pending | Verify docs and release classification | pending |
| Plate Next attestation | pending | Validate reviewed package version/evidence or record N/A | pending |
| P1 autoreview | yes | Run P1 autoreview and close accepted findings | pending |
| Goal plan complete | yes | Run the autogoal completion checker after autoreview | pending |

Findings:

- None yet.

Decisions and tradeoffs:

- None yet.

Review fixes:

- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | --- | --- | --- |
| None yet | 0 | | |

Verification evidence:

- Pending.

Final handoff contract:

- Outcome: pending
- Evidence: pending
- Browser proof: pending
- Release artifacts: pending
- Residual risk: pending
- Next owner: pending

Timeline:

- pending
