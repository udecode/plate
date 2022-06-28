export const plateUiCode = `import { createPlateUI, ELEMENT_CODE_BLOCK } from '@udecode/plate';

export const plateUI = createPlateUI({
  // disabled for the sandbox as prismjs is throwing an error sometimes
  [ELEMENT_CODE_BLOCK]: null as any,
});
`;

export const plateUiFile = {
  '/common/plateUI.ts': plateUiCode,
};
