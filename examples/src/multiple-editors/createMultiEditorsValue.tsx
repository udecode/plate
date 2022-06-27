/** @jsxRuntime classic */
/** @jsx jsx */
import { TDescendant } from '@udecode/plate';
import { jsx } from '@udecode/plate-test-utils';
import faker from 'faker';

jsx;

export const createMultiEditorsValue = () => {
  const multiEditors: TDescendant[][] = [];

  for (let h = 0; h < 400; h++) {
    const multiEditor: TDescendant[] = [];
    multiEditor.push((<hh1>{faker.lorem.sentence()}</hh1>) as any);

    for (let p = 0; p < 2; p++) {
      multiEditor.push((<hp>{faker.lorem.paragraph()}</hp>) as any);
    }
    multiEditors.push(multiEditor);
  }

  return multiEditors;
};
