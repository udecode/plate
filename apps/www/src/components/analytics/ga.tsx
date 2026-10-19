import { GoogleAnalytics } from '@next/third-parties/google';
import type { FC } from 'react';

export const GA: FC = () => {
  if (!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
    return null;
  }

  return <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />;
};
