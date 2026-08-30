---
description: Analyze one or two bug videos or a short bug description from Plate next/Beta testing, treat a two-video report as a main normal baseline versus current next/Beta bug comparison, derive reproducible steps, decide whether fresh recording adds evidence, delegate isolated browser recording to the global recording-browser-repros skill, upload videos through a documented storage API, and create verified [Beta] issues in udecode/plate through the REST API. Invoking this skill authorizes direct issue publication without a second confirmation unless the user explicitly requests analysis or drafting only.
name: github-issue-reporter
metadata:
  skiller:
    source: .agents/rules/github-issue-reporter.mdc
---

# GitHub Issue Reporter

Turn incomplete Plate `next`/Beta bug evidence into one concise, reproducible
`udecode/plate` GitHub issue. Invoking this skill is explicit authority to
analyze the supplied evidence, upload it, create the issue, and verify the
published result in one run. Do not ask for another confirmation or pause after
showing a draft.

An explicit instruction such as `draft only`, `analyze only`, or
`do not publish` overrides that default and keeps the run read-only.

## Beta-only scope

- Use this skill only for Plate `next` branch and Beta release testing.
- Target `udecode/plate`. Stop and route to another issue workflow when the
  report targets `main`, a stable release, or another repository.
- In a two-video Beta report, allow the `main` recording only as the normal
  comparison baseline; the reported bug still targets the current `next` lane.
- Treat the testing lane as confirmed Beta context even when the exact `next`
  commit or Beta package version is unknown. Record unknown build details as
  `NOT_ENOUGH_INFO`; do not downgrade the report to a generic bug.
- Start every issue title with `[Beta]: `. Never emit or publish `[Bug]` from
  this skill, including when the repository bug form supplies that prefix.

## Hard boundaries

- Never upload evidence or create an issue when the user explicitly says
  `draft only`, `analyze only`, or `do not publish`.
- Never publish to a repository other than `udecode/plate` from this skill.
- Never publish a title that does not start with `[Beta]: `.
- Never expose tokens, cookies, passwords, private URLs, or sensitive typed
  text in video, logs, transcripts, commands, or issue bodies.
- Never publish private-repository evidence to a public object store without a
  separate explicit `--allow-public-video` decision.
- Never use GitHub's undocumented web upload endpoints. The public Issues REST
  API does not expose native attachment upload. Read
  [references/github-api-boundaries.md](references/github-api-boundaries.md)
  before publishing media.
- Never put a native `github.com/user-attachments` URL inside inline code or a
  fenced code block. GitHub renders it as code instead of issue media.
- Never move, rewrite, duplicate, or remove a freshly saved native attachment
  URL through the Issues REST API. Keep the Chrome-inserted Markdown at its
  final body location; an API body rewrite can break the attachment binding.
- Never create a GitHub Release merely to host issue evidence.
- Never attach to or focus the user's daily Chrome for automated recording.
  Use an isolated, headless Playwright MCP browser.
- Never claim expected behavior from appearance alone. Ground it in the
  supplied comparison video, product docs, a reference implementation, tests,
  source, or a clearly labeled user statement.
- Make a lightweight evidence-based attempt to distinguish the `main` and
  `next` recordings before asking. Prefer explicit labels or branch/build
  metadata; otherwise use the behavioral delta: normal behavior is the likely
  `main` baseline and the regression is the likely `next` recording. Ask the
  user only when the available evidence does not support a reliable mapping.
- Never infer branch roles from input order, filename, resolution, crop, zoom,
  framing, or composition.
- Never invent presentation roles such as `wide`, `close-up`, `overview`, or
  `detail` for the two recordings. Label them only by verified branch and
  behavior role.
- Stop before public mutation when expected behavior, repository, or repro is
  materially ambiguous.

## Intake decision tree

### Two videos

1. Run `scripts/prepare-video-evidence.sh` for each video.
2. If `video-transcripts` is available, load it and generate one normalized
   transcript per video. Otherwise inspect the generated metadata, contact
   sheets, and relevant frames; state that audio/timeline transcription was
   unavailable.
3. Treat exactly two supplied recordings as the standard Beta comparison: one
   records normal behavior on `main`; the other records the current bug on `next`.
4. Establish the file-to-branch mapping with a simple evidence pass. First use
   explicit user labels or verified branch/build metadata. When those are
   absent, compare the behavior: the recording that works normally is the
   likely `main` baseline, and the recording showing the reported regression is
   the likely current `next` build. Record this as an inference rather than a
   verified build fact.
5. If the behavior is ambiguous, both recordings appear normal/broken, or the
   evidence otherwise cannot distinguish them reliably, ask exactly one
   focused question: which file is from `main`, and which is from `next`?
6. Use `main — normal behavior (expected baseline)` and
   `next — current Beta bug (actual behavior)` as the attachment roles. Do not
   replace these with camera or composition descriptions such as wide,
   close-up, overview, detail, zoomed, or full-screen.
