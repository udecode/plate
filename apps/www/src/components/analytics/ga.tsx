import type { FC } from 'react';

import { GoogleAnalytics } from '@next/third-parties/google';

export const GA: FC = () => {
  if (!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
    return null;
  }

  return <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />;
};
