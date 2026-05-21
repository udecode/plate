export const AUTO_RELEASE_START = '<!-- auto-release:start -->';
export const AUTO_RELEASE_END = '<!-- auto-release:end -->';

const checkboxText = 'Auto release';
const legacyBlockPattern =
  /<!-- plate:auto-release:start -->[\s\S]*?<!-- plate:auto-release:end -->\n*/m;
const blockPattern = new RegExp(
  `(?:${escapeRegExp(AUTO_RELEASE_START)}[\\s\\S]*?${escapeRegExp(AUTO_RELEASE_END)}|${legacyBlockPattern.source})\\n*`,
  'm'
);
const checkedAutoReleasePattern =
  /-\s*\[[xX]\]\s*(?:Auto release|Auto-merge the Version Packages PR after this PR lands\.)/;
const changesetFrontmatterPattern = /^---\r?\n([\s\S]*?)\r?\n---/;
const changesetReleaseTypePattern = /:\s*(major|minor|patch)\b/g;
const versionPackagesTitlePattern = /\bVersion Packages\b/i;

export function hasChangesetFile(files) {
  return files.some((file) => {
    const filename = typeof file === 'string' ? file : file.filename;

    return (
      filename?.startsWith('.changeset/') &&
      filename.endsWith('.md') &&
      filename !== '.changeset/README.md'
    );
  });
}

export function getChangesetReleaseType(files) {
  const releaseTypes = files
    .filter(isChangesetFile)
    .flatMap((file) => parseChangesetReleaseTypes(getChangesetContent(file)));

  if (releaseTypes.includes('major')) return 'major';
  if (releaseTypes.includes('minor')) return 'minor';
  if (releaseTypes.includes('patch')) return 'patch';

  return null;
}

export function isAutoReleaseChecked(body = '') {
  const block = getAutoReleaseBlock(body);

  return checkedAutoReleasePattern.test(block);
}

export function isVersionPackagesTitle(title = '') {
  return versionPackagesTitlePattern.test(title);
}

export function shouldManageAutoReleaseBlock({ files, title }) {
  return !isVersionPackagesTitle(title) && hasChangesetFile(files);
}

export function upsertAutoReleaseBlock(
  body,
  { defaultChecked = false, hasChangeset }
) {
  const bodyWithoutBlock = body.replace(blockPattern, '').trimEnd();

  if (!hasChangeset) {
    return bodyWithoutBlock;
  }

  const checked = getAutoReleaseBlock(body)
    ? isAutoReleaseChecked(body)
    : defaultChecked;
  const checkbox = `- [${checked ? 'x' : ' '}] ${checkboxText}`;
  const block = `${AUTO_RELEASE_START}
${checkbox}
${AUTO_RELEASE_END}`;

  return `${block}${bodyWithoutBlock ? `\n\n${bodyWithoutBlock}` : ''}\n`;
}

function getAutoReleaseBlock(body) {
  return body.match(blockPattern)?.[0] ?? '';
}

function getChangesetContent(file) {
  if (typeof file === 'string') return '';
  if (typeof file.contents === 'string') return file.contents;
  if (typeof file.content === 'string') return file.content;
  if (typeof file.patch === 'string') return getAddedPatchContent(file.patch);

  return '';
}

function getAddedPatchContent(patch) {
  return patch
    .split('\n')
    .filter((line) => line.startsWith('+') && !line.startsWith('+++'))
    .map((line) => line.slice(1))
    .join('\n');
}

function isChangesetFile(file) {
  const filename = typeof file === 'string' ? file : file.filename;

  return (
    filename?.startsWith('.changeset/') &&
    filename.endsWith('.md') &&
    filename !== '.changeset/README.md'
  );
}

function parseChangesetReleaseTypes(content) {
  const frontmatter = content.match(changesetFrontmatterPattern)?.[1];

  return [...(frontmatter ?? '').matchAll(changesetReleaseTypePattern)].map(
    (match) => match[1]
  );
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
