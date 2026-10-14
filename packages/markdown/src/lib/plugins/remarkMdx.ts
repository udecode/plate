import { attachMdx } from '../internal/remarkMdx';
import { REMARK_MDX_TAG } from '../utils/getRemarkPluginsWithoutMdx';

export const remarkMdx: typeof attachMdx = Object.assign(
  function (
    this: ThisParameterType<typeof attachMdx>,
    ...args: Parameters<typeof attachMdx>
  ) {
    return attachMdx.apply(this, args);
  },
  { __pluginTag: REMARK_MDX_TAG }
);
