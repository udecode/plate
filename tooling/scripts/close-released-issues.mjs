#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

const USAGE = `Usage: node tooling/scripts/close-released-issues.mjs --version <version> [--repo <owner/repo>] [--ref <git-ref>] [--dry-run]`;

const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u;
const TRIAGE_FIELD = 'Triage';
const FIXED_IN_NEXT_RELEASE = 'Fixed in next release';
const TRIAGED = 'Triaged';
const TEAM_ASSOCIATIONS = new Set(['COLLABORATOR', 'MEMBER', 'OWNER']);
const DRAFT_MARK = /\n*<!-- triage:([0-9a-f]{12}) -->\s*$/u;
const FIXED_COMMIT_LINE =
  /^Fixed in (?:`?([0-9a-f]{7,40})`?|\[`?[0-9a-f]{7,40}`?\]\(https:\/\/github\.com\/[^/]+\/[^/]+\/commit\/([0-9a-f]{7,40})\))\.\s*$/iu;
const FIX_COMMIT_MARKER = /<!-- fix-commit:([0-9a-f]{7,40}) -->/iu;

const OPEN_ISSUES_QUERY = `query($owner: String!, $name: String!, $cursor: String) {
  repository(owner: $owner, name: $name) {
    issueFields(first: 50) {
      nodes {
        ... on IssueFieldSingleSelect {
          id
          name
          options {
            id
            name
          }
        }
      }
    }
    issues(states: OPEN, first: 100, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        number
        issueFieldValues(first: 20) {
          nodes {
            ... on IssueFieldSingleSelectValue {
              optionId
              name
              field {
                ... on IssueFieldSingleSelect {
                  id
                  name
                }
              }
            }
          }
        }
        comments(last: 100) {
          nodes {
            databaseId
            authorAssociation
            body
          }
        }
      }
    }
  }
}`;

const SET_TRIAGE_MUTATION = `mutation($issueId: ID!, $fieldId: ID!, $optionId: ID!) {
  setIssueFieldValue(
    input: {
      issueId: $issueId
      issueFields: [{ fieldId: $fieldId, singleSelectOptionId: $optionId }]
    }
  ) {
    clientMutationId
  }
}`;

const unixText = (text) => (text ?? '').replace(/\r\n?/gu, '\n');

export const markOf = (text) =>
  createHash('sha256').update(unixText(text).trim()).digest('hex').slice(0, 12);

export const releaseLineFor = ({ repo, version }) =>
  `Fixed in [platejs@${version}](https://github.com/${repo}/releases/tag/v${version}).`;

export function parseFixCommit(body) {
  const text = unixText(body);
  const firstLine = text.trimStart().split('\n', 1)[0] ?? '';
  const lineMatch = FIXED_COMMIT_LINE.exec(firstLine);
  if (lineMatch) return (lineMatch[1] ?? lineMatch[2]).toLowerCase();
  const markerMatch = FIX_COMMIT_MARKER.exec(text);
  return markerMatch ? markerMatch[1].toLowerCase() : null;
}

export function findFixComment(comments, { repo, version }) {
  const releaseLine = releaseLineFor({ repo, version });
  const teamComments = (comments ?? []).filter((comment) =>
    TEAM_ASSOCIATIONS.has(comment.authorAssociation)
  );
  for (let i = teamComments.length - 1; i >= 0; i -= 1) {
    const comment = teamComments[i];
    const commit = parseFixCommit(comment.body);
    if (commit) return { alreadyUpdated: false, comment, commit };
  }
  for (let i = teamComments.length - 1; i >= 0; i -= 1) {
    const comment = teamComments[i];
    const firstLine =
      unixText(comment.body).trimStart().split('\n', 1)[0] ?? '';
    if (firstLine.trim() === releaseLine) {
      return { alreadyUpdated: true, comment, commit: null };
    }
  }
  return null;
}

export function rewriteFixCommentBody(body, { repo, version }) {
  const text = unixText(body);
  const draftMatch = DRAFT_MARK.exec(text);
  const content = draftMatch ? text.slice(0, draftMatch.index) : text;
  const newlineAt = content.indexOf('\n');
  const rest = newlineAt === -1 ? '' : content.slice(newlineAt);
  const updated = `${releaseLineFor({ repo, version })}${rest}`;
  if (!draftMatch) return updated;
  return `${updated.trimEnd()}\n\n<!-- triage:${markOf(updated)} -->`;
}

