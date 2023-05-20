/** @jsxRuntime classic */
/** @jsx jsx */
import { TDescendant } from '@udecode/plate';
import { jsx } from '@udecode/plate-test-utils';

jsx;

const HEADINGS = 100;
const PARAGRAPHS = 7;

export const createHugeDocumentValue = () => {
  const hugeDocument: TDescendant[] = [];

  for (let h = 0; h < HEADINGS; h++) {
    hugeDocument.push(
      (
        <hh1>Do voluptate enim commodo quis ad aliqua dolore enim eu nisi.</hh1>
      ) as any
    );

    for (let p = 0; p < PARAGRAPHS; p++) {
      hugeDocument.push(
        (
          <hp>
            Ex est consequat anim ad deserunt sint. Ea excepteur consequat amet
            amet excepteur culpa nulla. Voluptate exercitation pariatur enim.
            Excepteur ea nulla nostrud est ex sunt anim. Sunt laborum et et ea
            aliquip excepteur sint nulla amet. Sunt sit cillum amet. Anim esse
            ut irure ipsum irure proident consectetur eu velit esse. Laborum
            minim laborum laborum sunt eiusmod aliqua fugiat adipisicing. Cillum
            aliqua exercitation ex aliquip aliquip amet aliquip est eiusmod
            tempor pariatur veniam adipisicing ad. Officia sunt ipsum
            adipisicing eu quis laborum do cupidatat officia dolor.
          </hp>
        ) as any
      );
    }
  }

  return hugeDocument;
};
