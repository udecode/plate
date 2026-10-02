# e2e (tester-army/e2e) research shard

Subject: the `e2e` npm package, 0.15.2, Apache-2.0. Clone `/Users/zbeyens/git/e2e` at `c6c39ad3f631cc0a29d788af7d8e6b798ef5307c` (2026-10-02). Every `path:line` below is at that commit unless it names another repository. Plate citations are at `/Users/zbeyens/git/plate-2` `cf1572560313960e87226640b93f73f2486c9aab`. agent-device citations are from `npm pack agent-device@0.21.18` (the exact version `packages/mobile/package.json:63` pins), unpacked in this scratch directory; its `dist` is minified, so those citations name the file and the quoted string.

Grades. A means source read. B means an issue, PR or changelog. C means docs or the live site. D means a claim with no proof found.

Nothing was run. Every behavioral claim below comes from reading. Where a claim goes past what the code says, it is marked inferred.

## 1. Architecture

**Packages.** Six published packages [A, `README.md:45-52`, `AGENTS.md:37-78`].

| Package | Role |
| --- | --- |
| `e2e` | SDK, runner, CLI, the `e2e/engine` contract, the agent, the replay cache, MCP server, OAuth model sign-in. Core never names an engine (`AGENTS.md:37-46`). |
| `@e2e-dev/web` | Browser engine on Playwright (peer `playwright >=1.63.0 <2`, `packages/web/package.json:56`). Chromium, Firefox, WebKit. |
| `@e2e-dev/mobile` | iOS simulator and Android emulator engine on `agent-device` 0.21.18 (`packages/mobile/package.json:63`). |
| `@e2e-dev/kernel` | Not a framework kernel. A `BrowserProvider` for Kernel (kernel.sh) hosted Chromium (`packages/kernel/README.md:1-30`, `AGENTS.md:68-74`). |
| `@e2e-dev/eas` | A `DeviceProvider` for Expo EAS hosted simulators and emulators, over Expo's GraphQL API (`AGENTS.md:75-78`, `packages/eas/src/client.ts:8`). |
| `@e2e-dev/github` | Reporter that posts one PR comment per run and writes the job summary (`packages/github/README.md:1-30`). |

**Web engine runtime.** Playwright, plus raw CDP only for attaching to a remote Chromium (`connect.cdpEndpoint`) [A]. The engine is built with the public `defineEngine` (`packages/web/src/engine.ts:98-151`). Locators project onto Playwright locators (`packages/web/src/locators.ts:1`). The agent's semantic tree comes from e2e's own in-page reader, a serialized function (`packages/web/src/in-page/read-semantics.ts:1-28`), cross-checked against Chrome's CDP accessibility tree and Playwright `getByRole` (`AGENTS.md:266-297`).

**Mobile engine runtime.** agent-device (Callstack), which drives an XCTest runner on iOS and adb/UIAutomator plus helper APKs on Android [A, `packages/mobile/src/engine.ts:10,21-65`; agent-device `dist/src/boot-diagnostics.js` "XCTest runner", `android/ime-helper/dist/*.manifest.json`]. Native apps only. A target with `app.url` is rejected with `INVALID_CONFIG`, "a mobile() target cannot open a website in the device's browser yet" [A, `packages/mobile/src/engine.ts:93-100`; C, `packages/mobile/README.md:63`]. No Appium, no Maestro, no direct XCUITest in e2e itself (not found after `git grep -i "appium\|maestro"` in `packages/*/src`; Maestro appears only as a migration guide, `docs/migrate/maestro.mdx`).

**Custom engine API.** A third party implements `Engine` and passes it to `defineEngine` from `e2e/engine` [A, `packages/e2e/src/engine/index.ts:606-783`, `packages/e2e/src/engine/manifest.ts:155`]. Required members are `name`, `version` (keys the replay cache) and `spiVersion: 1`. Everything else is optional and its presence computes a capability (`manifest.ts:194-230`).

