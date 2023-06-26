export const createMultiEditorsValueCode = `/** @jsxRuntime classic */
/** @jsx jsx */
import { TDescendant } from '@udecode/plate';
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const createMultiEditorsValue = () => {
  const multiEditors: TDescendant[][] = [];

  for (let h = 0; h < 300; h++) {
    const multiEditor: TDescendant[] = [];
    multiEditor.push(
      (<hh1>Amet duis nisi ea enim laborum laboris.</hh1>) as any
    );

    for (let p = 0; p < 2; p++) {
      multiEditor.push(
        (
          <hp>
            Laborum dolor et tempor consectetur amet ullamco consectetur ullamco
            irure incididunt reprehenderit ullamco nulla tempor. Laboris veniam
            commodo id in ex ullamco incididunt nulla eu Lorem adipisicing
            deserunt duis ad. Mollit magna enim exercitation amet proident
            reprehenderit magna nulla officia ad in non. Magna magna adipisicing
            fugiat cillum do esse eu adipisicing. Culpa dolor non Lorem. Dolore
            non voluptate velit in eu culpa velit. Exercitation fugiat cupidatat
            adipisicing duis veniam proident irure ea excepteur aliqua esse ad
            cupidatat adipisicing id. Ut exercitation proident ea eiusmod enim
            non minim proident Lorem aliqua officia voluptate ullamco culpa
            Lorem. Exercitation eiusmod dolor nostrud qui excepteur. Dolor
            commodo duis reprehenderit excepteur laboris do minim qui.
          </hp>
        ) as any
      );
    }
    multiEditors.push(multiEditor);
  }

  return multiEditors;
};
`;

export const createMultiEditorsValueFile = {
  '/multiple-editors/createMultiEditorsValue.tsx': createMultiEditorsValueCode,
};
