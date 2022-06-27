const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

function* walkSync(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    if (file.isDirectory()) {
      yield* walkSync(path.join(dir, file.name));
    } else {
      yield path.join(dir, file.name);
    }
  }
}

module.exports = (plop) => {
  /** @type {import('plop').PlopGeneratorConfig['actions']} */
  const actions = [];

  const filePaths = [];
  // do something
  for (const filePath of walkSync('./src')) {
    filePaths.push(filePath);

    const relativeFilePath = filePath.replace('src/', '');

    const slashIndex = relativeFilePath.lastIndexOf('/');
    const codeFilePath = `${relativeFilePath.substring(
      0,
      slashIndex + 1
    )}code-${relativeFilePath.substring(slashIndex + 1)}`;

    const fileName = relativeFilePath.substring(
      slashIndex + 1,
      relativeFilePath.indexOf('.')
    );
    // console.log(codeFilePath);
    // console.log(fileName);

    actions.push(
      ...[
        {
          type: 'add',
          template: `export const ${fileName}Code = \`{1}`,
          path: `docusaurus/docs/sandpack/${codeFilePath}`,
          force: true,
        },
        {
          type: 'modify',
          pattern: '{1}',
          transform: (content) => {
            content = `${content.replaceAll('`', '\\`')}\`;`;
            return content.replace('\\', '');
          },
          path: `docusaurus/docs/sandpack/${codeFilePath}`,
          templateFile: filePath,
        },
      ]
    );
  }

  // create your generators here
  plop.setGenerator('sandpack', {
    description: 'generate sandpack files',
    prompts: [],
    actions,
  });

  // does not exit so we do it manually
  setTimeout(() => {
    process.exit(0);
  }, 1000);
};
