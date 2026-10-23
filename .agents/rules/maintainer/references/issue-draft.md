# Issue draft

Turn incomplete Plate `next`/Beta bug evidence into one concise, reproducible
`udecode/plate` GitHub issue. A user request to publish the issue authorizes
analysis, necessary evidence uploads, creation and read-back in one run.

`draft only`, `analyze only` and `do not publish` keep the result local.

## Beta-only scope

- Use this mode only for Plate `next` branch and Beta release testing.
- Target `udecode/plate`. Stop and route to another issue workflow when the
  report targets `main`, a stable release, or another repository.
- In a two-video Beta report, the baseline recording comes from `main`, the
  Slate site, the stable Plate site or another editor; the reported bug still
  targets the current `next` lane.
- Treat the testing lane as confirmed Beta context even when the exact `next`
  commit or Beta package version is unknown. Record unknown build details as
  `NOT_ENOUGH_INFO`; do not downgrade the report to a generic bug.
- Start every issue title with `[Beta]: `. Never emit or publish `[Bug]` from
  this mode, including when the repository bug form supplies that prefix.

## Hard boundaries

- Never upload evidence or create an issue when the user explicitly says
  `draft only`, `analyze only`, or `do not publish`.
- Never publish to a repository other than `udecode/plate` from this mode.
- Never expose tokens, cookies, passwords, private URLs, or sensitive typed
  text in video, logs, transcripts, commands, or issue bodies.