- `observe(ctx, opts) -> EngineSnapshot` returns a `SemanticNode` tree with role, name, text, value, selection, testId, states, rect, attributes (`packages/e2e/src/engine/contract.ts:130-205`).
- `locate(expression, ctx)` returns current matches once, with no retry. The runner owns polling and strictness (`engine/index.ts:670-678`).
- `perform(ref, action, ctx)` plus `actions` takes a closed `LocatorAction` union of 16 kinds: tap, doubleTap, secondaryTap, longPress, fill, clear, press, check, uncheck, focus, hover, scrollIntoView, selectOption, setInputFiles, dragTo, swipe (`contract.ts:248-300`).
- `performAt(point, action)` plus `pointerActions` for coordinate actions (`contract.ts:315-324`).
- `keyboard: { type(text, {replace}), press(key), dismiss? }`. `type` must dispatch real key events (`engine/index.ts:109-132`).
- `session: { open, back, restart, reset }`, `state`, `artifacts`, lifecycle hooks `prepare`, `init`, `startAttempt`, `settleAttempt`, `endAttempt`, `dispose`, `finish`, and `fixtures` (`engine/index.ts:707-783`).
- A literal spec with an unknown key fails (`manifest.ts:175-184`).

## 2. Test API

**Fixtures.** Core fixtures are `agent`, `app`, `screen`, `platform`, and `session` in setup tests [A/C, `docs/reference/test.mdx:300-323`, `packages/e2e/src/types.ts:565`]. Engines contribute more. The web engine adds `browser` (`packages/web/src/engine.ts:148-150`), the mobile engine adds `device` (`packages/mobile/src/engine.ts:59-61`). `test.extend` adds user fixtures with Playwright-style `use` (`docs/reference/test.mdx:337-421`).

**Relation to Playwright.** `expect` is e2e's own runner-owned polling, not Playwright's [A, `packages/e2e/src/expect/async.ts:1`]. Value matchers reuse `@vitest/expect` equality (`packages/e2e/src/expect/values.ts:4`). `screen` queries are e2e's own locator AST with six kinds: role, label, placeholder, text, displayValue, testId (`contract.ts:53`). The web engine compiles them to Playwright locators. Name matching is exact by default, unlike Playwright's case-insensitive substring [C, `docs/migrate/playwright.mdx:415`]. `browser.locator(selector)` exposes Playwright selector strings (`packages/web/src/browser.ts:184`). `expect.extend` does not exist [C, `docs/reference/expect.mdx:362-367`].

**Agentic steps.** `agent.act` runs a tool loop over the engine's declared verbs, with budgets of 25 model calls and 25 actions and a 120 s timeout. `assert` and `extract` make one judgment plus one repair call. `waitFor` polls with model calls only when the screen changes [C, `docs/reference/agent.mdx:37-42`, `docs/agent-steps.mdx:96-102`]. A judgment sees only the instruction and the current screen, never the prior-step ledger [A/C, `AGENTS.md:373-378`, `docs/agent-steps.mdx:32-34`].

**What the agent sees.** A redacted text snapshot of roles, names, text, states, then diffs after each action. Screenshots only with `vision: true` or when the agent asks [C, `docs/agent-steps.mdx:19-39`]. No raw HTML, no DOM. For a `contenteditable` host, the node is one `textbox` whose blocks are its content (`read-semantics.ts:132-145`). The node carries `selection="..."` only for a non-collapsed selection, so a collapsed caret's position is invisible in text mode [A, `read-semantics.ts:710-729`; C, `docs/reference/agent.mdx:129-138`].

**How deterministic a step is.** Locator actions and `expect` are deterministic. `act` is deterministic only on a full replay. `assert`, `waitFor` and `extract` always call the model [C, `docs/cache.mdx:11`, `docs/index.mdx:60-62`].

**Typing semantics that matter for an editor.** The agent's targeted `type({target, value})` dispatches `fill` [A, `packages/e2e/src/agent/action-dispatcher.ts:336-344`]. The web engine runs `fill` as Playwright `locator.fill` (`packages/web/src/actions.ts:52-54`). Untargeted `type` runs `page.keyboard.type`, which sends per-character key events (`packages/web/src/surface.ts:750-771`, `action-dispatcher.ts:148-156`). Plate's own harness forbids `locator.fill()` as editor proof because it can bypass `beforeinput` and selection import [A, plate-2 `packages/test/README.md:128`]. The committed rich-text recording opens with exactly that targeted `type` into `textbox "editor"` [A, `apps/web-benchmark/.e2e/cache/16433aa0d367e6f0dfe2857d4621edd499a5f4343337c8803c316fde3eb9da45.json`].

## 3. Caching and replay

