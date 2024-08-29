const packageJsonPlate = require('@udecode/plate/package.json');
const packageJsonPlateCore = require('@udecode/plate-core/package.json');

module.exports = (_plop) => {
  /** @type {import('plop').NodePlopAPI} */
  const plop = _plop;

  plop.setGenerator('package', {
    actions: [
      {
        path: '../../packages/{{name}}/.npmignore',
        templateFile: 'templates/package/.npmignore.hbs',
        type: 'add',
      },
      {
        path: '../../packages/{{name}}/README.md',
        templateFile: 'templates/package/README.md.hbs',
        type: 'add',
      },
      {
        path: '../../packages/{{name}}/tsconfig.json',
        templateFile: 'templates/package/tsconfig.json.hbs',
        type: 'add',
      },
      {
        data: {
          coreVersion: packageJsonPlateCore.version,
          plateVersion: packageJsonPlate.version,
        },
        path: '../../packages/{{name}}/package.json',
        templateFile: 'templates/package/package.json.hbs',
        type: 'add',
      },
    ],
    description: 'New package',
    prompts: [
      {
        message: 'Package name set after @udecode/plate-',
        name: 'name',
        type: 'input',
      },
      {
        default: 'Plate plugin',
        message: 'Package description',
        name: 'description',
        type: 'input',
      },
      {
        message: 'Create a plate plugin?',
        name: 'createSlatePlugin',
        type: 'confirm',
      },
    ],
  });
};
