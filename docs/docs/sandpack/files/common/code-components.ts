export const componentsCode = `import { ELEMENT_CODE_BLOCK } from '@udecode/plate-code-block';
import { createPlateUI } from '@udecode/plate-ui';

export const plateUI = createPlateUI({
  // disabled for the sandbox as prismjs is throwing an error sometimes
  [ELEMENT_CODE_BLOCK]: null as any,
});
`;

export const componentsFile = {
  '/common/components.ts': componentsCode,
};