7. Produce one merged repro: shared setup, action where behavior diverges,
   expected result, actual result, and timestamps from both videos.
8. Preserve the two source videos as separate publication artifacts. Merge clips only when the user explicitly requests a combined comparison or a documented hosting limit requires it; record that exception in the issue.

### One failure video

1. Prepare and inspect the evidence as above.
2. Extract visible setup, exact actions, cursor direction, keys, timing, error
   text, and final state.
3. Derive expected behavior from repo docs/tests/source or the user's statement.
4. Ask only for a fact that materially changes the issue. Do not ask for data
   already visible in the recording.

### Text-only description

1. Inspect the `udecode/plate` route, exact `next` commit or Beta package
   version, issue templates, and nearby duplicate issues when available.
2. Do not record when text plus deterministic console/test/source evidence gives
   an unambiguous minimal repro.
3. Record when motion or visual timing is the evidence: drag-and-drop, focus,
   selection, hover, scroll, animation, pointer direction, intermittent UI,
   or a difference that prose cannot establish cleanly.
4. If recording would add no material signal, say so and continue without it.

## Build the evidence packet

Keep observed facts separate from inference. Record:

- target repository (`udecode/plate`) and route
- testing lane (`next`/Beta), plus exact commit, package version, browser, and
  OS only when known
- shortest setup and repro steps
- expected behavior and its authority
- actual behavior and visible error text
- reproducibility: always, intermittent, or unknown
- video timestamps, verified `main`/`next` role, and public evidence URLs
- caveats and missing facts

Search open and closed issues for a duplicate before publishing. A similar
title is not enough; compare trigger, affected surface, and actual behavior.

## Decide whether to record

Use the global `recording-browser-repros` skill when fresh recording adds
material evidence. Read
`~/.codex/skills/recording-browser-repros/SKILL.md` and follow its shot-plan,
safety, recording, and verification workflow. The global skill owns the
recorder scripts, interaction overlay, schema, and example; do not duplicate
or locally modify those mechanics here.

For Plate issue evidence, prefer 10–30 seconds:

1. Establish the route and starting state.
2. Show each action with a short top caption.
3. Show explicit harmless keys in a large center HUD.
4. Show pointer trail, click ripple, drag arrow/distance, and scroll direction.
5. Hold the failure state long enough to read.

After recording:

```bash
bash .agents/skills/github-issue-reporter/scripts/prepare-video-evidence.sh \
  /absolute/path/to/repro.mp4 \
  --output /absolute/path/to/evidence
```

Inspect the key, pointer/drag, failure, and final frames. Re-record if captions
are unreadable, a required action is missing, or the video contains unrelated
private information.

## Draft the issue

Use the repository's current bug template when required, unless the user says
not to. Otherwise use [assets/issue-body.md](assets/issue-body.md). Override the
bug form's default title prefix. Keep the title behavioral and searchable. Do
not include implementation guesses as facts.

Start every title with `[Beta]: `. Never use `[Bug]`, even when the repository
classifies the issue with a `bug` label or its bug-report template supplies the
prefix.

The body must contain:

- concise summary
- Plate `next`/Beta testing lane and exact build details when verified
- minimal reproduction steps
- expected behavior with authority
- actual behavior
- environment only when verified
- evidence links with timestamp notes
- caveat when any classification is inferred

Write the title and body to local files before mutation. Unless the user
explicitly opted out of publication, continue directly through upload, issue
creation, and verification without showing the draft for approval or asking
for another confirmation. Show the draft and stop only for an explicit
read-only request or when a hard boundary above is hit.

## Native Chrome attachment flow

Use this flow only when an API-backed object store is unavailable or the user
requires a native `github.com/user-attachments` URL.

1. Read the current raw body and rendered HTML before mutation. Treat an
   attachment inside `<pre>` or `<code>` as not published, even when its URL
   temporarily returns HTTP 200.
2. Compose the final body structure before uploading. GitHub Issue Forms may
   wrap fields such as logs in fenced code blocks; choose a standalone Markdown
   line outside every fence for the attachment.
3. Open the issue or issue form in authenticated Chrome, place the caret at the
   final attachment location, and upload through GitHub's documented file
   picker. Keep the generated attachment Markdown exactly where Chrome inserts
   it and save through the web UI.
4. Do not clean up, reposition, or normalize the saved attachment with
   `gh api`, the Issues REST API, or another body rewrite. Read-only API checks
   remain allowed. If any later body edit occurs, discard all earlier media
   verification and run the full final verification again.
5. Verify only after the final save:
   - the raw API body contains exactly the intended number of final attachment
     URLs and no obsolete URL;
   - rendered issue HTML does not place any final URL inside `<pre>` or
     `<code>`;
   - a fresh Chrome reload visibly renders the intended number of attachment
     links or players;
   - an unauthenticated fetch for every attachment returns HTTP 200 with its
     expected media MIME type and byte size;
   - a second public fetch of every attachment after the Chrome reload and API
     readback still returns the same status, MIME type, and byte size.

