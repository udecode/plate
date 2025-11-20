const { config } = require('dotenv');
const {
  getInfo,
  getInfoFromPullRequest,
} = require('@changesets/get-github-info');

config();

const PR_REGEX = /^\s*(?:pr|pull|pull\s+request):\s*#?(\d+)/im;
const COMMIT_REGEX = /^\s*commit:\s*([^\s]+)/im;
const USER_REGEX = /^\s*(?:author|user):\s*@?([^\s]+)/gim;

module.exports = {
  getDependencyReleaseLine: async () => '',
  getReleaseLine: async (changeset, _type, options) => {
    if (!options || !options.repo) {
      throw new Error(
        'Please provide a repo to this changelog generator like this:\n"changelog": ["@changesets/changelog-github", { "repo": "org/repo" }]'
      );
    }

    let prFromSummary;
    let commitFromSummary;
    const usersFromSummary = [];

    const replacedChangelog = changeset.summary
      .replace(PR_REGEX, (_, pr) => {
        const num = Number(pr);
        if (!Number.isNaN(num)) prFromSummary = num;
        return '';
      })
      .replace(COMMIT_REGEX, (_, commit) => {
        commitFromSummary = commit;
        return '';
      })
      .replace(USER_REGEX, (_, user) => {
        usersFromSummary.push(user);
        return '';
      })
      .trim();

    const [firstLine, ...futureLines] = replacedChangelog
      .split('\n')
      .map((l) => l.trimEnd());

    const links = await (async () => {
      if (prFromSummary !== undefined) {
        let { links } = await getInfoFromPullRequest({
          repo: options.repo,
          pull: prFromSummary,
        });
        if (commitFromSummary) {
          links = {
            ...links,
            commit: `[\`${commitFromSummary}\`](https://github.com/${options.repo}/commit/${commitFromSummary})`,
          };
        }
        return links;
      }
      const commitToFetchFrom = commitFromSummary || changeset.commit;
      if (commitToFetchFrom) {
        const { links } = await getInfo({
          repo: options.repo,
          commit: commitToFetchFrom,
        });
        return links;
      }
      return {
        commit: null,
        pull: null,
        user: null,
      };
    })();

    const users = usersFromSummary.length
      ? usersFromSummary
          .map(
            (userFromSummary) =>
              `[@${userFromSummary}](https://github.com/${userFromSummary})`
          )
          .join(', ')
      : links.user;

    const pull = links.pull === null ? '' : ` ${links.pull}`;
    const commit = !!pull || links.commit === null ? '' : ` ${links.commit}`;

    const prefix = [pull, commit, users === null ? '' : ` by ${users}`].join(
      ''
    );

    let lines = `${firstLine}\n${futureLines.map((l) => `  ${l}`).join('\n')}`;

    if (firstLine[0] === '-') {
      lines = `\n  ${firstLine}\n${futureLines
        .map((l) => `  ${l}`)
        .join('\n')}`;
    }

    return `\n\n-${prefix ? `${prefix} –` : ''} ${lines}`;
  },
};
