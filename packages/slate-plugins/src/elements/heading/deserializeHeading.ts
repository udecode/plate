import { DeserializeHtml } from 'paste-html/types';
import { DeserializeHeadingOptions, HeadingType } from './types';

export const deserializeHeading = ({
  levels = 6,
}: DeserializeHeadingOptions): DeserializeHtml => {
  const headingTags: any = {
    H1: () => ({ type: HeadingType.H1 }),
  };

  if (levels >= 2) headingTags.H2 = () => ({ type: HeadingType.H2 });
  if (levels >= 3) headingTags.H3 = () => ({ type: HeadingType.H3 });
  if (levels >= 4) headingTags.H4 = () => ({ type: HeadingType.H4 });
  if (levels >= 5) headingTags.H5 = () => ({ type: HeadingType.H5 });
  if (levels >= 6) headingTags.H6 = () => ({ type: HeadingType.H6 });

  return {
    element: headingTags,
  };
};