- Never call GitHub's upload endpoints yourself. Media goes through
  `gh issue create --attach` or `gh issue comment --attach`, as
  [Publish](#publish) says.
- Never put a `github.com/user-attachments` URL inside inline code or a fenced
  code block. GitHub renders it as code instead of issue media.
- Never rewrite a published body to add, move or remove evidence; add it in a
  comment.
- Use the current project Browser/Chrome control policy for live proof.
  Prefer a dedicated task tab for evidence and protect unrelated user state.
  Motion recording requires an actually available recording capability; do not
  substitute a forbidden browser driver or invent a recording.
- Never claim expected behavior from appearance alone. Ground it in the
  supplied comparison video, product docs, a reference implementation, tests,
  source, or a clearly labeled user statement.
- Never infer branch roles from input order, filename, resolution, crop, zoom,
  framing, or composition.
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
   records normal behavior on the baseline, which is `main`, the Slate site,
   the stable Plate site or another editor; the other records the current bug
   on `next`. The baseline keeps its source as its label.
4. Establish the file-to-source mapping with a simple evidence pass. First use
   explicit user labels, verified branch/build metadata or a site address the
   recording shows. When those are absent, compare the behavior: the recording
   that works normally is the likely baseline, and the recording showing the
   reported regression is the likely current `next` build. Record this as an
   inference rather than a verified build fact.
5. If the behavior is ambiguous, both recordings appear normal/broken, or the
   evidence otherwise cannot distinguish them reliably, ask exactly one
   focused question: which file is the baseline, and which source does it
   show (`main`, Slate, stable Plate or the other editor's name), and which file
   is from `next`?
6. Use `<source> — normal behavior (expected baseline)`, where `<source>` is
   `main`, `Slate`, `stable Plate` or the other editor's name, and
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

### Sweep finds

A sweep domain's triage drafts one issue per failure kind, as `verify`'s
[sweep](../../verify/references/sweep.md) says. Its finds already carry their
clips, find notes and retest marks.

1. Read each member find's note, clip and retest mark from the round's export,
   and run `scripts/prepare-video-evidence.sh` on each clip you cite.
2. Write the kind's summary, expected and actual results once. Under
   Reproduction, give each member a `### Repro <n>: <route>, <browser>`
   heading with its own steps, and name its recording's role
   `Repro <n> — <browser>, <route>`.
3. When an open issue already covers the kind, draft a comment that adds the
   new repros instead of a new issue, numbering them after the issue's own.
4. List in the draft every other open issue of the kind. After publishing, the
   tester closes each as a duplicate of the kind's issue.

## Build the evidence packet

Keep observed facts separate from inference. Record:

- target repository (`udecode/plate`) and route
- testing lane (`next`/Beta), plus exact commit, package version, browser, and
  OS only when known
- shortest setup and repro steps
- expected behavior and its authority
- actual behavior and visible error text
- reproducibility: always, intermittent, or unknown
- video timestamps, the verified baseline source and `next` role, and the
  evidence files
- caveats and missing facts

Search open and closed issues for a duplicate before publishing. A similar
title is not enough; compare trigger, affected surface, and actual behavior.

## Decide whether to record

Use an installed recording skill only when its source and recorder capability
are actually available.

For supplied videos, use `video-transcripts` and this skill's frame helper.
For a static state, capture through the current project Browser/Chrome tools;
`walkthrough` may annotate existing final frames with originals retained. These
paths do not prove motion or timing. When a fresh motion recording is necessary
and no permitted recorder is available, complete the source/repro/draft work,
then name the missing recording capability. Do not claim a recording was made,
install an unrequested plugin, or turn static frames into simulated evidence.
Post transcript caches only under explicit message authority.

For Plate issue evidence, prefer 10–30 seconds:

1. Establish the route and starting state.
2. Show each action with a short top caption.
3. Show explicit harmless keys in a large center HUD.
4. Show pointer trail, click ripple, drag arrow/distance, and scroll direction.
5. Hold the failure state long enough to read.

After recording:

```bash
bash .agents/skills/maintainer/scripts/prepare-video-evidence.sh \
  /absolute/path/to/repro.mp4 \
  --output /absolute/path/to/evidence
```

Inspect the key, pointer/drag, failure, and final frames. Re-record if captions
are unreadable, a required action is missing, or the video contains unrelated
private information.

## Draft the issue

Use the repository's current bug template when required, unless the user says
not to. Otherwise use [assets/issue-body.md](../assets/issue-body.md). Override the
bug form's default title prefix. Keep the title behavioral and searchable. Do
not include implementation guesses as facts.

The title follows the `[Beta]: ` rule above, even when a `bug` label or the
bug-report template supplies another prefix.

The body must contain:

- concise summary
- Plate `next`/Beta testing lane and exact build details when verified
- minimal reproduction steps
- expected behavior with authority
- actual behavior
- environment only when verified
- caveat when any classification is inferred
- timestamp notes in the closing Evidence section, below which the publisher
  attaches the recordings

Write the title and body to local files before mutation. When the user has
authorized publication, continue through upload, issue creation and
verification without asking for that authority again. Otherwise
return the completed local draft. Resolve any material hard boundary before
publishing.

## Publish

`scripts/publish-issue.sh` publishes through `gh issue create --attach`, which
gh 2.102 added. gh uploads each image or video to GitHub's own attachment
storage and swaps the file's local path in the body for the uploaded URL, so the
publisher needs no other storage or browser upload. Check `gh --version` first and
upgrade an older gh. gh refuses a video over 100 MB; trim a longer recording to
the failure with `ffmpeg`.

Preview the exact command and body without any upload or GitHub mutation:

```bash
bash .agents/skills/maintainer/scripts/publish-issue.sh \
  --repo udecode/plate \
  --title-file /absolute/path/to/title.txt \
  --body-file /absolute/path/to/body.md \
  --attach /absolute/path/to/slate.mp4 \
  --attach-role 'Slate — normal behavior (expected baseline)' \
  --attach /absolute/path/to/next.mp4 \
  --attach-role 'next — current Beta bug (actual behavior)' \
  --labels 'target:beta' \
  --dry-run
```

When publication is authorized, replace `--dry-run` with `--confirm-create`
without asking for a second confirmation.

To add sweep members to an open issue, pass `--comment-on <issue number>`
instead of `--title-file` and `--labels`. It posts one comment with the new
repros and their recordings through `gh issue comment --attach`. Never rewrite
a published body to add evidence.

The publisher:

1. refuses any repository other than `udecode/plate`, a new issue whose title
   does not start with `[Beta]: `, an unresolved template placeholder, a file
   that is not an image or video gh attaches (png, jpg, jpeg, gif, webp, svg,
   mp4, mov or webm) and a role count that differs from the file count;
2. puts each file under the body's `## Evidence` section, which it adds when
   the body has none. Each file gets a `#### <role>` line above an image
   reference alone in its paragraph, so gh embeds an image and leaves a
   video's bare URL, which GitHub plays;
3. refuses a gh without `--attach`;
4. creates the issue or comment, reads it back and checks the title, the
   body's first line and the labels, that no local path remains, and that the
   body holds a `github.com/user-attachments` URL for each file;
5. prints the URL and every attachment URL.

A failure after the issue or comment exists exits 7 and names its URL. Never
rerun the publisher then, because a second run publishes a second copy.

## GitHub references

- Attaching files: https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/attaching-files
- `gh issue create`: https://cli.github.com/manual/gh_issue_create
