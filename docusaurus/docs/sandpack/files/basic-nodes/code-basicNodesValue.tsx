export const basicNodesValueCode = `import { basicElementsValue } from '../basic-elements/basicElementsValue';
import { basicMarksValue } from '../basic-marks/basicMarksValue';

export const basicNodesValue = [...basicElementsValue, ...basicMarksValue];
`;

export const basicNodesValueFile = {
  '/basic-nodes/basicNodesValue.tsx': basicNodesValueCode,
};
