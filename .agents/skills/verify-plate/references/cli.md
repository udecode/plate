# Verify CLI generation in a disposable consumer

Use this recipe for the current local generate/check flow. It proves neither
packed distribution nor generated-type compilation. Add those owners' checks
only when the claim requires them. `packages/cli/src/bin.ts` owns the command
and flag inventory. Generation/watch/scaffolding fixtures live in
`packages/cli/test/generate.test.ts`; document migrations use
`packages/cli/test/run-migration.test.ts`. Dependency utility fixtures live
under `packages/cli/src/deps` and do not replace a real `deps` command drive.

## Prepare the consumer

1. Resolve the absolute current checkout and read the default `createFixture`
   in `packages/cli/test/generate.test.ts`. Its default call uses a TypeScript
   entry with CalloutPlugin, AlignPlugin and application properties. Copy that
   current entry into a unique temporary directory as `editor.ts`; keep the
   test as the authoritative fixture instead of maintaining a second example.
2. Add a private `package.json` with `type: "module"`, a disposable package name
   and version. The CLI locates its package root from this file. Its private
   cache must stay inside the disposable consumer.
3. Copy the fixture's TypeScript configuration, pointing `extends` at this
   checkout's `tooling/config/tsconfig.base.json`. Use `jsx: "react-jsx"`,
   `noEmit: true`, `rootDir: "/"` and `include: ["./**/*"]` for this external
   temporary directory. Resolve these source aliases from the checkout:

   | Import | Current source |
   | --- | --- |
   | `platejs` | `packages/platejs/src/index.tsx` |
   | `platejs/compiler` | `packages/platejs/src/compiler/index.tsx` |
   | `platejs/react` | `packages/platejs/src/react/index.tsx` |

4. Record the authored inputs and their content hashes, sizes and modification
   times. Record the CLI source/build identities. Build the CLI once when its
   artifact is stale with `pnpm --filter @platejs/cli build`.
5. From the consumer cwd, record Node's executable and version. Invoke the
   absolute `packages/cli/dist/bin.js` with `--version` and `--help`. Match the
   version to `packages/cli/package.json` before driving. Check the selected
   subcommand's help on each fresh command family; do not assume defaults.

## Drive the real command

From the disposable consumer, run these arguments through Node and the absolute
CLI binary. Record cwd, command, exit status, stdout and stderr each time.

1. Run `generate editor.ts`. Confirm that it generated one editor and emitted
   `editor.schema.json` and `editor.generated.ts`. Inspect the schema identity,
   properties and diagnostics against the current fixture. Confirm that all
   authored inputs remain unchanged.
2. Run `generate editor.ts --check`. Expect success and unchanged authored
   inputs and generated artifacts, including their modification times.
3. Save the original generated TypeScript, then append one deliberate stale
   marker to that generated file in the disposable consumer.
4. Run the same check. Expect a nonzero result naming the stale generated file.
   Confirm that check mode did not repair it or alter the other files.
5. Restore the original output and run the check again. Expect success with
   unchanged input and output fingerprints.

The CLI may coordinate through `node_modules/.cache/plate/state` inside the
consumer, including during check mode. With a clean publication journal,
check mode preserves authored inputs and generated artifacts. An interrupted
publication is recovered before checking and may rewrite generated outputs;
use the existing journal-recovery fixture for that separate claim.
Never place that cache under the repository merely to simplify the fixture.

For full command coverage, also use the existing default-entry, TSX and
multi-entry fixtures. A TSX fixture containing JSX needs React, including
`react/jsx-runtime`, installed in that consumer; source aliases alone do not
supply its runtime dependency. Confirm unchanged outputs keep their modification
times, one changed entry leaves its sibling untouched, and an invalid batch
preserves all last-good outputs. Duplicate entries, output collisions and
`--check --watch` use their existing rejection fixtures.

## Watch a consumer

Run `generate editor.ts second-editor.ts --watch` in an owned foreground
session. Wait for its initial generation and watch-ready output, then change
only the first fixture's schema version. Verify that only its generated pair
changes. Use the imported dependency, ambient type and tsconfig fixtures when
those input classes are in scope.

