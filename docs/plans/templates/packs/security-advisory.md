# security-advisory pack

Use this pack when work touches a GitHub security advisory, GHSA, CVE request,
npm advisory, private vulnerability report, or public package security hotfix.

This pack owns disclosure closeout. It does not replace `package-api`: use both
packs when a published package release is part of the fix.

The hard rule: a security hotfix is not done just because the code merged. It is
done when the fixed version is available to users and the advisory has accurate
metadata, publication state, CVE decision, and readback evidence.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Security advisory pack selected | pending | pending |
| Advisory source read through correct authority or explicit access blocker | pending | Use repo advisory endpoint for `/<owner>/<repo>/security/advisories/GHSA-*`, global read-only advisory endpoint for `/advisories/GHSA-*`, npm/advisory registry source for npm-only advisories, or the provided private report source |
| Affected package, vulnerable range, and fixed-version target identified | pending | pending |
| Disclosure/release order recorded | pending | Patch release before advisory publication, or explicit blocker |
| Private/draft disclosure safety recorded | pending | Record public, private/draft, embargoed, or already-published source state before PR/tracker sync |
| CVE decision recorded | pending | Request CVE, existing CVE, or N/A with reason |

Work Checklist:
- [ ] Security advisory pack: advisory source, state, `cve_id` when available, credits/reporter when available, affected products, and current vulnerable ranges are recorded from the correct source authority or marked blocked by permissions.
- [ ] Security advisory pack: public/global GHSA records are treated as read-only unless a repository security advisory owned by the current repo/org is located or created.
- [ ] Security advisory pack: impact, root cause, reproduction, remediation, affected package, vulnerable range, and fixed version are recorded.
- [ ] Security advisory pack: private, draft, embargoed, or not-yet-public reports avoid public PR/comment/release-note disclosure until the fixed version is available and disclosure is approved; any public pre-disclosure PR is sanitized or explicitly user-approved.
- [ ] Security advisory pack: security regression proof is recorded, or N/A reason explains why proof is external/manual.
- [ ] Security advisory pack: code fix, PR merge, release/version PR, npm/package publish, and GitHub release/tag are tracked when a published package is involved.
- [ ] Security advisory pack: repository advisory vulnerability metadata is updated with package, vulnerable range excluding the fixed version, and patched version after the fixed version is published, or N/A reason is recorded for read-only public GHSA/non-GitHub sources.
- [ ] Security advisory pack: repository advisory is published after the fixed version is available, or public GHSA/external/npm/private publication state or blocker is recorded.
- [ ] Security advisory pack: CVE is requested when a repository advisory has empty `cve_id` and is eligible, unless the user explicitly declines or a blocker is recorded; public GHSA/non-GitHub sources record existing CVE, GitHub/global owner, external CNA/request owner, or N/A reason.
- [ ] Security advisory pack: final readback records source, state, `published_at` when available, package, vulnerable range, patched version, CVE status, and propagation caveat or external-owner caveat.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Advisory source read | pending | Read repo advisories through `gh api repos/<owner>/<repo>/security-advisories/<GHSA_ID>`, public read-only GHSA records through `gh api advisories/<GHSA_ID>`, npm-only advisories through npm/advisory registry source, or private reports through the provided report source; otherwise record access blocker | pending |
| Security repro / regression proof | pending | Record failing-before/passing-after proof, PoC validation, or N/A reason | pending |
| Private disclosure guard | pending | For private/draft/embargoed/not-yet-public sources, use repository advisory/private fork or sanitized public artifacts until approved disclosure; otherwise record N/A: already public | pending |
| Patched version published | pending | Verify npm/package publish and GitHub release/tag when a package release is part of the fix | pending |
| Advisory metadata updated | pending | For repository advisories, update affected product metadata with exact package, vulnerable range, and patched version; for public read-only GHSA/non-GitHub sources, record N/A with source owner/blocker | pending |
| Advisory published | pending | Publish repository advisory after patched version availability, or record public GHSA/external/npm/private publication state or blocker | pending |
| CVE request decision | pending | Request CVE through repository advisory API when applicable, or record existing CVE, GitHub/global owner, external CNA/request owner, or N/A reason | pending |
| Advisory final readback | pending | Read back repository advisory state, `published_at`, `cve_id`, vulnerabilities, and URL, or record equivalent public GHSA/external source readback | pending |
| Propagation caveat | pending | Record GitHub review / Dependabot / advisory database propagation caveat, public GHSA/global owner, or external-source propagation owner in final handoff | pending |
