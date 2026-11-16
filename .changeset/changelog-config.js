const { config } = require('dotenv');
const { getInfo } = require('@changesets/get-github-info');

config();

module.exports = {
  getDependencyReleaseLine: () => '',
  getReleaseLine: async (changeset, _type, options) => {
    if (!options || !options.repo) {
      throw new Error(
        'Please provide a repo to this changelog generator like this:\n"changelog": ["@changesets/changelog-github", { "repo": "org/repo" }]'
      );
    }

    const replacedChangelog = changeset.summary.trim();

    const [firstLine, ...futureLines] = replacedChangelog
      .split('\n')
      .map((l) => l.trimEnd());

    const links = await (async () => {
      if (changeset.commit) {
        try {
          const { links: innerLinks } = await getInfo({
            repo: options.repo,
            commit: changeset.commit,
          });
          return innerLinks;
        } catch (error) {
          console.warn(
            `[changeset changelog] Falling back without GitHub metadata: ${error.message}`
          );

          return {
            commit: `[\`${changeset.commit}\`](https://github.com/${options.repo}/commit/${changeset.commit})`,
            pull: null,
            user: null,
          };
        }
      }
      return {
        commit: null,
        pull: null,
        user: null,
      };
    })();

    const pull = links.pull === null ? '' : ` ${links.pull}`;
    const commit = !!pull || links.commit === null ? '' : ` ${links.commit}`;

    const prefix = [
      pull,
      commit,
      links.user === null ? '' : ` by ${links.user}`,
    ].join('');

    let lines = `${firstLine}\n${futureLines.map((l) => `  ${l}`).join('\n')}`;

    if (firstLine[0] === '-') {
      lines = `\n  ${firstLine}\n${futureLines
        .map((l) => `  ${l}`)
        .join('\n')}`;
    }

    return `\n\n-${prefix ? `${prefix} –` : ''} ${lines}`;
  },
};