**Mechanism.** After an `act` passes and a later verification step passes in the same attempt, the runner saves the ordered grammar actions [A/C, `docs/cache.mdx:95-118`, `packages/e2e/src/cache/trace.ts:1-17`]. Counted as verification are locator matchers, engine assertions, `locator.waitFor`, `agent.assert` and `agent.waitFor`. `expect(value)`, `expect.poll` and reads do not count (`docs/cache.mdx:101-106`). An engine fixture method declared as an assertion verifies by default (`engine/index.ts:180-187`).

**Key.** SHA-256 over JCS of `{specVersion, cacheSchema 'trace-1', sha256(projectId), testId, targetId, platform, engineName, engine major.minor, engineSpiVersion, kind 'act', callIndex per signature, instructionDigest, paramsDigest, appIdentity, policyVersion}` [A, `packages/e2e/src/cache/identity.ts:27-45,64-67,154-184`]. The model and the executor are not in the key (`identity.ts:10-13`, `docs/cache.mdx:63-68`). `unique()` marks run-varying params (`docs/cache.mdx:70-88`).

**Storage.** One pretty-printed JSON file per key under `.e2e/cache/<sha256>.json`, mode 0600, atomic rename, 1 MiB cap, no locking [A, `packages/e2e/src/cache/store.ts:1-15,23-24,98-110`]. Entries hold actions with semantic target descriptors (role, name, text, testId, placeholder, selector, within, position), typed values verbatim, a summary, start and end path, and up to 8 end anchors. No prompts or screenshots [A, `trace.ts:100-126,311-328`, anchors cap `trace.ts:50`; C, `docs/cache.mdx:175-185`]. `CacheStore` is an interface "so a remote store, the cloud's shared cache, can replace the filesystem" (`store.ts:13-14`).

**Replay and divergence.** Replay checks the start route (`packages/e2e/src/cache/decide.ts:42-50`). It re-finds each target on a fresh observation, waits up to 15 s per target, then checks end anchors [A, `packages/e2e/src/agent/replay.ts:31-35`; C, `docs/cache.mdx:46-61`]. Any divergence before the first action is a miss. After that it is a hand-off, and the agent continues mid-step with a record of what ran (`replay.ts:1-13`). Reasons are `no-entry`, `retry`, `invalid-entry`, `truncated`, `wrong-context`, `target-not-found`, `target-ambiguous`, `gap`, `action-failed`, `action-uncertain`, `viewport-changed`, `end-mismatch` (`docs/cache.mdx:140-155`). Retries never replay (`decide.ts:24-28`). A mutating project tool or a value read off the screen leaves a `gap` that runs live (`trace.ts:291-310`, `docs/tools.mdx:59-61`).

**Determinism guarantees and known holes.** A failing attempt deletes implicated entries (`docs/cache.mdx:120-122`). `--strict-cache` turns a stale recording into `REPLAY_STALE` with no model call (`docs/cache.mdx:235-269`). The end check accepts an empty anchor set as proof at HEAD [A, `replay.ts:361-366`]. Issue #686 lists eight repros where anchors "prove presence, not effect", including a same-node text mutation, the editor case [B]. Issue #685 lists key gaps where agentContext, account, query string, origin and numeric ids are not in the key [B]. Both were closed on 2026-10-02 as "Moved to our internal tracker", not fixed [B, gh issue view 685, 686].

**CI behavior without a model key.** CI demotes the defaulted cache mode to `read-only` [A, `packages/e2e/src/config/resolve.ts:326,394`]. Model preflight checks only that a model is configured, "without a live request" [A, `packages/e2e/src/run/worker-models.ts:1-8,28-43`]. So with a model configured and no key, fully replayed `act` steps pass. Every judgment, miss and hand-off fails with `MODEL_PROVIDER_FAILED` [C, `docs/ci.mdx:173-178`; inferred for the exact code path]. A failure where no model answered leaves recordings in place (`docs/cache.mdx:124-136`). With no model configured at all, the first `agent` acquisition aborts the run with `MODEL_UNAVAILABLE`, exit 2 (`AGENTS.md:377-379`).

## 4. Cost and speed

