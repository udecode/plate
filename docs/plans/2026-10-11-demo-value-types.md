# Demo values that crash their editor

Status: executed, waiting on your commit
Page: https://claude.ai/artifact/X97KFBk8BYTBCzk9ZDMSNC
Playbook: bug-fix

Three registry demos crashed on load because their starting document did not fit the plugins they install, and a fourth showed an empty page. All four now load, and one new test guards the shared demo page.

## Teach

Every demo page starts an editor with a document and a set of plugins. Each block in the document has a type, like paragraph or heading. The editor only knows the types its plugins add. On startup it checks the whole document. If one block has a type it doesn't know, or the wrong shape, it throws and the page crashes.

Most demos share one page that loads the full editor kit and finds its document by the page's name. The others pick their own plugins.

Editable voids spelled its custom type differently from its plugin. Hundreds of editors loaded no plugins, so it didn't know headings. Plugin rules put two text pieces in a code block that allows one, and used an old name for the divider line. Align didn't crash, but its document was saved under a different name, so the page found nothing.

## Demo

1. Open `/blocks/editable-voids-demo` on any www dev server. You see the intro paragraph, then a card with a name field, two radio buttons and a nested editor. Before the fix the page threw an error instead.
   ![after](artifacts/demo-value-types/frames/editable-voids-after.jpg)
2. Open `/blocks/hundreds-editors-demo`. You see 300 numbered editors, each starting with a large heading. Before, it threw an error.
   ![after](artifacts/demo-value-types/frames/hundreds-editors-after.jpg)
3. Open `/blocks/plugin-rules-demo` and scroll to "Void elements:". A thin divider sits under it. Before, it threw an error.
   ![after](artifacts/demo-value-types/frames/plugin-rules-hr-after.png)
4. Open `/blocks/align-demo`, which the text-align docs page also previews. You see a right-aligned "Alignment" heading and a centered "Center" heading. Before, the editor held one empty line.
   ![after](artifacts/demo-value-types/frames/align-after.jpg)
5. Run `bun test ./apps/www/src/registry/examples/values/demo-values.spec.tsx` from the repository root. All 4 tests pass.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Plugins for hundreds of editors | Just the basic blocks, which cover its headings | Everything in the full editor kit | full kit | small |
| Align demo's empty page | Fix it too, so the demo and its docs preview show the align document | Leave it empty, since it never crashed | leave align | small |
| Plugin rules' broken code block | Fix it too, since it crashed before the divider did | Fix only the divider name | divider only | detail |
| How far the new test reaches | One test for the 31 demos on the shared page | A test that loads all 78 demos | test every demo | small |

## Close

**Deviation.** The ask covered block types that match no installed plugin. The sweep also found a demo with no plugins, a code block with too many children and the align demo's missing document. All three leave a demo that does not show its document, so I fixed them in the same pass. The tabbable demo already passed, from the other session's fix, and I did not touch its files.

**What landed.** `editable-voids-value.tsx`, in English and Chinese, now uses the plugin's key `editableVoid`. `plugin-rules-value.tsx` drops the extra `<text />` in its code block and uses `horizontalRule`. `hundreds-editors-demo.tsx` installs `BasicBlocksKit`, which replaces two commented-out lines. `demo-values.tsx` keys the align document as `align`, the id its route passes, and `plugins-static.spec.ts` follows. `demo-values.spec.tsx` gains one test: every `-demo` route served by `examples/demo.tsx` must have a value that builds under `EditorKit`. `pnpm --filter www build:registry` regenerated the registry output, which now lists `@plate/basic-blocks` for hundreds-editors. A new registry changelog entry, `2026-10-11-fix-demo-values`, has one fix row for each of the four demos, and `pnpm check registry-changelog` passes.

**Proof.** Before the fix, a server-render sweep and a browser sweep of all 78 `-demo` routes found the same three crashes. The new test failed first with `align: no demo value` and the plugin-rules code block error. A mutation run on the frozen candidate restored each of `hr`, the extra code text and the old `text-align` key, and the test caught all three. On the final linted bytes, lint reports 0 warnings and 0 errors, the three touched specs pass 25 of 25, and both sweeps report 0 of 78 routes with a schema error. Screenshots of the four fixed routes show their documents. Logs are in `docs/plans/artifacts/demo-value-types/`.

