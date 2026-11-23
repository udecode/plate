---
name: video-transcripts
description: "Transcribe a supplied local or linked video from one frame per second with Gemini 4 Neon through agy, or with a Claude subagent when agy fails, and check the transcript against the frames, when a recording's contents are needed as evidence, such as a bug recording on an issue, PR or comment, or a question about what a video shows."
---

# Video Transcripts

## Quick Start

Run the helper once per relevant video. `<skill>` is this skill's directory:

```bash
bash <skill>/scripts/generate_video_transcript.sh \
  "https://uploads.linear.app/.../screen-recording.mov" \
  --title "PDF preview hyperlinks trigger leave-page modal"
```

Or for a GitHub attachment:

```bash
bash <skill>/scripts/generate_video_transcript.sh \
  "https://github.com/user-attachments/assets/..." \
  --title "Slash menu loses selection after confirm"
```

Or for a Screencastify watch page:

```bash
bash <skill>/scripts/generate_video_transcript.sh \
  "https://app.screencastify.com/watch/..." \
  --title "Bulk send expands filtered recipients"
```

Or for a local file:

```bash
bash <skill>/scripts/generate_video_transcript.sh \
  "/absolute/path/to/video.mov" \
  --title "Preview hyperlink exits workflow"
```

For auth-gated Linear uploads, the helper automatically retries with cookies from the local Linear desktop app on macOS. For private GitHub asset URLs, it retries with `GITHUB_TOKEN`, `GH_TOKEN`, or `gh auth token` when available.

The helper cuts the video into one frame per second and prints `Frames: <dir>` on stderr. `<dir>/frames/tSSSS.png` is the frame at second SSSS, so `[01:12]` is `t0072.png`, and each `<dir>/sheet-SSSS-SSSS.png` shows the nine seconds its name spans in one image. Pass `--frames <dir>` to choose the directory. To cut the frames with no transcript, run `bash <skill>/scripts/video_frames.sh <video> --output <dir>`.

Then the helper writes `<dir>/frames-brief.md` and sends it to Gemini 4 Neon through agy, the Antigravity CLI. When agy gives no transcript, the helper prints the brief's path and exits 3, and you run the [Frames fallback](#frames-fallback) for that video. agy gives none when it is missing or signed out, its quota ran out, Gemini's filters blocked the prompt or the run timed out. The helper also exits 3 when the transcript is too thin or repeats itself. Any other nonzero exit means the helper could not read or cut the video.

The transcript is a draft until Workflow step 3 checks it against the frames.

## Use This When

- A GitHub or Linear issue, PR, or comment includes a screen recording.
- An attachment URL points to `uploads.linear.app`.
- An attachment URL points to a GitHub attachment or private GitHub asset host.
- A tracker links to a public Screencastify watch page.
- You need timeline-style transcript lines, not a vague summary.
- You want the result in this exact XML shape:

```xml
<video-transcripts>
<video-transcript title="...">
[00:00] (...)
</video-transcript>
</video-transcripts>
```

## Workflow

A tracker comment or reply that anyone outside the team can read, such as one on
a public repository, needs explicit message authority; one only the team can read
follows the project's message rule. Prepare or return the transcript locally when
publication is not authorized. Cache location and reuse rules below do not grant
permission to post.