- Per-test model calls are bounded by the budgets above. A full replay is 0 calls for that `act`. Each `assert` is 1 to 2 calls on every run [C, `docs/reference/agent.mdx:37-42`].
- No runtime or cost numbers on the site or docs index. The site claims "Fewer tokens. Lower costs." [D, tester.army/e2e fetched 2026-10-02; not found in `docs/index.mdx:36-47`].
- Measured in their own CI, per a maintainer comment on issue #500: iOS agentic suite 590 s, Android agentic 579 s, with cache stats such as "7 replayed, 4 handed off, 7 missed", one Android test taking 179 s and 307k tokens on a first attempt [B, gh issue 500 comments]. The rich-text recording logs `endWaitMs: 12292` [A, the recording file above].
- Parallelism uses `workers`. The default is 1 in CI and half the cores locally, capped by an engine's `workers` [C, `docs/reference/config.mdx:99,983`; A, `engine/index.ts:627-634`].
- CI integration is a plain `npx e2e run` job, JUnit output, and `@e2e-dev/github` for PR comments [C, `docs/ci.mdx:10-66`]. Fork PRs get no key [C, `docs/ci.mdx:175-176`; `AGENTS.md:365-366`].
- EAS: `easSimulators()` leases one hosted Expo simulator or emulator per worker slot through the agent-device daemon EAS runs [C, `packages/eas/README.md:13-45`].

## 5. Extensibility for an editor

**(a) Model oracle fixture.** Possible, with two paths.
- Cheap path. `browser.evaluate(fn)` returns JSON values from the page (`packages/web/src/browser.ts:188-192,315-328`). A test can read the editor model through the root handle. But `expect.poll` on that value does not count as cache verification (`docs/cache.mdx:103-104`).
- Proper path. An engine-contributed fixture built with `context.fixture` and `context.expectable`, so `expect(editor).toHaveSelection()` records as an assertion step that verifies [A, `engine/index.ts:197-243`]. A test-file fixture cannot reach the live page. Test modules load in isolated tsx realms (`packages/e2e/src/internal/realm-slot.ts:1-6`), `surfaceOf` keys a module-level WeakMap (`packages/web/src/engine.ts:30,45-50`), and the docs say raw `Page` is for custom executors only (`docs/migrate/playwright.mdx:400-403`). So the Plate route is a wrapper engine, `defineEngine({ ...webHandle minus capabilities, name, version, fixtures: { ...webHandle.fixtures, editor } })`, with `surfaceOf(webHandle).page()` inside the fixture. Inferred from `manifest.ts:151-184`. Not run.

**(b) Custom deterministic actions.**
- Real key sequences work through `browser.keyboard.press/type` (`browser.ts:219-225`). There is no `keyboard.down/up` and no `insertText`.
- Drag works through `dragTo` and `browser.mouse.down/move/up` (`actions.ts:96-108`, `browser.ts:231-240`).
- CDP IME composition is not exposed. It needs the Playwright `Page` via `surfaceOf`, then `newCDPSession`, which is how Plate does it (plate-2 `packages/test/src/playwright/ime.ts:309-319`).
- Clipboard paste with formats has no API (not found after `grep -n clipboard packages/web/src/*.ts`).

**(c) Custom matchers.** Only engine fixtures through `expectable` (`docs/reference/expect.mdx:43-46`). No `expect.extend` (`expect.mdx:362-367`).

**Extension points, in full.**
- Engines (`defineEngine`).
- Provider seams (`BrowserProvider`, `DeviceProvider`).
- Engine fixtures with `expectable`.
- `test.extend` fixtures.
- Project tools for the agent (`defineTool` with `mutates` and `platforms`, `docs/tools.mdx:6-63`).
- Custom executors (`createToolLoopExecutor`, or a full `StepExecutor` with `ctx.actions`, `ctx.observe`, `ctx.replayedPrefix`, `docs/executors.mdx:1-224`).
- Custom `cache.store` (`store.ts:34-46`).
- Reporters.

A mutating tool always replays as a live gap (`docs/tools.mdx:61`). An IME tool exposed to the agent would therefore cost a model call on every run.

## 6. Mobile web

No supported path. `app.url` on a mobile target is `INVALID_CONFIG` [A, `packages/mobile/src/engine.ts:93-100`].

An unsupported workaround may exist. Pin `bundleId: 'com.android.chrome'` or Safari and call `device.openLink(url, { app })`. Android starts a VIEW intent on that package [A, `packages/mobile/src/surface.ts:763-790`; C, `docs/reference/mobile.mdx:286-295`]. That would drive the browser through its native accessibility tree. Inferred, never run, and not documented as a use case.