function parseArgs(argv) {
  let version = null;
  let repo = process.env.GITHUB_REPOSITORY || 'udecode/plate';
  let ref = null;
  let dryRun = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run' || arg === '--dry') {
      dryRun = true;
    } else if (arg === '--version') {
      i += 1;
      version = argv[i] ?? null;
    } else if (arg === '--repo') {
      i += 1;
      repo = argv[i] ?? '';
    } else if (arg === '--ref') {
      i += 1;
      ref = argv[i] ?? null;
    } else if (!arg.startsWith('-') && version === null) {
      version = arg;
    } else {
      throw new Error(`unknown argument ${arg}`);
    }
  }

  if (!version || !SEMVER.test(version)) {
    throw new Error(
      '--version requires a semver string, such as 54.0.0-beta.6'
    );
  }
  if (!/^[^/]+\/[^/]+$/u.test(repo)) {
    throw new Error('--repo requires owner/name');
  }

  return { dryRun, ref, repo, version };
}

function resolveRoot() {
  const result = spawnSync('git', ['rev-parse', '--show-toplevel'], {
    encoding: 'utf-8',
  });
  return result.status === 0 ? result.stdout.trim() : process.cwd();
}

function makeRunner(cwd) {
  const sh = (command, args) =>
    spawnSync(command, args, {
      cwd,
      encoding: 'utf-8',
      maxBuffer: 64 << 20,
    });
  const out = (command, args) => {
    const result = sh(command, args);
    if (result.status !== 0) {
      const detail = (result.stderr || result.stdout).trim().split('\n')[0];
      throw new Error(
        `${command} ${args.join(' ')}: ${detail || `exited ${result.status}`}`
      );
    }
    return result.stdout.trim();
  };
  return { out, sh };
}

function resolveRef(runner, version, explicitRef) {
  if (explicitRef) {
    runner.out('git', [
      'rev-parse',
      '--verify',
      '--quiet',
      `${explicitRef}^{commit}`,
    ]);
    return explicitRef;
  }
  const tag = `platejs@${version}`;
  const tagRef = `refs/tags/${tag}`;
  if (
    runner.sh('git', ['rev-parse', '--verify', '--quiet', `${tagRef}^{commit}`])
      .status === 0
  ) {
    return tagRef;
  }
  const fetched = runner.sh('git', [
    'fetch',
    '--quiet',
    'origin',
    `+${tagRef}:${tagRef}`,
  ]);
  if (fetched.status !== 0) {
    throw new Error(`origin has no ${tag} tag`);
  }
  return tagRef;
}

function fetchOpenTriageIssues(runner, repo) {
  const [owner, name] = repo.split('/');
  const issues = [];
  let triageField = null;
  let cursor = null;

  for (;;) {
    const args = [
      'api',
      'graphql',
      '-f',
      `query=${OPEN_ISSUES_QUERY}`,
      '-f',
      `owner=${owner}`,
      '-f',
      `name=${name}`,
    ];
    if (cursor !== null) args.push('-f', `cursor=${cursor}`);
    const payload = JSON.parse(runner.out('gh', args));
    const repository = payload.data?.repository;
    if (!repository) {
      throw new Error(`GitHub returned no repository data for ${repo}`);
    }
    if (triageField === null) {
      const field = (repository.issueFields?.nodes ?? []).find(
        (node) => node?.name === TRIAGE_FIELD && Array.isArray(node.options)
      );
      if (!field) {
        throw new Error(
          `${repo} has no single-select issue field named ${TRIAGE_FIELD}`
        );
      }
      const optionIds = new Map(
        field.options.map((option) => [option.name, option.id])
      );
      const fixedId = optionIds.get(FIXED_IN_NEXT_RELEASE);
      const triagedId = optionIds.get(TRIAGED);
      if (!fixedId || !triagedId) {
        throw new Error(
          `${repo} ${TRIAGE_FIELD} field must include ${FIXED_IN_NEXT_RELEASE} and ${TRIAGED}`
        );
      }
      triageField = { fixedId, id: field.id, triagedId };
    }
    for (const issue of repository.issues?.nodes ?? []) {
      const values = issue.issueFieldValues?.nodes ?? [];
      const isFixedInNext = values.some(
        (value) =>
          value?.field?.id === triageField.id &&
          value?.optionId === triageField.fixedId
      );
      if (isFixedInNext) issues.push(issue);
    }
    const pageInfo = repository.issues?.pageInfo;
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor) break;
    cursor = pageInfo.endCursor;
  }

  return { issues, triageField };
}

