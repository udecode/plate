---
review_scopes: [link]
review_basis: [2026-10-12-link-review]
work_kind: implementation
review_commit: 5fc246c291edeab138ff656a567f6517c11c4844
review_inputs: [apps/www/src/registry/components/editor/link.tsx, apps/www/src/registry/components/editor/link-toolbar.spec.ts, apps/www/tests/browser/link-url-policy.spec.ts, packages/platejs/src/features/link/lib/BaseLinkPlugin.ts]
---

# Link toolbar: turning a typed draft into an address

Status: executed: built and verified, waiting on your commit
Topic: link
Playbook: plan

This iteration continues [the links review](2026-10-12-link-review.md), which the owner's "/verdit next non conflicting while authored is running" picked. That review moved draft cleanup from the cut `transformInput` hook into the copied toolbar's `submit`. Its first diff round replaced the rule's fixed order with a retry: save the draft as typed, and on refusal save `https://` plus a host-shaped draft. All three seats of its second diff round found that the retry rewrites an unchanged address that `allowedSchemes` no longer allows, such as `com.example.app:1234`, into `https://com.example.app:1234` when only the label changes. The rule had already had its one replacement, so the panel rule reverted it to the code from before the review and sent it back to planning. The toolbar now saves its draft as typed, which stores `google` and `www.example.com` as relative links.

This plan's first round, diff round 3 of the links review, found two more ways the planned `https://` guess retargets an address, and Opus's seat proposed the strongest cut, which round 2 of this plan took: no `https://` guess at all. Before the links review, the toolbar refused `www.example.com` and `google` too, because `isUrl` needs `//`. Round 2 found that an unchanged address still changes on a label-only edit, because `upsert` prepares it again: a stored `' guide.html '` becomes `%20guide.html%20`. Round 2's answer let `upsert` keep an unchanged address. Round 3 found that this changed a public method, returned `true` when nothing changed, and rested on a wrong reason for rejecting the toolbar-only route. So the toolbar now keeps an unchanged address itself, in one transaction, and the package does not change.

## Brief

### What will change?

For your links review: every way of adding a link checks the address types you allow, and one setting decides what text becomes a link. The form no longer guesses https and refuses anything that isn't an address.

### What could go wrong?

Only Chromium ran, and no browser test edits just a label. A second reviewer caught two overstated claims, now fixed. Two older bugs in inserting links stay open, and the form refuses without saying why.

## Teach

The link form takes the text you type and saves it as the link's address. The package checks whether that type of address is allowed every time it writes one.

Before this, the form saved exactly what you typed, so google and www.example.com became broken relative links. Editing only a label wrote the address again, so a stored address with stray spaces changed, and one whose type you stopped allowing couldn't be relabeled.

Now the form saves a new or changed draft only when it looks like an address: it starts with http:// or https://, has another scheme such as mailto:, or starts with /, ./, ../, # or ?. Anything else, such as google, www.example.com or https:www.example.com, is refused and the form stays open. When you edit a link and leave its address field alone, the form saves only the label.

## Main changes

- The copied `submit` checks whether the address field still holds the edited link's stored address, compared before trimming. If it does, it updates the link's text with `upsertText`, and no address or target is written. Otherwise it trims the draft, refuses one that does not read as an address, and calls `upsert` once, which makes the admission decision. It reads no `allowedSchemes`.

## Design

The checks run in this order.

```tsx
// apps/www/src/registry/components/editor/link.tsx
const DRAFT_ADDRESS = /^((?!https?:)[a-z][a-z\d+.-]*:|https?:\/\/|[#/?]|\.{1,2}\/)/i;

// in submit
const { newTab, text, url } = store.get();
const editedLink = editor.read.nodes.above({ at: selection, type: linkPlugin });

if (editedLink && url === editedLink[0].url) {
  update.upsertText({ text: text || url, url });
} else {
  const draft = url.trim();

  if (
    !DRAFT_ADDRESS.test(draft) ||
    !update.upsert({ target: newTab ? '_blank' : undefined, text, url: draft })
  ) {
    return undefined;
  }
}
```

Deviation from the approved design: plan round 3 approved "one transaction that sets or unsets `target` on that link and updates its text with the link's `upsertText`". Diff round 1 cut the `target` write. Only `triggerEdit` sets `newTab`, from the stored target, so that write could only remove a stored target other than `_blank`. `upsertText` is one transaction on its own. It is typed with `UpsertLinkOptions`, so it takes a `url` it does not read.

`DRAFT_ADDRESS` takes `http` and `https` only with `//`, as the default `parseUrl` does, so `https:www.example.com`, which a browser resolves as a relative path on an https page, is refused. `example.com:8080` and `localhost:3000` read as a scheme, so `upsert` refuses them unless the app allows that scheme. `text || url` keeps `upsert`'s rule that an empty label shows the address.

Compared with the toolbar before the links review, which accepted `/` and `#` drafts and otherwise needed `isUrl`, the rule newly accepts `./` and `../` paths, `?` drafts, `tel:` and app schemes that `allowedSchemes` allows, hosts without a dot such as `https://intranet`, the placeholder `https://...`, and a bare `mailto:`.

