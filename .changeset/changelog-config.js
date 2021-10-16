const { config } = require("dotenv");
const { getInfo, getInfoFromPullRequest } = require("@changesets/get-github-info");

config();

module.exports = {
  getDependencyReleaseLine: async (
  ) => {
    return ""
  },
  getReleaseLine: async (changeset, type, options) => {
    if (!options || !options.repo) {
      throw new Error(
        'Please provide a repo to this changelog generator like this:\n"changelog": ["@changesets/changelog-github", { "repo": "org/repo" }]'
      );
    }

    let prFromSummary;
    let commitFromSummary;
    let usersFromSummary = [];

    const replacedChangelog = changeset.summary
      .replace(/^\s*(?:pr|pull|pull\s+request):\s*#?(\d+)/im, (_, pr) => {
        let num = Number(pr);
        if (!isNaN(num)) prFromSummary = num;
        return "";
      })
      .replace(/^\s*commit:\s*([^\s]+)/im, (_, commit) => {
        commitFromSummary = commit;
        return "";
      })
      .replace(/^\s*(?:author|user):\s*@?([^\s]+)/gim, (_, user) => {
        usersFromSummary.push(user);
        return "";
      })
      .trim();

    const [firstLine, ...futureLines] = replacedChangelog
      .split("\n")
      .map(l => l.trimRight());

    const links = await (async () => {
      if (prFromSummary !== undefined) {
        let { links } = await getInfoFromPullRequest({
          repo: options.repo,
          pull: prFromSummary
        });
        if (commitFromSummary) {
          links = {
            ...links,
            commit: `[\`${commitFromSummary}\`](https://github.com/${options.repo}/commit/${commitFromSummary})`
          };
        }
        return links;
      }
      const commitToFetchFrom = commitFromSummary || changeset.commit;
      if (commitToFetchFrom) {
        let { links } = await getInfo({
          repo: options.repo,
          commit: commitToFetchFrom
        });
        return links;
      }
      return {
        commit: null,
        pull: null,
        user: null
      };
    })();

    const users = usersFromSummary.length
      ? usersFromSummary
          .map(
            userFromSummary =>
              `[@${userFromSummary}](https://github.com/${userFromSummary})`
          )
          .join(", ")
      : links.user;

    const pull = links.pull === null ? "" : ` ${links.pull}`
    const commit = !!pull || links.commit === null ? "" : ` ${links.commit}`
    
    const prefix = [
      pull,
      commit,
      users === null ? "" : ` by ${users}`
    ].join("");

    let lines = `${firstLine}\n${futureLines
      .map(l => `  ${l}`)
      .join("\n")}`;
    
    if (firstLine[0] === '-') {
      lines = `\n  ${firstLine}\n${futureLines
        .map(l => `  ${l}`)
        .join("\n")}`;
    }
    
    return `\n\n-${prefix ? `${prefix} –` : ""} ${lines}`;
  }
};