1. Run the helper once for each relevant video. When it exits 3, run the
   [Frames fallback](#frames-fallback) for that video.
2. Give each run a short, bug-focused `--title`.
3. Check the transcript against the frames before using it, whether Neon or
   the Frames fallback wrote it. A model misreads
   formatting, mixes up windows and invents repeated steps, and it states a
   wrong line as firmly as a right one. Open every sheet of a clip under a
   minute; for a longer clip, open the sheet that holds each line a
   conclusion rests on and the sheets on either side. Open the full frame
   wherever a sheet is too small to read, such as bold or italic text. Where
   a frame and a line disagree, rewrite the line from the frame, and delete a
   line the frames contradict. Mark a line the frames can neither show nor
   contradict, such as speech, `(unverified)`.
4. For tracked work, the canonical shared cache should live in the tracker next to the evidence it describes.
5. If the video is in the issue or PR body, use a top-level tracker comment.
6. If the video is in a Linear comment, post the transcript cache as a reply to that specific comment.
7. If the video is in a GitHub issue or PR comment, use one dedicated top-level cache comment for that source comment's video set. GitHub has no replies, so keep cache comments separated by source container instead of merging unrelated comment videos together.
8. On GitHub, fold each cache comment into one collapsed block, so the thread
   shows one summary line until a reader opens it. The summary names the
   source container and how many clips the block holds, and ends with
   `, from frames` when the Frames fallback wrote the block. Inside the block,
   put a transcript source link, then the timestamp lines:

````md
<details><summary>Transcripts of the 2 clips in the issue body</summary>

[[Transcript](link to video or comment if not available)]
[00:00] (...)

</details>
````

   A Linear reply holds the same link and timestamp lines without the block.
   Keep each source link on the line directly above its first timestamp line,
   because a check that reads the cache looks for that pair.
9. When caching helper XML, strip the `<video-transcripts>` and
   `<video-transcript ...>` wrapper lines and paste only timestamp lines after
   the source link.
10. If there are multiple videos in the same source container, repeat the
   `[[Transcript](...)]` source link plus timestamp lines for each video,
   inside the one block, with a blank line between videos.
11. Build every cached line from the helper's output, or the Frames fallback's, as corrected against the frames, never from memory or the issue's own text.
12. Link `[[Transcript](...)]` to the video URL when available. If the video URL is not available or is unstable, link to the source comment that contains the video.
13. For signed tracker-hosted URLs like `uploads.linear.app`, strip the query string so a new signature does not invalidate an otherwise valid cache entry. For Screencastify, cache against the stable `https://app.screencastify.com/watch/<id>` URL, not the signed `dash-assets` HLS URLs.
14. Do not add decorative metadata like `title` to cached transcript entries unless a later workflow truly needs it.
15. Before re-transcribing for tracked work, match cache entries by source container first:
    - one cache comment for issue or PR body videos
    - one Linear reply per comment containing video(s)
    - one dedicated GitHub cache comment per issue or PR comment containing video(s)
16. If the matching cache already covers the current normalized video keys for that source container, reuse it. Only transcribe missing or new video evidence.
17. Do not use `docs/` for raw tracker transcript cache. That is durable repo knowledge space, not raw issue evidence.
18. If you invoke this through `codex exec`, prefer `-o <file>` so the final XML is captured without CLI progress chatter.

## Frames fallback

When the helper exits 3, start one subagent per video on Claude Opus at medium effort. In Claude Code, that is an `Agent` call with `model: "opus"` and `effort: "medium"`. Its prompt names the path of the video's `frames-brief.md`, tells it to read only the folder the brief names and to write no files, and asks for the brief's XML as its final message. A runtime that cannot start a Claude subagent starts its own subagent at medium effort with the same prompt. The subagent reads the brief Neon got, so both transcripts follow the same rules. Claude cannot play the brief's `speech.wav`, so its transcript leaves speech out; say so where the transcript is used. Its output is a draft, which Workflow step 3 checks against the frames.

## Output Contract

- Return XML, not Markdown.
- Use one `[MM:SS] (...)` line per observed action or system response.
- Quote visible UI text when legible.
- Describe only visible actions, screen changes, and audible speech if present.
- Do not invent hidden state, motives, or implementation details.
- Prefer concise, high-signal lines over per-keystroke sludge.

## Model Strategy

The helper runs `gemini-4-neon-high`, Gemini 4 Neon at high effort, through
agy. agy runs sandboxed in a scratch folder: it reads any file, writes only
that folder, and its settings deny web reads and MCP tools. The brief points
Neon at the frames. When the recording has a sound track, the helper also
extracts it as `speech.wav` beside the frames, because the frames carry no
sound, and the brief tells Neon to open it only for speech. agy played WAV and
MP3 files but heard nothing in an M4A.

A transcript that is too thin or repeats itself goes to the Frames fallback.
Too thin means fewer lines than one per five seconds of video, capped at five.
Repeating means one line appears five or more times, ignoring case, digits,
punctuation and quoted text, and repeats make up half the lines.

On four silent bug clips of 16 to 31 seconds (2026-11-23), Neon at high and
Opus at medium, both reading the frames, got every bug-deciding fact right.
Neon had no wrong line, and Opus placed two captions two seconds early. Neon
took 93 to 157 seconds a clip on the agy subscription; Opus took 48 to 99
seconds and about 100k Claude tokens a clip. Neon given the video file instead
of the frames took 45 to 68 seconds, but it misquoted on-screen captions and
made up steps, as `gemini-3.8-flash` watching the videos did on 2026-11-05. So
on-screen facts come only from the frames, and the recording reaches Neon only
as its sound. Given a clip with a blank picture and one spoken sentence, Neon
wrote the speech word for word.

Override the model with:

```bash
VIDEO_TRANSCRIPTS_MODEL=gemini-4-neon-xhigh bash <skill>/scripts/generate_video_transcript.sh ...
```

Or pass `--model gemini-4-neon-xhigh`. `VIDEO_TRANSCRIPTS_TIMEOUT` sets the
seconds agy gets, 600 by default.

## Notes

- The helper accepts a local file path or remote URL.
- For `uploads.linear.app` URLs, it first tries `LINEAR_COOKIE_HEADER`, then `LINEAR_COOKIES_DB`, then falls back to the local Linear desktop cookie store at `~/Library/Application Support/Linear/Cookies`.
- For GitHub asset URLs, it first tries `GITHUB_TOKEN`, then `GH_TOKEN`, then `gh auth token`, then falls back to an unauthenticated download.
- For Screencastify watch URLs, it calls `https://umbrella.svc.screencastify.com/api/umbrellaService/watch/<id>`, resolves the signed HLS manifest, rewrites child playlists so segments keep the signature, and remuxes the recording with `ffmpeg`.
- The helper requires `ffmpeg` and `ffprobe`, which cut the frames, extract the sound track and remux Screencastify recordings, and `jq`.
- It runs `agy` from `PATH`, signed in to the account whose quota it spends. Without `agy`, it cuts the frames, writes the brief and exits 3.
- Use `--debug-dir <dir>` to save the prompt, agy's event stream and its stderr.