To repair broken existing native attachments, edit the issue body in Chrome,
remove obsolete URLs before uploading, upload every source file at its final
outside-fence labeled location, and save once. Do not create a replacement
issue and do not mutate the body through REST after the upload.

### Chrome local-file fallback

Chrome automation can open GitHub's file chooser but fail at
`fileChooser.setFiles` with `Not allowed` when the ChatGPT browser extension
does not have **Allow access to file URLs** enabled. Treat that error as a local
browser-permission limitation, not as a bad video or failed GitHub upload.

1. Tell the user the standard fix: open `chrome://extensions`, open **Details**
   for the ChatGPT browser extension, and enable **Allow access to file URLs**.
   Do not change that extension permission without the user's approval.
2. Skill invocation authorizes uploading the supplied evidence file to the
   target public issue. Prefer the existing native chooser as a non-permission
   fallback without asking for another confirmation:
   - use Computer Use to click the issue body's **Paste, drop, or click to add
     files** control;
   - in the macOS picker, press `Command+Shift+G`, enter the exact absolute
     source path, confirm the filename and preview metadata, then click
     **Open**;
   - wait until GitHub replaces the `Uploading "<filename>"...` placeholder
     with one `https://github.com/user-attachments/...` URL;
   - save only after the placeholder is gone and the final body contains
     exactly the intended attachment URL count.
3. If neither extension access nor the native picker is available, cancel the
   unsaved edit so the server body remains unchanged, keep the existing issue,
   and report the blocker. Never create a replacement issue or publish a
   rewritten body without the required evidence.
4. After either upload path succeeds, run the full final verification above.
   The fallback changes only how the local file reaches Chrome; it does not
   weaken raw-body, rendered-player, reload, MIME, size, or second-fetch gates.

## Upload and create through APIs

Configure an API-backed public object store:

```bash
export ISSUE_VIDEO_REMOTE='r2:public-bucket/issue-evidence'
export ISSUE_VIDEO_PUBLIC_BASE_URL='https://media.example.com/issue-evidence'
```

Or use a single-use presigned object-storage PUT URL without `rclone`:

```bash
export ISSUE_VIDEO_PRESIGNED_PUT_URL='<secret presigned HTTPS PUT URL>'
export ISSUE_VIDEO_PUBLIC_URL='https://media.example.com/issue-evidence/repro.mp4'
```

Treat the presigned PUT URL as a secret. The publisher never prints it.
Single-use presigned upload supports one video. Use the `rclone` backend for
the standard two-video comparison so both source recordings remain separate.

Preview the exact payload without upload or GitHub mutation:

```bash
bash .agents/skills/github-issue-reporter/scripts/publish-issue.sh \
  --repo udecode/plate \
  --title-file /absolute/path/to/title.txt \
  --body-file /absolute/path/to/body.md \
  --video /absolute/path/to/main.mp4 \
  --video-role 'main — normal behavior (expected baseline)' \
  --video /absolute/path/to/next.mp4 \
  --video-role 'next — current Beta bug (actual behavior)' \
  --dry-run
```

Skill invocation supplies public-mutation authority. Pass the publisher's
mechanical confirmation flag automatically; do not ask the user to confirm it:

```bash
bash .agents/skills/github-issue-reporter/scripts/publish-issue.sh \
  --repo udecode/plate \
  --title-file /absolute/path/to/title.txt \
  --body-file /absolute/path/to/body.md \
  --video /absolute/path/to/main.mp4 \
  --video-role 'main — normal behavior (expected baseline)' \
  --video /absolute/path/to/next.mp4 \
  --video-role 'next — current Beta bug (actual behavior)' \
  --confirm-create
```

For a private repository, add `--allow-public-video` only when the user has
explicitly approved making that evidence public. Otherwise use an access-
controlled storage URL or the native Chrome attachment flow.

The publisher must:

1. reject any repository other than `udecode/plate` and any title not starting
   with `[Beta]: ` before upload or issue creation;
2. validate `gh`, the selected `rclone` or presigned-PUT backend,
   authentication, video metadata, completed issue fields, repository
   visibility, and repository access;
3. upload every supplied video through the configured storage API before issue
   creation, using collision-resistant object keys;
4. follow redirects and verify every public response's MIME type and byte size;
5. append every labeled evidence link to the body;
6. create the issue with `gh api repos/{owner}/{repo}/issues`;
7. read the issue back through the API and verify title, body, and every video
   URL;
8. return the issue URL and all upload URLs.

If any upload, public verification, or issue-creation step fails before the
issue exists, report every attempted public object URL that may be orphaned.
Do not silently delete remote objects.

## Final report

Return:

- classification: two-video, one-video, or text-only
- verified testing lane: Plate `next`/Beta, plus exact commit/version or
  `NOT_ENOUGH_INFO`
- whether a fresh recording was needed and why
- issue URL, or `not created` with the reason
- uploaded evidence URL(s), or `none`
- verified title, repro steps, expected/actual behavior
- caveats, including inferred expected behavior or an orphaned upload
