export const AUTO_RELEASE_START = '<!-- plate:auto-release:start -->';
export const AUTO_RELEASE_END = '<!-- plate:auto-release:end -->';

const checkboxText = 'Auto-merge the Version Packages PR after this PR lands.';
const blockPattern = new RegExp(
  `${escapeRegExp(AUTO_RELEASE_START)}[\\s\\S]*?${escapeRegExp(AUTO_RELEASE_END)}\\n*`,
  'm'
);
const checkedAutoReleasePattern =
  /-\s*\[[xX]\]\s*Auto-merge the Version Packages PR after this PR lands\./;

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

export function isAutoReleaseChecked(body = '') {
  const block = getAutoReleaseBlock(body);

  return checkedAutoReleasePattern.test(block);
}

export function upsertAutoReleaseBlock(body, { hasChangeset }) {
  const bodyWithoutBlock = body.replace(blockPattern, '').trimEnd();

  if (!hasChangeset) {
    return bodyWithoutBlock;
  }

  const checked = isAutoReleaseChecked(body);
  const checkbox = `- [${checked ? 'x' : ' '}] ${checkboxText}`;
  const block = `${AUTO_RELEASE_START}
**Auto release**
${checkbox}
${AUTO_RELEASE_END}`;

  return `${bodyWithoutBlock}${bodyWithoutBlock ? '\n\n' : ''}${block}\n`;
}

function getAutoReleaseBlock(body) {
  return body.match(blockPattern)?.[0] ?? '';
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
