# Maintainer Slate issue mode

This is the thin public coordinator for one Slate issue:

```txt
issue intake/classification -> bug-fix evidence packet
-> root check -> Plate PR to next -> issue update
-> close only when the claimed integration state is true
```

Bare issue numbers target `udecode/slate`; an issue URL keeps its explicit
repository. Use `maintainer` for queue selection or batches. Use pstack's Bug
fix playbook for a local behavior bug or regression with no public mutation.

## Authority

- Issue authority: the repository resolved from the argument; default
  `udecode/slate`.
- Implementation authority: pstack's Bug fix playbook in the current Plate checkout on
  `next`.
- Shipping authority: a Plate PR targeting `next`.
- Release authority: npm/GitHub release readback.

- Read `CONTRIBUTING.md`, the relevant issue template,
  `.github/PULL_REQUEST_TEMPLATE.md`, and `SECURITY.md` before public mutation.
- Do not use a sibling Slate checkout as implementation proof.
- Current-green behavior is `already-accounted` only when Plate `next` contains
  and proves it, not when it exists only in unmerged local changes.
- A merge to `next` proves beta-branch integration, not stable availability.
- Pending PR language is `fix prepared`; leave the issue open.
- Do not claim raw IME/mobile/device closure from synthetic browser rows.
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
| `red-current` | Run the full local repair through pstack's Bug fix playbook, then ship its evidence-backed diff through a Plate PR. |
| `local-only-fix` | Treat as `red-current`; unmerged local state is not integrated. |
| `already-accounted` | Verify exact current `next` behavior, comment with evidence, and close only within the proven claim. |
| `needs-manual-proof` | Run honest supporting proof, request the exact human flow, comment, and leave open. |
| `plate-owned` | Run local repair through pstack's Bug fix playbook; keep Slate issue coordination here or use `maintainer` when the public target is Plate. |
| `invalid-or-out-of-scope` | Comment only with decisive evidence; close only when ownership and confidence justify it. |
| `blocked` | Report missing evidence/access/tooling; do not claim fixed or close. |

## Local Repair

For `red-current` or `local-only-fix`, run pstack's Bug fix playbook on the
normalized behavior report and issue constraints, and require back the evidence
packet `maintainer` names for a public behavior bug. Reject an incomplete
packet.

## Ship And Synchronize

1. Verify the Bug fix evidence packet matches the current checkout.
2. Create or update a `udecode/plate` PR targeting `next`, written per the pstack
   block's Commit and PR text rule and naming `<owner>/<repo>#<number>`.
3. Comment on the Slate issue with `fix prepared`, the PR URL, exact proof, and
   the merge/release boundary.
4. Leave the issue open.
5. After an explicitly authorized merge, or a later run that finds the PR
   merged, verify Plate `next` readback.
6. Close only when the verified claim is true. Say `next` or beta-only when
   stable publication has not happened.

For `already-accounted`, keep code unchanged, verify the exact flow on current
Plate `next`, then comment or close only with explicit authority and exact final-ref proof.

For `needs-manual-proof`, comment with the route, steps, required environment,
and expected observation when that message is authorized. Leave it open and
name the proof limit.

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
Verified on <exact ref and environment>

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
