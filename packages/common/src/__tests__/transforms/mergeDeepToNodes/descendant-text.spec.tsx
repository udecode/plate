/** @jsx jsx */

import { jsx } from "@udecode/slate-plugins-test-utils";
import { isDescendant } from "../../../queries/index";
import { mergeDeepToNodes } from "../../../transforms/index";

const node = (<htext>test</htext>) as any;

const props = { a: 1 };

const output = (<htext a={1}>test</htext>) as any;

it("should set props to the text node", () => {
  mergeDeepToNodes({
    node,
    source: props,
    query: {
      filter: ([n]) => isDescendant(n),
    },
  });
  expect(node).toEqual(output);
});