Even then, the real soft keyboard is not exercised.
- Device typing calls agent-device `interactions.type` (`packages/mobile/src/surface.ts:1242-1247`).
- On an emulator, agent-device swaps in its own headless test IME, `com.callstack.agentdevice.imehelper/.TestInputMethodService`, by default. The IME takes text by broadcast [A, agent-device `android/ime-helper/dist/agent-device-android-ime-helper-0.21.18.manifest.json`; `dist/src/mechanics.js` action `ACTION_INPUT_TEXT_B64`; `dist/src/back-mode.js` flag text "default on for emulators; opt-in on real devices"].
- With the real keyboard kept, the fallback is adb-shell text that "supports ASCII text only" (`dist/src/mechanics.js`).
- agent-device's own help treats Gboard as an obstacle to work around (`dist/src/cli-help.js` line 416, "Text-entry quirks").
- e2e exposes no option to change any of this (not found after `grep -rni testIme packages/mobile/src`).
- Physical devices are reachable only through a hosted `DeviceProvider` daemon [C, `docs/mobile.mdx:141-150`].

Verdict. e2e cannot close Plate's Android Gboard, iOS Safari or screen-reader gates (no screen-reader support found after `git grep -i "voiceover\|talkback\|nvda"`).

## 7. Agent skills

`skills/e2e/` ships `SKILL.md` and eight topic references: setup, writing-tests, agent, running, explore, debugging, mcp, bug-bash [A, `skills/e2e/SKILL.md:57-75`]. `e2e init` writes it to `.agents/skills/e2e/` and `.claude/skills/e2e/`, and registers `e2e mcp` in `.mcp.json` [C, `docs/coding-agents.mdx:6-58`].

The skill's workflow:
1. Read the config.
2. Learn names through `e2e mcp` `observe`/`locate`.
3. Write one `act` per goal, then an `expect`.
4. Run one file.
5. Read `.e2e/report.json` or the failure pages.

[A, `SKILL.md:77-97`]. The MCP server gives a coding agent live sessions with `observe`, verbs, `locate` returning `screen.*` code, screenshots and recording [C, `docs/reference/mcp.mdx:70-135`].

Overlap with Plate's `verify` skill. Both drive a real artifact. e2e's sessions see only accessibility text or pixels, never the editor model, so they cannot replace `@platejs/test` assertions.

One conflict. The skill tells agents to run `npx e2e feedback` to "tell the e2e team" (`SKILL.md:135-152`). That command posts to PostHog (`packages/e2e/src/cli/feedback.ts:20,138`). It is an outbound message, and Plate's AGENTS.md Messages rule forbids sending one without authorization.

## 8. Maturity

- Commits and cadence: 552 commits. The first is 2026-07-22. 499 of them landed in 2026-09 [A, `git log` counts]. 1197 stars and 39 forks [gh repo view 2026-10-02].
- Contributors: one maintainer wrote 483 of 552 commits under two emails. Bots wrote 45 (dependabot 22, devin-ai-integration 21) [A, `git shortlog -sne`].
- Issues: 98 issues, 5 open. Recent open bugs include #749 (an icon-only control is missing from the semantic tree) and #746 (`e2e mcp` fails without the optional `ai` package). The two cache-correctness issues were closed by moving them to a private tracker (#685, #686) [B].
- Framework tests: 230 test files and about 57.7k test lines against 53.1k source lines in `e2e`; 48 test files in `web` [A, `git ls-files`]. No coverage percentage is measured (not found after grep in `vitest.config.ts` and `spec.yml`). Strong oracle work: a crosscheck against CDP and Playwright, an axe-core conformance corpus, golden device trees, committed recordings under `--strict-cache` (`AGENTS.md:266-351,359-372`).
- Breaking-change rate: 0.2.0 shipped on 2026-09-04 and 0.15.2 on 2026-10-02, so 14 minors in 28 days. "APIs and config can still change between minor releases" [B/C, `packages/e2e/CHANGELOG.md`; `README.md:80-81`]. `createAgent` was removed (`CHANGELOG.md:111`). The scope was renamed `@e2edev` to `@e2e-dev` on 2026-09-28 (`AGENTS.md:504-514`). The landing page still shows the removed `createAgent` and `web({ url })` [C, tester.army/e2e fetched 2026-10-02].
- Telemetry: on by default, sent to PostHog EU [A, `packages/e2e/src/telemetry/posthog.ts:14`; `telemetry.ts:10-24`]. Opt out with `E2E_TELEMETRY_DISABLED`, `DO_NOT_TRACK` or `e2e telemetry disable`. It sends run counts, engines, model ids, token counts and error codes (`events.ts:194-249`). The project id is SHA-256 of the repository's root commit (`project.ts:7-16,36-44`). For a public repository like Plate anyone can compute that hash, so the id is pseudonymous, not anonymous (inferred). Other network calls are model providers, OAuth to ChatGPT, Copilot and xAI, Expo GraphQL and the GitHub API. No TesterArmy API (not found after grep for URLs and "tester.army" in `packages/*/src`).
- License: Apache-2.0 (`LICENSE`). The NOTICE is a 4-line attribution (`NOTICE`).

