# Editor Spec: Math Delimiter Triggers

## Goal

Run the editor-spec workflow for `$...$` and `$$...$$` typing-trigger behavior.

## Findings

- current Plate math support is real, but the repo does not currently ship `$`
  or `$$` typing triggers
- Typora is explicit about:
  - `$` auto-pair when inline math is enabled
  - `$$` + `Return` to enter block math
- Milkdown is now also explicit:
  - inline math input rule for `$...$`
  - block math input rule for the `$$` trigger surface
- Obsidian is also explicit, but not with the same exact mechanic:
  - math delimiter syntax
  - markdown pair settings
  - `$` selection-wrap auto-pair history
  - live-preview markdown auto-pair coverage including `$`
  - `$$` block detection and block preview history
- the honest result is a specified, implementation-deferred surface rather than
  a current locked feature row

## Outcome

- add compiled research for Typora, Obsidian, and Milkdown trigger coverage
- split row-level authority instead of pretending math triggers are one winner
  row
- keep a narrower research open question for which variant Plate should prefer
  per sub-surface
- define the surface in readable law as a profile-adjacent input-assist option
- add protocol rows
- keep it out of the current shipped-feature gate in parity

## Progress Log

- 2026-04-09: Initial narrow pass incorrectly stopped after a partial corpus
  check and left Milkdown understated.
- 2026-04-09: Reran as a full `research-wiki` corpus pass across Typora,
  Obsidian, and Milkdown.
- 2026-04-09: Confirmed Typora and Milkdown as strong explicit trigger sources,
  with Obsidian remaining partial at syntax/settings level only.
- 2026-04-09: Extended the Obsidian pass across help, developer, and release
  notes; still no equally explicit trigger mechanics surfaced.
- 2026-04-09: Corrected the Obsidian read after rechecking the release notes.
  Obsidian does contain explicit `$` selection-wrap and `$$` block-detection
  evidence; the real gap is row choice, not Obsidian absence.
- 2026-04-09: Reran as a stricter `editor-spec` pass after tightening the skill.
  Standards, parity, and audit were updated. Readable law and protocol rows
  were reread and deliberately kept because they already matched the stronger
  Obsidian split.

## Per-Corpus Evidence Ledger

### Typora

- compiled pages inspected:
  - [code-math-table-and-task-surfaces.md](docs/research/sources/typora/code-math-table-and-task-surfaces.md)
  - [math-delimiter-triggers.md](docs/research/sources/typora/math-delimiter-triggers.md)
- raw paths inspected:
  - `../raw/typora/pages/auto-pair.json`
  - `../raw/typora/pages/math.json`
- strongest evidence found:
  - `$` auto-pair when inline math is enabled
  - `$$` + `Return` enters block math
- disposition: `evidenced`
- next action: none required for trigger mechanics

### Obsidian

- compiled pages inspected:
  - [editing-modes-and-markdown-surface.md](docs/research/sources/obsidian/editing-modes-and-markdown-surface.md)
  - [math-delimiters-and-pair-settings.md](docs/research/sources/obsidian/math-delimiters-and-pair-settings.md)
- official source entrypoints checked:
  - `https://help.obsidian.md/syntax`
  - `https://help.obsidian.md/edit-and-read`
  - `https://obsidian.md/changelog/`
- raw paths inspected:
  - `../raw/obsidian/help/en/Editing and formatting/Advanced formatting syntax.md`
  - `../raw/obsidian/help/en/User interface/Settings.md`
  - `../raw/obsidian/help/en/Editing and formatting/Views and editing mode.md`
  - `../raw/obsidian/help/Release notes/v0.7.2.md`
  - `../raw/obsidian/help/Release notes/v0.8.11.md`
  - `../raw/obsidian/help/Release notes/v0.8.14.md`
  - `../raw/obsidian/help/Release notes/v0.11.11.md`
  - `../raw/obsidian/help/Release notes/v0.13.0.md`
  - `../raw/obsidian/help/Release notes/v0.13.3.md`
  - broad grep over `../raw/obsidian/help/Release notes`
  - broad grep over `../raw/obsidian/help/en`
  - broad grep over `../raw/obsidian/developer/en`
- direct raw files actually read:
  - `../raw/obsidian/help/en/Editing and formatting/Advanced formatting syntax.md`
  - `../raw/obsidian/help/en/Editing and formatting/Views and editing mode.md`
  - `../raw/obsidian/help/en/User interface/Settings.md`
  - `../raw/obsidian/help/Release notes/v0.7.2.md`
  - `../raw/obsidian/help/Release notes/v0.8.11.md`
  - `../raw/obsidian/help/Release notes/v0.8.14.md`
  - `../raw/obsidian/help/Release notes/v0.11.11.md`
  - `../raw/obsidian/help/Release notes/v0.13.0.md`
  - `../raw/obsidian/help/Release notes/v0.13.3.md`
- strongest evidence found:
  - explicit math delimiter syntax
  - explicit pair settings for markdown syntax
  - explicit live-preview vs source-mode editing context
  - explicit `$` selection-wrap auto-pair history
  - explicit live-preview auto-pair coverage for `$`
  - explicit `$$` block detection and block preview history
- disposition: `evidenced`
- next action:
  - split the row-level authority so Obsidian owns the conservative
    selection-wrap / block-detection side instead of forcing one blended math
    trigger story

### Milkdown

- compiled pages inspected:
  - [latex-trigger-surface.md](docs/research/sources/milkdown/latex-trigger-surface.md)
  - [behavior-test-lanes.md](docs/research/sources/milkdown/behavior-test-lanes.md)
- raw paths inspected:
  - `../raw/milkdown/repo/packages/crepe/src/feature/latex/input-rule.ts`
  - `../raw/milkdown/repo/packages/crepe/src/feature/latex/index.ts`
  - `../raw/milkdown/repo/packages/crepe/src/feature/top-bar/config.ts`
  - broad grep over `../raw/milkdown/repo/packages`
- strongest evidence found:
  - explicit inline math input rule for `$...$`
  - explicit block math input rule for `$$`
- disposition: `evidenced`
- next action: none required for trigger mechanics
