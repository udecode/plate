import { DeserializeHtml } from '../../common';
import { getElementDeserializer } from '../../element/utils';
import { HeadingDeserializeOptions, HeadingType } from './types';

export const deserializeHeading = ({
  levels = 6,
  typeH1 = HeadingType.H1,
  typeH2 = HeadingType.H2,
  typeH3 = HeadingType.H3,
  typeH4 = HeadingType.H4,
  typeH5 = HeadingType.H5,
  typeH6 = HeadingType.H6,
}: HeadingDeserializeOptions = {}): DeserializeHtml => {
  let headingTags = getElementDeserializer(typeH1, { tagNames: ['H1'] });

  if (levels >= 2)
    headingTags = {
      ...headingTags,
      ...getElementDeserializer(typeH2, { tagNames: ['H2'] }),
    };
  if (levels >= 3)
    headingTags = {
      ...headingTags,
      ...getElementDeserializer(typeH3, { tagNames: ['H3'] }),
    };
  if (levels >= 4)
    headingTags = {
      ...headingTags,
      ...getElementDeserializer(typeH4, { tagNames: ['H4'] }),
    };
  if (levels >= 5)
    headingTags = {
      ...headingTags,
      ...getElementDeserializer(typeH5, { tagNames: ['H5'] }),
    };
  if (levels >= 6)
    headingTags = {
      ...headingTags,
      ...getElementDeserializer(typeH6, { tagNames: ['H6'] }),
    };

  return {
    element: headingTags,
  };
};