## 9. Risks

- Flakiness. Judgments run live every time. Their own CI saw flaky `agent.assert` vision judgments that passed on retry (#500 comment) [B]. Agentic assertions "must be model-portable" (`AGENTS.md:219-220`).
- Nondeterminism. A replay can self-finalize on an empty anchor set (`replay.ts:366`). The key ignores agentContext, account, query and origin (#685). Handed-off steps make live model choices.
- Secrets. The redaction model is strong (`AGENTS.md:382-425`). But typed values sit verbatim in committed recordings (`docs/cache.mdx:182-185`), and secret fills have no origin check (`AGENTS.md:400-402`).
- Vendor coupling. Low in code. The coupling sits in telemetry defaults, the feedback channel, a cache store seam designed for "the cloud's shared cache", and a private issue tracker. OAuth through `chatgpt.com/backend-api/codex/responses` (`packages/e2e/src/oauth/providers/openai.ts:22`) is a terms-of-service risk (inferred).
- Runtime mismatch. Node >=22.12 with tsx (`packages/e2e/package.json`), a separate runner from Plate's Bun tests.
- API churn. 14 breaking-capable minors in a month.

## Pressure on Plate

What e2e could observe or make cheaper than Plate's stack:

1. Goal-to-recording authoring. An agent turns "type X, bold exactly word Y" into a committed keyboard trace that replays at zero model cost. The benchmark recording shows the trace `type`, `Control+Shift+ArrowLeft`, `ArrowRight`, nine `Shift+ArrowLeft`, then `tap B` (the recording file above) [A]. Plate writes these by hand today.
2. Exploratory bug hunting. `e2e explore` and `bug-bash` run charters against a live app and prove findings with repro tests (`skills/e2e/SKILL.md:72-75`) [C]. That is cheap discovery on the Plate demo. It is not proof.
3. Triangulated accessibility-tree oracles. The pattern of engine tree against CDP AX tree against `getByRole`, with a reasoned expected-disagreement file (`AGENTS.md:266-297`) [A], is a cheap a11y-tree check Plate could copy. It is not screen-reader proof.
4. Committed recordings plus `--strict-cache` as a PR gate (`docs/cache.mdx:209-269`) [C]. This is a model for keeping agent-authored flows deterministic in CI.
5. One test across Chromium, Firefox, WebKit, iOS and Android native targets [C, `docs/index.mdx:51-55`]. Plate gets only the browser half, which its Playwright suites already have.

What e2e cannot do for Plate:

1. Read or assert the editor model, selection paths or focus owner natively. It needs a custom wrapper engine. Its agent cannot see a collapsed caret (`read-semantics.ts:710-729`) [A].
2. IME composition, clipboard formats or held modifier keys through supported APIs (`browser.ts:219-240`) [A].
3. Mobile web, real Gboard composition, iOS Safari or screen readers (`packages/mobile/src/engine.ts:93-100`; the agent-device test IME) [A].
4. Trustworthy agent typing into an editor. Targeted `type` is `locator.fill` (`action-dispatcher.ts:341`, `actions.ts:53`), which Plate bans as proof (plate-2 `packages/test/README.md:128`) [A].
5. Fast deterministic proof cheaper than Playwright. Its deterministic tier is a smaller wrapper over Playwright with exact-match locators. The time saved is only in authoring agentic flows. Inferred.