Rejected: the round-1 retry, which saves twice and lets a refused unchanged address fall into the host branch; the round-3 design, which guessed `https://` for host-shaped drafts and needed its own copy of the scheme comparison; asking the package whether a draft is admitted before saving, which brings back the `api.validateUrl` pre-check the links review cut; and round 2's change to `upsert` keeping an unchanged address, which changed a public method, gave the package its own idea of "unchanged" and returned `true` when nothing changed.

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Draft `google`, `www.example.com`, `guide.html` or `https:www.example.com` | Refused; the form stays open and nothing is written | `link-toolbar.spec.ts` |
| Draft `example.com:8080` or `ftp://example.com` | Refused by `upsert`; the form stays open | `link-toolbar.spec.ts` |
| Draft `com.example.app:1234` with `com.example.app` allowed | Saved as typed | `link-toolbar.spec.ts` |
| Label-only edit of a stored `com.example.app:1234` the app no longer allows | Saves the label; the address stays and the link stays inactive | `link-toolbar.spec.ts` |
| Label-only edit of a stored `' guide.html '` | Saves the label; the address stays `' guide.html '` | `link-toolbar.spec.ts` |
| Edit of `guide.html` to `./guide2.html` | Saved as `./guide2.html` | `link-toolbar.spec.ts` |
| Draft `#top`, `/docs`, `?q=1` or `../guide.html` | Saved as typed | `link-toolbar.spec.ts` |
| Label cleared on a link whose address is unchanged | The label shows the stored address | `link-toolbar.spec.ts` |
| `www.example.com` typed into the floating link form in Chromium, then Enter | The form stays open and no link is written; `https://www.example.com` then saves | `apps/www/tests/browser/link-url-policy.spec.ts`, five warm runs |

## Steps

- [x] Write the specs from Native behavior. They replace the spec that expected a label-only edit of a refused stored address to be refused, and fold the old `guide.html` label-only row into the padded one. Proof: a run log under `docs/plans/artifacts/2026-10-12-link-review/` in which the refused drafts and both label-only edits fail on the current code and the other specs pass. Done: `docs/plans/artifacts/2026-10-12-link-review/tb-before-specs-a2.log`, the six planned titles fail and the other 13 pass.
- [x] Build `submit` as Design says. Proof: `bun test ./apps/www/src/registry/components/editor/link-toolbar.spec.ts` and `bun test ./packages/platejs/src/features/link/` pass, and three mutation runs each fail their spec: comparing the trimmed draft fails the padded label-only spec, dropping the unchanged branch fails both label-only specs, and taking the unchanged branch for any edited link fails the `./guide2.html` spec. Done: `docs/plans/artifacts/2026-10-12-link-review/tb-after-specs-a1.log`, 97 pass; mutations on frozen build `c23285b3b5fc8426523ec2f18f6ce8be1eb7665c` in `docs/plans/artifacts/2026-10-12-link-review/mutate/tb-trimmed-compare-a1.log`, `docs/plans/artifacts/2026-10-12-link-review/mutate/tb-no-unchanged-branch-refused-scheme-a1.log`, `docs/plans/artifacts/2026-10-12-link-review/mutate/tb-no-unchanged-branch-padded-a1.log` and `docs/plans/artifacts/2026-10-12-link-review/mutate/tb-unchanged-branch-any-link-a1.log`, each against a passing control; `tx.link.upsertText` type-checks in `docs/plans/artifacts/2026-10-12-link-review/tb-www-tsc-a2.log`, whose nine errors are all in another session's `import-toolbar-button.spec.tsx`.
- [x] Add a browser test to `apps/www/tests/browser/link-url-policy.spec.ts` that types `www.example.com` into the floating link form, presses Enter, checks that the form stays open and no link exists, then saves `https://www.example.com`. Rewrite the toolbar sentences in `content/docs/(plugins)/(elements)/link.mdx`, `link.cn.mdx` and the registry entry `2026-10-12-link-draft-addresses`. Proof: the browser test fails on the reverted toolbar; the regenerated entry JSON matches the generator's output; `pnpm --filter www build:registry --check` passes; and the five warm Chromium runs of `link-url-policy.spec.ts` that the links review's phase 3 runs include this test. Done: `docs/plans/artifacts/2026-10-12-link-review/tb-before-browser-a1.log` and `docs/plans/artifacts/2026-10-12-link-review/tb-after-browser-a1.log`; `docs/plans/artifacts/2026-10-12-link-review/changelog-gen-tb3`; `docs/plans/artifacts/2026-10-12-link-review/tb-build-registry-check-a1.log`; `docs/plans/artifacts/2026-10-12-link-review/final-browser-link-a1.log` to `docs/plans/artifacts/2026-10-12-link-review/final-browser-link-a5.log`.
- [x] Writing passes on the build, then one diff panel round on it, counted for this iteration. Proof: the `writing` and `panel` rows in `docs/plans/2026-10-12-link-toolbar-draft.decisions.tsv`. Done: diff round 1's `seats` and warning rows, and the `writing` rows before and after it.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| A typed web address without https | Refused, the form stays open | Gets https in front | add https | small |
| Editing only the label of a link whose address type you no longer allow | Saves the new label and keeps the address | Refuses the edit and keeps the form open | refuse label | small |