export function closeReleasedIssues(argv, { cwd = resolveRoot() } = {}) {
  const { dryRun, ref: explicitRef, repo, version } = parseArgs(argv);
  const runner = makeRunner(cwd);
  const ref = resolveRef(runner, version, explicitRef);
  const { issues, triageField } = fetchOpenTriageIssues(runner, repo);
  const releaseLine = releaseLineFor({ repo, version });

  let exitCode = 0;
  let closedCount = 0;

  for (const issue of issues) {
    const found = findFixComment(issue.comments?.nodes ?? [], {
      repo,
      version,
    });
    if (!found) {
      console.info(
        `#${issue.number} skipped: no team "Fixed in <commit>." comment found`
      );
      continue;
    }

    if (!found.alreadyUpdated) {
      const inRelease =
        runner.sh('git', ['merge-base', '--is-ancestor', found.commit, ref])
          .status === 0;
      if (!inRelease) {
        console.info(
          `#${issue.number} skipped: ${found.commit} is not in ${ref}`
        );
        continue;
      }
    }

    if (dryRun) {
      const editNote = found.alreadyUpdated
        ? 'comment already updated'
        : `edit comment ${found.comment.databaseId}`;
      console.info(
        `#${issue.number} would close (${editNote}, set ${TRIAGE_FIELD}=${TRIAGED}): ${releaseLine}`
      );
      continue;
    }

    if (!found.alreadyUpdated) {
      const updatedBody = rewriteFixCommentBody(found.comment.body, {
        repo,
        version,
      });
      const edited = runner.sh('gh', [
        'api',
        '--method',
        'PATCH',
        `repos/${repo}/issues/comments/${found.comment.databaseId}`,
        '-f',
        `body=${updatedBody}`,
      ]);
      if (edited.status !== 0) {
        const detail = (edited.stderr || edited.stdout).trim().split('\n')[0];
        console.error(`#${issue.number} comment edit failed: ${detail}`);
        exitCode = 1;
        continue;
      }
    }

    const triaged = runner.sh('gh', [
      'api',
      'graphql',
      '-f',
      `query=${SET_TRIAGE_MUTATION}`,
      '-f',
      `issueId=${issue.id}`,
      '-f',
      `fieldId=${triageField.id}`,
      '-f',
      `optionId=${triageField.triagedId}`,
    ]);
    if (triaged.status !== 0) {
      const detail = (triaged.stderr || triaged.stdout).trim().split('\n')[0];
      console.error(
        `#${issue.number} ${TRIAGE_FIELD} update failed: ${detail}`
      );
      exitCode = 1;
      continue;
    }

    const closed = runner.sh('gh', [
      'issue',
      'close',
      String(issue.number),
      '--repo',
      repo,
      '--reason',
      'completed',
    ]);
    if (closed.status !== 0) {
      const detail = (closed.stderr || closed.stdout).trim().split('\n')[0];
      console.error(`#${issue.number} close failed: ${detail}`);
      exitCode = 1;
      continue;
    }

    closedCount += 1;
    console.info(`#${issue.number} closed: ${releaseLine}`);
  }

  if (issues.length === 0) {
    console.info(
      `No open issues marked "${FIXED_IN_NEXT_RELEASE}" in ${repo}.`
    );
  } else if (!dryRun && closedCount === 0 && exitCode === 0) {
    console.info(`No open "${FIXED_IN_NEXT_RELEASE}" issues matched ${ref}.`);
  }

  return exitCode;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    process.exitCode = closeReleasedIssues(process.argv.slice(2));
  } catch (error) {
    console.error(`close-released-issues: ${error.message}\n${USAGE}`);
    process.exitCode = 1;
  }
}
