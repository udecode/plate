export const createMultiEditorsValueCode = `/** @jsxRuntime classic */
/** @jsx jsx */
import { faker } from '@faker-js/faker';
import { TDescendant } from '@udecode/plate';
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const createMultiEditorsValue = () => {
  const multiEditors: TDescendant[][] = [];

  for (let h = 0; h < 400; h++) {
    const multiEditor: TDescendant[] = [];
    multiEditor.push((<hh1>{faker.sentence()}</hh1>) as any);

    for (let p = 0; p < 2; p++) {
      multiEditor.push((<hp>{faker.lorem.paragraph()}</hp>) as any);
    }
    multiEditors.push(multiEditor);
  }

  return multiEditors;
};
`;

export const createMultiEditorsValueFile = {
  '/multiple-editors/createMultiEditorsValue.tsx': createMultiEditorsValueCode,
};
