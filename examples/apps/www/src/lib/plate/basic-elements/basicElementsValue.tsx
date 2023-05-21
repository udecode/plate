/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

import { mapNodeId } from '@/plate/common/mapNodeId';

jsx;

export const basicElementsValue: any = mapNodeId(
  <fragment>
    <hh1>🧱 Elements</hh1>
    <hh2>🔥 Basic Elements</hh2>
    <hp>These are the most common elements, known as blocks:</hp>
    <hh1>Heading 1</hh1>
    <hh2>Heading 2</hh2>
    <hh3>Heading 3</hh3>
    <hh4>Heading 4</hh4>
    <hh5>Heading 5</hh5>
    <hh6>Heading 6</hh6>
    <hblockquote>Blockquote</hblockquote>
    <hcodeblock lang="javascript">
      <hcodeline>const a = 'Hello';</hcodeline>
      <hcodeline>const b = 'World';</hcodeline>
    </hcodeblock>
  </fragment>
);
