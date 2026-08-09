---
description: Coordinate one public Slate issue through a local Plite repair, Plate PR targeting next, verified issue sync, and honest integration or release state.
argument-hint: <issue number | issue URL>
disable-model-invocation: true
name: resolve-slate-issue
metadata:
  skiller:
    source: .agents/rules/resolve-slate-issue.mdc
---

# Resolve Slate Issue

Handle $ARGUMENTS.

This is the thin public coordinator for one Slate issue:

```txt
issue intake/classification -> patch evidence packet
-> root check -> Plate PR to next -> issue update
-> close only when the claimed integration state is true
```

Bare issue numbers target `udecode/slate`; an issue URL keeps its explicit
repository. Use `maintainer` for queue selection or batches. Use `patch`
for a local behavior bug or regression with no public mutation.

## Authority

- Issue authority: the repository resolved from the argument; default
  `udecode/slate`.
- Implementation authority: `patch` in the current Plate checkout on
  `next`.
- Shipping authority: a Plate PR targeting `next`.
- Release authority: npm/GitHub release readback.

Invocation authorizes the verified PR and issue comment required by this
workflow. It does not authorize merge, publish, or a premature close.

## Hard Rules

- Start from the live issue and current Plate source.
- Read `CONTRIBUTING.md`, the relevant issue template,
  `.github/PULL_REQUEST_TEMPLATE.md`, and `SECURITY.md` before public mutation.
- Do not duplicate local reproduction, test design, implementation,
  architecture pressure, focused proof, or P2 autoreview here. Delegate that
  complete local packet to `patch`.
- Do not use a sibling Slate checkout as implementation proof.
- Current-green behavior is `already-accounted` only when Plate `next` contains
  and proves it, not when it exists only in unmerged local changes.
- A code-changing fix requires a Plate PR targeting `next` after the root
  `check` gate passes.
- Never merge unless the user explicitly asks.
- A merge to `next` proves beta-branch integration, not stable availability.
- Use `gh issue comment ... --body-file ...`.
- Pending PR language is `fix prepared`; leave the issue open.
- Do not claim raw IME/mobile/device closure from synthetic browser rows.
- Route security-shaped intake to `maintainer security`.

## Intake

Resolve and read the full issue:

```bash
# Bare number or #number
issue_ref='<number-or-#number>'
issue_number="${issue_ref#\#}"
gh issue view "$issue_number" -R udecode/slate \
  --comments \
  --json number,title,body,comments,labels,state,url

# URL or explicit target
gh issue view <number-or-url> \
  --comments \
  --json number,title,body,comments,labels,state,url
```

Read body, comments, labels, media, and version/browser/device constraints. Use
`video-transcripts` for attached recordings unless an exact cached transcript
already exists.

Extract:

- repository, issue number, state, and title;
- exact flow, expected result, and actual result;
- browser, OS, device, input method, and version;
- likely Plite or Plate owner and runnable route;
- whether the claim is substrate, Plate product, docs/support, security, or
  external ecosystem work;
- whether closure needs `next` integration or a published release.

## Classification

| State | Coordinator action |
| --- | --- |
| `red-current` | Delegate the full local repair to `patch`, then ship its evidence-backed diff through a Plate PR. |
| `local-only-fix` | Treat as `red-current`; unmerged local state is not integrated. |
| `already-accounted` | Verify exact current `next` behavior, comment with evidence, and close only within the proven claim. |
| `needs-manual-proof` | Run honest supporting proof, request the exact human flow, comment, and leave open. |
| `plate-owned` | Delegate local repair to `patch`; keep Slate issue coordination here or use `maintainer` when the public target is Plate. |
| `invalid-or-out-of-scope` | Comment only with decisive evidence; close only when ownership and confidence justify it. |
| `blocked` | Report missing evidence/access/tooling; do not claim fixed or close. |

## Delegate Local Repair

For `red-current` or `local-only-fix`, invoke `patch` with the normalized
behavior report and issue constraints. Require this evidence packet back:

- classification and root cause;
- durable owner and changed files;
- red proof and passing focused commands;
- Browser/device proof or explicit limitation;
- architecture-pressure verdict;
- changeset status;
- P2 autoreview result;
- unresolved caveat.

Reject an incomplete packet. Do not recreate the worker's patch methodology or
package command matrix in this coordinator.

## Ship And Synchronize

For a code-changing fix:

1. Verify the worker evidence matches the current checkout.
2. Run the root `check` gate.
3. Create or update a `udecode/plate` PR targeting `next`, using the repo
   task-style body and `<owner>/<repo>#<number>`.
4. Verify the PR body with `gh pr view --json body`.
5. Comment on the Slate issue with `fix prepared`, the PR URL, exact proof, and
   the merge/release boundary.
6. Leave the issue open.
7. After an explicitly authorized merge, or a later run that finds the PR
   merged, verify Plate `next` readback.
8. Close only when the verified claim is true. Say `next` or beta-only when
   stable publication has not happened.

For `already-accounted`, keep code unchanged, verify the exact flow on current
Plate `next`, then comment and close only at 95%+ confidence within that scope.

For `needs-manual-proof`, comment with the route, steps, required environment,
and expected observation; leave open and omit a 95-100% confidence claim.

## Comment Shapes

Pending PR:

```md
🟡 Fix prepared in <plate-pr-url>

**✅ Outcome**

- The current Plate checkout passes <exact flow>.
- The issue remains open until the PR is merged into `next`.

**🧪 Verified**

- `<worker proof>`
- `pnpm check`

**⚠️ Delivery**

- Target: Plate `next`.
- Stable release: not claimed.
```

Integrated/current:

```md
🟢 95-100% confidence

| Phase | 🧪 Tests | 🌐 Browser |
| --- | --- | --- |
| Reproduced | <red proof or current-state check> | <browser repro or N/A> |
| Verified | 🟢 <passing proof> | <verified flow or N/A> |

**✅ Outcome**

- <Exact behavior on Plate `next`.>

**🏗️ Design**

- Owner: <Plite package or Plate owner>.
- Boundary: <why this owner is correct>.

**🧪 Verified**

- `<worker proof>`
- `<root or release readback>`
```

Use `🔴` only for an observed failing proof. Add a caveat section only when a
real device, browser, or release limitation remains.

## Final Handoff

Keep it short:

- issue repository and number;
- classification;
- worker evidence packet status;
- Plate PR URL, target, and merge state;
- issue comment URL;
- issue closed yes/no and why;
- exact root/public verification;
- delivery state and caveat.
