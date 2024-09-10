import React from 'react';

import type { AppType } from 'next/dist/shared/lib/utils';

// eslint-disable-next-line import/no-unresolved
import '~/styles/globals.css';

const MyApp: AppType = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default MyApp;
