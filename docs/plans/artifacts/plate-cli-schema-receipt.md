# Generated schema artifact receipt

The autoreview wrapper temporarily parks these untracked generated JSON files
because its secret scanner rejects files larger than its safety ceiling. They
exist in the final checkout, are required by the registry items, and were
verified by `pnpm --dir apps/www editor:check` together with their generated
TypeScript partners.

| Path | Bytes | SHA-256 | Schema identity |
| --- | ---: | --- | --- |
| `apps/www/src/registry/components/editor/editor.schema.json` | 324843 | `d0f1d0872b28bcb57e1500c7ff00a3dfcbcf869894f99226239ff62d00928692` | `plate-www-editor@1`, `fnv1a64:6cce2b278ce25a3a` |
| `apps/www/src/registry/blocks/editor-ai/components/editor/editor.schema.json` | 312268 | `4a031367144e232d10b6653d1b6f25bf5d475961a0bb63233697500a82a7542a` | `plate-www-ai-editor@1`, `fnv1a64:75eb80087458d9b6` |
| `apps/www/src/registry/examples/copilot-editor.schema.json` | 324797 | `c38ec05773151eeb7b2e5bd8c735eea02d6ec2abc2eef2ae55cc90de7501505c` | derived, `fnv1a64:6cce2b278ce25a3a` |

Parking these files for review is not deletion and does not remove them from
the final change. A shell trap restores all three before autoreview exits.
