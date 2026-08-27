# GitHub API boundaries

## Supported public API path

- Create an issue with `POST /repos/{owner}/{repo}/issues` or `gh api`.
- Upload bytes to a configured S3/R2-compatible object store through `rclone`.
- Alternatively upload bytes with an HTTPS presigned PUT URL; keep that URL out
  of logs and publish only the separate stable public GET URL.
- Put the verified public media URL in the issue Markdown body.

Public object storage makes the video public even when the GitHub repository is
private. Require an explicit public-disclosure decision for that combination,
or use access-controlled storage/native Chrome upload instead.

Official references:

- Issues REST API: https://docs.github.com/en/rest/issues/issues
- Attaching files: https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/attaching-files
- Release assets REST API: https://docs.github.com/en/rest/releases/assets

## Deliberate inference

GitHub documents native issue attachments as a web-interface drag/drop or file
picker flow. The public Issues REST endpoint accepts title, body, labels,
assignees, milestone, type, and issue fields; it exposes no attachment upload
field or endpoint. Therefore treat native issue attachment upload as unavailable
through the public API unless GitHub adds an official endpoint.

Do not call internal `upload/policies/assets`, `upload/assets`, copied browser
requests, cookie-authenticated private endpoints, or reverse-engineered upload
flows. Those contracts can change and may expose session credentials.

GitHub Release Assets have an official upload API, but creating or modifying a
release solely to host issue evidence changes repository release state and is
not an acceptable default.

If the report requires a native `github.com/user-attachments` URL, skill
invocation supplies issue-publication approval. Use the Chrome file-input flow
without reconfirming and accept that this is not API-only. Separate approval is
still required for browser permission changes or public disclosure of private
evidence.
