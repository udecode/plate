- Visual sync scopes must capture comparable screenshots of the upstream
  shadcn page and the Plate page before making or closing a visual parity call.
  Save only screenshots and notes, not broad upstream patch files.
## Micro-Overlap Direct Merge Exception

The default review boundary is still real. Do not use it as an excuse to miss
obvious tiny upstream fixes on components Plate already mirrors.

During planning, directly merge a change when all of these are true:

- The upstream row maps to a retained Plate component, primitive, hook, or
  utility with a clear local owner path, not to upstream product content.
- The parent surface is already `synced`, an accepted partial sync, or an
  obvious overlapping primitive such as `Button`, `Badge`, `Input`, `Command`,
  `Tooltip`, `PageHeader`, or the copied docs-shell components.
- The diff is tiny: one local file, one behavior/class/token/prop/import fix,
  no new files, no deleted files, no new dependency, no route, no data model,
  no generated output, and no package or lockfile edit.
- The local Plate file still has the old value or an equivalent local variant
  that should receive the same fix.
- The change does not touch settled exclusions: v0, charts, colors,
  theme/customizer product surfaces, upstream docs prose, external registry
  directory content, or generated `public/r/**` output. Plate `/create` and
  registry styles are accepted surfaces, but their multi-file product work can
  never qualify as a micro-merge.
- No product judgment is needed. If the change changes layout, UX, copy,
  route shape, docs concepts, registry semantics, or multi-file architecture,
  it is not a micro-merge.

Examples of direct merges:

- Replace one stale utility class on Plate's copied `Button` because upstream
  fixed the same class on every style variant.
- Apply one bugfix conditional to a copied `Command` or `CopyButton` primitive
  when Plate has the same bug and no Plate product requirement changes.
- Remove one dead prop/import from a synced component when upstream removed it
  and Plate has no local dependency on it.

Examples that still require review:

- Package bumps, lockfile changes, registry schema/route changes, docs concept
  additions, new components, deleted components, multi-file UI chunks, visual
  layout rewrites, sidebar/search behavior changes, generated registry output,
  and anything touching a deferred or rejected product surface.

When a micro-overlap merge is found:

1. Record it in the run plan under `## Micro Auto-Merges` with upstream path,
   Plate path, focused diff summary, why it qualifies, and verification.
2. Patch the Plate owner file directly in the same activation.
3. Run the smallest meaningful verification: focused eslint/typecheck/source
   audit; add browser proof when the changed component is browser-visible and a
   stable route exists.
4. Add a `partialSyncs` entry if the full baseline does not advance. Keep
   `lastSyncedCommit` unchanged unless the whole range is complete.
5. Continue to stop for review on every non-micro slice.

Planning mode may:

- fetch/pull `../shadcn`
- create the active plan
- write `docs/sync/shadcn/runs/<range>/` artifacts
- update `lastPlannedCommit` and `lastPlan`
- directly apply qualifying micro-overlap merges and record them as partial
  syncs
- ask one review/decision question

Planning mode must not:

- patch `apps/www` except for qualifying micro-overlap direct merges
- advance `lastSyncedCommit`
- treat "recommended first slice" as accepted
- implement a slice without existing user authorization

## Hard Rules

- Use evidence, not vibes. Read upstream commits, file status, focused diffs,
  local Plate files, prior decisions, screenshots for visual surfaces, and
  relevant solution notes.
- Track exact commits. Never say "latest shadcn" without recording the target
  SHA.
- Planning is the default output. Do not patch `apps/www` unless the row
  qualifies as a micro-overlap direct merge or the user accepts a merge slice in
  the active request. Explicit planning-only work never patches product source.
- Prefer deleting old Plate fork residue over preserving compatibility layers
  when upstream already owns the better model.
- Prefer upstream docs infrastructure unless Plate has a real product or
  registry reason to diverge.
## Completion Gates

These gates must be closed in the active plan:

- Upstream range artifacts exist and are non-empty, or a target-only bootstrap
  exception is recorded.
- `inventory.md` accounts for every row in `upstream-name-status.tsv`.
- Decision counts cover every upstream row.
- Source-backed Plate mapping exists for every actionable adoption, fork,
  exclusion, or question group.
- `docs/sync/shadcn/status.json` parses and its `lastPlannedCommit` /
  `lastSyncedCommit` semantics match the work actually completed.
- Browser proof exists when browser-visible docs UI changed, or when a
  planning scope is visual and needs Plate-vs-shadcn parity evidence.
- A header, nav or search change has browser proof on `/` and `/cn` at mobile width, and command-menu fallback navigation is proved apart from search results.
- Visual sync scopes include screenshots of both upstream shadcn and Plate
  pages at matching viewport(s), plus written deltas such as background,
  spacing, disabled/gray controls, nav/header items, and first-viewport
  framing.
- For layout parity, copy the upstream component structure first, then measure the deployed shadcn page and the Plate page at the same viewport and record x, y, width and height for the sidebar label, first item, active item, main heading and TOC title. The local `../ui` source can differ from the deployed DOM, and screenshot-only Tailwind tweaks are not parity proof.
## Durable Policy

Read these before making decisions:

- `docs/sync/shadcn/status.json`
- `docs/sync/shadcn/decisions.md`
- `docs/plans/2026-05-23-shadcn-docs-restart-comparison.md`
- `docs/plans/2026-05-24-shadcn-base-migration-progress.md`
- [parity](./parity.md)
- `docs/solutions/best-practices/2026-05-23-shadcn-docs-restart-comparison.md`
- `docs/solutions/developer-experience/2026-05-27-shadcn-docs-sidebar-parity-needs-source-and-dom-metrics.md`
- `docs/solutions/developer-experience/2026-05-24-shadcn-registry-install-commands-should-use-configured-namespaces.md`
- `docs/solutions/developer-experience/2026-05-24-fumadocs-page-tree-search-needs-locale-safe-metadata.md`

- When an accepted sync changes upstream registry style inputs, set
  `SHADCN_STYLE_SOURCE_COMMIT` to the exact reviewed upstream SHA, then run
  `pnpm --filter www exec tsx scripts/sync-shadcn-registry-styles.mts` from the
  repo root. Verify the style-transform suite before registry generation. Never
  copy style CSS or edit provenance and preview-class output by hand.