**Limits.** The test covers only the 31 routes the shared demo page serves. The 47 custom demo pages have no automated check, and the two sweeps that found these bugs run by hand against a dev server. The browser proof ran in the in-app Chromium browser on a dev server with source packages, and the frames show only the fixed state. No route or test loads the Chinese editable-voids document. The only consumer of the Chinese values is the playground, so that one-word edit keeps the two files in step but has no runtime proof. One early direct load of hundreds-editors counted 600 editable roots right after a hot reload. Both final reads counted 300, and I did not find the cause of the early count.

## Open work

- The 47 custom demo pages have no automated check for this class. The sweep script at `docs/plans/artifacts/demo-value-types/ssr-sweep.mjs` could become a manual check under `apps/www/scripts`. This plan tracks it. owner: zbeyens. stop: the owner takes or drops it.
- `installation-next-demo` reads `localStorage` while rendering on the server, logs "localStorage is not defined", and recovers on the client. This plan tracks it. owner: zbeyens. stop: the owner takes or drops it.
- `demo-values.tsx` keeps five commented-out entries that no route loads. This plan tracks it. owner: zbeyens. stop: the owner takes or drops it.
- `createValue` returns nothing for an id it does not know, which is how the align demo went empty without an error. Making it throw would turn the next key drift into a visible crash, but the internal `demo` item passes an unknown id today. This plan tracks it. owner: zbeyens. stop: the owner takes or drops it.
- `getI18nValues` builds about 40 values per locale, and only the playground reads one. This plan tracks it. owner: zbeyens. stop: the owner takes or drops it.

## Reflect

One Opus reviewer read this session through the tooling, judgment and divergent lenses. Its reply is in `docs/plans/artifacts/demo-value-types/reflect/reply.md`.

The review found three gaps in this run's own work, and I fixed them. I added the missing registry changelog entry. The Close now says the Chinese edit has no runtime proof, and it names the unexplained early editor count.

No lesson qualifies to apply without approval. None fixes a helper that refuses a case its own rule allows, and none is a rewording that adds no words.

Rejected:

- Pick the runtime symptom over the requester's guessed mechanism. `verify`'s completion boundary already says this.
- One validator error per document needs one mutant per defect. The testing reference's mutation rule already says this, and this run followed it.
- Deslop should read `git diff HEAD`. The autostage note in `AGENTS.md` already says this.
- The console log in the in-app browser carries errors over from earlier pages. The `built-in-browser` skill says to read it before the first browser step, and I never loaded it. The miss was mine, not the skill description's.
- The guard's id lookup restates the route's id rule. That rule is the route's input. The test checks the value lookup and the editor build, not the rule.

Backlog. Each item has owner: zbeyens and stop: the owner takes or drops it.

- `grep -h` still reaches rtk's help text when written as `command grep -h`, so the zsh advice in the user CLAUDE.md is wrong for that flag. `rg --no-filename` works.
- Add a registry route sweep recipe to `verify`'s command recipes: a plain fetch of every `-demo` route finds schema crashes during the server render, and the server log holds the full message.
- `plan-page` step 6 can reuse in-app browser screenshots, which the session already saves under its `tool-results` folder.
- `plate-ui`'s description covers registry components and kits, not examples or values, though its trigger owns the registry changelog for examples too.
- `verify`'s command recipes list no form for specs under `apps/www`, which run from the root as `bun test ./apps/www/<path>`.
- `decisions-check.mjs` usage text should print the allowed result words, which live in `status.mjs`.
- A read-only Bash hook could flag `\b` in `git grep -E`, options after a `git grep` pattern and a bare word starting with `=`. This run hit all three.
- `verify` could say that a demo which renders empty is a failure even when nothing throws.
- The session-title rule should say that a deferred rename tool counts as available.
- The trails rule keeps a repository plan only for multi-session, unattended, cross-area or PR work, while the pages rule makes every playbook close write one. On this small fix, the page work took about a third of the run.
- The Extraction rule could exempt a run where a runtime sweep has already named every owner file.
- Nobody read whether the `built-in-browser` skill says that console messages carry over between pages. If it doesn't, `verify`'s browser notes should.
