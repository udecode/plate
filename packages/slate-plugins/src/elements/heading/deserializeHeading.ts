import { DeserializeHtml } from 'common/types';
import { getDeserializer } from 'element/utils';
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
  let headingTags = getDeserializer(typeH1, ['H1']);

  if (levels >= 2)
    headingTags = { ...headingTags, ...getDeserializer(typeH2, ['H2']) };
  if (levels >= 3)
    headingTags = { ...headingTags, ...getDeserializer(typeH3, ['H3']) };
  if (levels >= 4)
    headingTags = { ...headingTags, ...getDeserializer(typeH4, ['H4']) };
  if (levels >= 5)
    headingTags = { ...headingTags, ...getDeserializer(typeH5, ['H5']) };
  if (levels >= 6)
    headingTags = { ...headingTags, ...getDeserializer(typeH6, ['H6']) };

  return {
    element: headingTags,
  };
};
