import { DeserializeHtml } from 'deserializers/types';
import { DeserializeHeadingOptions, HeadingType } from './types';

export const deserializeHeading = ({
  levels = 6,
  typeH1 = HeadingType.H1,
  typeH2 = HeadingType.H2,
  typeH3 = HeadingType.H3,
  typeH4 = HeadingType.H4,
  typeH5 = HeadingType.H5,
  typeH6 = HeadingType.H6,
}: DeserializeHeadingOptions = {}): DeserializeHtml => {
  const headingTags: any = {
    H1: () => ({ type: typeH1 }),
  };

  if (levels >= 2) headingTags.H2 = () => ({ type: typeH2 });
  if (levels >= 3) headingTags.H3 = () => ({ type: typeH3 });
  if (levels >= 4) headingTags.H4 = () => ({ type: typeH4 });
  if (levels >= 5) headingTags.H5 = () => ({ type: typeH5 });
  if (levels >= 6) headingTags.H6 = () => ({ type: typeH6 });

  return {
    element: headingTags,
  };
};
