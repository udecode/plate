module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation
        'style', // Code style changes (formatting, etc)
        'refactor', // Code refactoring
        'perf', // Performance improvements
        'test', // Test updates
        'chore', // Build, tooling changes
        'ci', // CI/CD changes
        'revert', // Revert commits
      ],
    ],
    'body-max-line-length': [0, 'always'], // Disable body line length limit
  },
};
