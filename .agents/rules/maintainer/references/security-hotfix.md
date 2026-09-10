# Security advisory hotfix mechanics

Apply Task publication and disclosure authority to every write below.

## Security Advisory Hotfixes

Apply this when the source or required closeout is a GitHub security advisory,
GHSA, CVE request, npm advisory, private vulnerability report, or public
package security hotfix.

- Treat the advisory as the tracker source. Use the GitHub advisory API through
  `gh api` when the source is a GitHub repository advisory or public GHSA; do
  not rely on the web UI as the only proof. For npm-only advisories or private
  reports without a GitHub advisory, record the external advisory/report source
  and the external owner or blocker instead.
- Public GitHub Advisory Database records from `github.com/advisories/GHSA-*`
  are read-only for normal repo maintainers. If the fix belongs to this repo,
  locate the repository security advisory, or create it when authorized, before trying to update
  vulnerable ranges, publish, or request a CVE. If no repo advisory is owned by
  this repo/org, close with global GHSA readback plus external owner/blocker.
- If the source is private, draft, embargoed, or not yet publicly disclosed,
  do not create a public PR, public issue comment, release note, or tracker
  sync that reveals exploit details before the fixed version is available and
  disclosure is approved. Use the repository advisory/private fork workflow
  when available. If a public PR is necessary before disclosure, keep the title,
  body, branch, commits, tests, and comments sanitized unless the user
  explicitly approves disclosure.
- Use `--with security-advisory` in the goal plan. Also use
  `--with package-api` when a published package, changeset, or npm release is
  part of the fix.
- Do not stop at a merged PR, merged Version Packages PR, or created GitHub
  Release while the advisory is still draft, lacks a patched version, or points
  at the wrong affected range.
- Verify the patched package is actually published before publishing the
  advisory. For npm packages, read back `npm view <package>@<version>` and the
  GitHub release/tag when relevant.
- When advisory updates are authorized, update repository vulnerabilities with the
  exact package, vulnerable range, and fixed version. The affected range should
  exclude the fixed version. Public/global GHSA records without a repo advisory
  are read-only; record readback and owner/blocker instead of mutating them.
- When publication is authorized, publish after the fixed version is available. For
  external/npm/private advisories, record the external publication state or the
  owner/blocker instead.
- If a repository advisory has empty `cve_id` and is eligible, request a CVE
  through the advisory API when that request is authorized; read back the
  advisory afterward and record that assignment may remain pending. For
  public/global GHSA records without a repo advisory and non-GitHub sources,
  record existing CVE, external CNA/request owner, GitHub/global owner, or N/A
  reason.
- Final closeout must read back state, published timestamp, affected package,
  vulnerable range, patched version, CVE status, and the expected GitHub
  review/Dependabot propagation caveat.
- Final handoff for private/draft work must state the disclosure-safe path used
  or the exact user approval that allowed public details.