Introduce the existing invalid-dependency or missing-entry condition. Confirm
the watcher reports the failure while retaining the last-good outputs; restore
the input and observe successful generation in the same session. An entry
missing before startup is a different error and does not start a watcher.

While it is healthy, verify unchanged one-shot generation can run and another
watcher cannot acquire the same outputs. Stop owned sessions with SIGINT or
SIGTERM and check their corresponding exit codes, child cleanup and ownership
release. Retain evidence before removing the private cache.

## Scaffold and run migrations

`migrate new <name> --entry editor.ts` compares against both generated files
read from Git HEAD. Use a disposable Git fixture with a genuinely committed
generated baseline; an injected committed-file reader or fake Git executable
does not prove this CLI path. Git operations belong only to the fixture, not
the working repository. Without that baseline, verify and report the explicit
prerequisite error instead of claiming successful scaffolding.

Use the current scaffolding fixture: generate version 2, commit that pair in
the consumer, then add the required property and version 3. Run `migrate new
require-slug --entry editor.ts`. Inspect the migration directory, checksummed
from/to schema manifest, generated types and implementation stub. The existing
generated pair must stay unchanged.

For document migration, copy the separate `run-migration.test.ts` fixture and
adapt its source imports to this checkout. Preserve `EditorKit`, `EditorSchema`
and `EditorMigrations`. Exercise the real binary's modes against its old
document, retaining byte hashes and modification times:

| Arguments | Observable result |
| --- | --- |
| `migrate run document.json --entry editor.ts` | Reports a proposed change; leaves the document untouched. |
| Same with `--check` | Exits nonzero for the old document and zero for a current document; changes neither. |
| Same with `--write` | Writes the expected schema envelope and text, preserving selection when supplied. A current rerun preserves bytes and modification time. |
| `migrate run --entry editor.ts --stdin` | Writes migrated JSON to stdout with no human summary; disk inputs stay unchanged. |
| Stdin with `--check` | Uses stderr for change/current diagnostics, leaves stdout empty, and returns the appropriate exit code. |

Use existing multiple-document, application-root, empty-kit and selection
fixtures for their distinct assertions. A valid-plus-invalid batch must not
partially write. Reject stdin with paths, stdin with write, check with write,
missing documents, malformed JSON and invalid export contracts without input
mutation or abandoned temporary runner directories.

## Update dependencies

Use a separate private consumer containing a deliberately stale small package
and unrelated manifest fields. `deps` reads real registry metadata; record the
returned version rather than assuming what latest means. An explicit target is
an upper bound. `--latest` overrides that target.

Drive exact package, prefix and scope selection using installed manifest
entries; absent names must not be added. For example,
`deps kleur 4.1.5 --yes` updates a matching stale dependency under that cap and
skips installation. Verify unrelated fields and dependencies remain unchanged.
Use fresh fixtures for `--latest`, `--cwd` and `--silent`; silent suppresses
normal output but does not itself disable prompts.

In an owned PTY, drive package/version prompts, decline Apply and verify no
change; then accept Apply and decline installation. Cancellation also preserves
the manifest. Separately run `--yes --install` with an explicit detected package
manager in a disposable consumer, inspect its lockfile and installed version,
then clean only that consumer.

Check missing matches, already-current dependencies, malformed manifests and
missing specifications. A registry fetch failure can be logged with exit zero;
compare the requested package denominator with actual resolved updates before
claiming success.

## Preserve evidence and clean up

Copy the input, original output, deliberate stale output, final output and
command records into the Task artifact directory. Keep one readable index
linking each action to its result. Confirm that no compiler child or open file
handle remains, then remove only this run's consumer. Reopen the saved evidence
after cleanup.

Ordinary scoped CLI proof uses those raw logs and fingerprints. Regression's
exact-case closure needs its own receipt contract and Git-backed identity;
do not invent a substitute receipt or invoke it when the task forbids Git.
State the narrower claim and retain the evidence actually obtained.
