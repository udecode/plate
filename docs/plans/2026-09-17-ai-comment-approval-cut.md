# AI Comment approval cut

Status: Complete

Objective:
Make each completed AI Comment result an ordinary published comment thread. Remove the separate Keep/Accept/Reject lifecycle while preserving request fencing for unresolved asynchronous creation.

Completion threshold:
The AI demo publishes generated comments immediately, completed comments survive Stop, close, retry, and request replacement, unresolved work cannot leak from a retired request, and no AI comment review prompt remains.

Verification surface:
Focused lifecycle tests, the AI browser suite, source type checks, registry generation, doctrine checks, and the real Chrome interaction on `/blocks/ai-demo`.

Constraints:
- Keep document edit generation on its existing Accept/Discard preview lifecycle.
- Keep manual comment composer drafts; they serve a separate user job.
- Do not publish Git or external changes.

Boundaries:
The change owns AI Comment transport integration, its demo UI, focused tests, current docs/doctrine, and generated registry output. It does not redesign the generic Comments API or document-edit AI previews.

Blocked condition:
The target is blocked only if the existing Comments API cannot atomically publish a just-created draft or if the real AI route cannot be exercised locally.

Work Checklist:
- [x] Replace request-owned review drafts with private in-flight staging followed by immediate publication.
- [x] Remove the AI Comment approval UI and retain compact failure recovery.
- [x] Rewrite lifecycle and browser proof around normal published threads and retirement races.
- [x] Update durable AI ownership doctrine and the registry changelog.
- [x] Regenerate registry output and run focused, closure, and real Chrome verification.

Verification evidence:
- `pnpm exec bun test` on the five affected AI lifecycle/Markdown files: 49 passed.
- Fresh managed Chromium replay of `ai-session.spec.ts`: 16 passed. Final-source focused replay of the four Comment scenarios plus the dedicated Comments scenario: 5 passed.
- Native Chrome on `/blocks/ai-demo`: Comment generated one ordinary published thread with Resolve, More actions, and Reply controls; no approval prompt; zero browser console errors.
- `pnpm --filter www build:registry`, registry source parity, and registry changelog generation/check passed. Tracked source and generated registry output contain no approval owner or review selector.
- Focused Ultracite formatting/lint passed for all changed TypeScript and browser files.
- The `www` source typecheck reaches one unrelated existing error at `apps/www/src/registry/examples/playground-demo.tsx:60` (`splice` on a readonly value). Its package-integration partition reaches two unrelated existing history inference errors at `editor-api-inference.contract.ts:37,44`; no changed-file diagnostic remains.
- Changeset: N/A for this registry-only behavior cut. The registry changelog entry is the release artifact.

Open risks:
Provider-specific malformed Comment payloads remain outside this bounded demo and lifecycle proof. The repository-wide typecheck remains blocked by the unrelated diagnostics recorded above.

Next step:
No implementation work remains. Publication was not authorized.
