const packageJsonPlate = require('@udecode/plate/package.json');
const packageJsonExcalidraw = require('@udecode/plate-ui-excalidraw/package.json');
const packageJsonTestUtils = require('@udecode/plate-test-utils/package.json');
const packageJsonJuice = require('@udecode/plate-juice/package.json');
const packageJsonSelection = require('@udecode/plate-selection/package.json');
const packageJsonCloud = require('@udecode/plate-cloud/package.json');
const packageJsonCloudUi = require('@udecode/plate-ui-cloud/package.json');
const packageJsonDnd = require('@udecode/plate-ui-dnd/package.json');
const { sandpackPath } = require('./plop-config');

const templateVersions = `export const plateVersion = '${packageJsonPlate.version}';
export const testUtilsVersion = '${packageJsonTestUtils.version}';
export const excalidrawVersion = '${packageJsonExcalidraw.version}';
export const juiceVersion = '${packageJsonJuice.version}';
export const selectionVersion = '${packageJsonSelection.version}';
export const cloudVersion = '${packageJsonCloud.version}';
export const cloudUiVersion = '${packageJsonCloudUi.version}';
export const dndVersion = '${packageJsonDnd.version}';
`;

module.exports = (_plop) => {
  /** @type {import('plop').NodePlopAPI} */
  const plop = _plop;

  plop.setGenerator('version', {
    description: 'Update Sandpack dependencies',
    prompts: [],
    actions: [
      {
        type: 'add',
        template: templateVersions,
        path: `${sandpackPath}/plate-versions.ts`,
        force: true,
      },
    ],
  });
};