## Proof

Model tests run in Bun with happy-dom against the copied toolbar and the package. The Chromium spec drives the real floating form on `/blocks/link-demo` from a source-serving www dev server. The demo route holds no stored address that a second preparation would change, so only the model tests prove the label-only edits, with the address field left as the form loaded it. Native IME and other browsers are not covered.

## Close

The reversal comes first. Plan round 3 approved "one transaction that sets or unsets `target` on that link and updates its text with the link's `upsertText`". Diff round 1 kept only `upsertText`. Only `triggerEdit` sets `newTab`, from the stored target, so the `target` write could only remove a stored target other than `_blank`.

The copied `submit` now keeps an unchanged address by updating only the label through `upsertText`, compared before trimming. It trims any other draft, refuses one that `DRAFT_ADDRESS` does not take, and sends the rest to one `upsert`, which makes the admission decision. The link docs in English and Chinese, the registry entry and the registry payloads describe it.

Proof, from each row's `scope:`:

- On the reverted toolbar, six planned specs fail for their named defects and 13 pass (`docs/plans/artifacts/2026-10-12-link-review/tb-before-specs-a2.log`), and the Chromium test fails when the form closes on `www.example.com` (`docs/plans/artifacts/2026-10-12-link-review/tb-before-browser-a1.log`).
- On the final bytes, 102 toolbar and link package specs pass (`docs/plans/artifacts/2026-10-12-link-review/tb-final-specs-a1.log`), and `link.tsx` type-checks (`docs/plans/artifacts/2026-10-12-link-review/tb-www-tsc-a3.log`).
- Seven mutants on frozen tree `60d5e6d7e4cba211386723cf88fde21be579d3ee` each fail their own spec against a passing control: a trimmed compare, a dropped unchanged branch for each label-only case, the unchanged branch taken for any edited link, the path prefixes dropped, `../` dropped and the empty-label fallback dropped (`docs/plans/artifacts/2026-10-12-link-review/mutate/tb-trimmed-compare-r1-a1.log`, `docs/plans/artifacts/2026-10-12-link-review/mutate/tb-no-unchanged-branch-refused-scheme-r1-a1.log`, `docs/plans/artifacts/2026-10-12-link-review/mutate/tb-no-unchanged-branch-padded-r1-a1.log`, `docs/plans/artifacts/2026-10-12-link-review/mutate/tb-unchanged-branch-any-link-r1-a1.log`, `docs/plans/artifacts/2026-10-12-link-review/mutate/tb-r1-no-path-prefixes-a1.log`, `docs/plans/artifacts/2026-10-12-link-review/mutate/tb-r1-no-parent-path-a1.log`, `docs/plans/artifacts/2026-10-12-link-review/mutate/tb-r1-no-empty-label-fallback-a1.log`).
- Five warm Chromium runs pass the form test with the rest of `link-url-policy.spec.ts` (`docs/plans/artifacts/2026-10-12-link-review/final-browser-link-a1.log` to `docs/plans/artifacts/2026-10-12-link-review/final-browser-link-a5.log`); its screenshot shows the form open on `www.example.com` with `docs` unlinked.
- `build:registry --check` reports the generation fresh, the payloads carry the new `submit`, and the entry JSON equals the generator's output (`docs/plans/artifacts/2026-10-12-link-review/tb-build-registry-check-a1.log`, `docs/plans/artifacts/2026-10-12-link-review/changelog-gen-tb3`).

The demo route holds no stored address that a second preparation would change, so only the model tests prove the label-only edits, with the address field left as the form loaded it. Editing an escaped address in the field treats it as new. The form refuses without a message. Only Chromium ran.

The plan read these inputs at `review_commit`: `apps/www/src/registry/components/editor/link.tsx`, `apps/www/src/registry/components/editor/link-toolbar.spec.ts`, `apps/www/tests/browser/link-url-policy.spec.ts` and `packages/platejs/src/features/link/lib/BaseLinkPlugin.ts`.

The plan had three review rounds, the first of them the links review's diff round 3, and its build one diff round with no critical finding.

Open work, tracked in the link subject's `## Open work`:

- The link form refuses a draft without a message. owner: zbeyens. stop: a report of a silent link-form refusal.
- `upsertText` takes a `url` it does not read. owner: zbeyens. stop: the next link API review.
- No browser test edits only a label through the real form. owner: zbeyens. stop: a demo page gets a link whose address would change if saved again.

### Attention

reviewed by gpt-6.1-sol @xhigh

- The run froze diff round 1's packet before it rebuilt the registry, so the packet held the old payloads. The panel read `link.tsx`, which the payloads copy, and `build:registry --check` shows the checkout's payloads match it.
- Only model tests prove a label-only edit, and only while the address field is untouched.
