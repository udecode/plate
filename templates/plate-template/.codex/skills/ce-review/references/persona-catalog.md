# Persona Catalog

8 reviewer personas organized in two tiers, plus CE-specific agents. The orchestrator uses this catalog to select which reviewers to spawn for each review.

## Always-on (3 personas + 2 CE agents)

Spawned on every review regardless of diff content.

**Persona agents (structured JSON output):**

| Persona | Agent | Focus |
|---------|-------|-------|
| `correctness` | `compound-engineering:review:correctness-reviewer` | Logic errors, edge cases, state bugs, error propagation, intent compliance |
| `testing` | `compound-engineering:review:testing-reviewer` | Coverage gaps, weak assertions, brittle tests, missing edge case tests |
| `maintainability` | `compound-engineering:review:maintainability-reviewer` | Coupling, complexity, naming, dead code, premature abstraction |

**CE agents (unstructured output, synthesized separately):**

| Agent | Focus |
|-------|-------|
| `compound-engineering:review:agent-native-reviewer` | Verify new features are agent-accessible |
| `compound-engineering:research:learnings-researcher` | Search docs/solutions/ for past issues related to this PR's modules and patterns |

## Conditional (5 personas)

Spawned when the orchestrator identifies relevant patterns in the diff. The orchestrator reads the full diff and reasons about selection -- this is agent judgment, not keyword matching.

| Persona | Agent | Select when diff touches... |
|---------|-------|---------------------------|
| `security` | `compound-engineering:review:security-reviewer` | Auth middleware, public endpoints, user input handling, permission checks, secrets management |
| `performance` | `compound-engineering:review:performance-reviewer` | Database queries, ORM calls, loop-heavy data transforms, caching layers, async/concurrent code |
| `api-contract` | `compound-engineering:review:api-contract-reviewer` | Route definitions, serializer/interface changes, event schemas, exported type signatures, API versioning |
| `data-migrations` | `compound-engineering:review:data-migrations-reviewer` | Migration files, schema changes, backfill scripts, data transformations |
| `reliability` | `compound-engineering:review:reliability-reviewer` | Error handling, retry logic, circuit breakers, timeouts, background jobs, async handlers, health checks |

## CE Conditional Agents (migration-specific)

These CE-native agents provide specialized analysis beyond what the persona agents cover. Spawn them when the diff includes database migrations, schema.rb, or data backfills.

| Agent | Focus |
|-------|-------|
| `compound-engineering:review:schema-drift-detector` | Cross-references schema.rb changes against included migrations to catch unrelated drift |
| `compound-engineering:review:deployment-verification-agent` | Produces Go/No-Go deployment checklist with SQL verification queries and rollback procedures |

## Selection rules

1. **Always spawn all 3 always-on personas** plus the 2 CE always-on agents.
2. **For each conditional persona**, the orchestrator reads the diff and decides whether the persona's domain is relevant. This is a judgment call, not a keyword match.
3. **For CE conditional agents**, spawn when the diff includes migration files (`db/migrate/*.rb`, `db/schema.rb`) or data backfill scripts.
4. **Announce the team** before spawning with a one-line justification per conditional reviewer selected.
