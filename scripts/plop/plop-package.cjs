const packageJsonPlate = require('@udecode/plate/package.json');
const packageJsonPlateCore = require('@udecode/plate-core/package.json');

module.exports = (_plop) => {
  /** @type {import('plop').NodePlopAPI} */
  const plop = _plop;

  plop.setGenerator('package', {
    description: 'New package',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Package name set after @udecode/plate-',
      },
      {
        type: 'input',
        name: 'description',
        message: 'Package description',
        default: 'Plate plugin',
      },
      {
        type: 'confirm',
        name: 'createPlugin',
        message: 'Create a plate plugin?',
      },
    ],
    actions: [
      {
        type: 'add',
        path: '../../packages/{{name}}/.npmignore',
        templateFile: 'templates/package/.npmignore.hbs',
      },
      {
        type: 'add',
        path: '../../packages/{{name}}/README.md',
        templateFile: 'templates/package/README.md.hbs',
      },
      {
        type: 'add',
        path: '../../packages/{{name}}/tsconfig.json',
        templateFile: 'templates/package/tsconfig.json.hbs',
      },
      {
        type: 'add',
        path: '../../packages/{{name}}/package.json',
        templateFile: 'templates/package/package.json.hbs',
        data: {
          plateVersion: packageJsonPlate.version,
          coreVersion: packageJsonPlateCore.version,
        },
      },
    ],
  });
};
