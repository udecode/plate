import React from 'react';

export const useFixHydration = () => {
  const [loaded, setLoaded] = React.useState(false);

  // Fix hydration
  React.useEffect(() => {
    setLoaded(true);
  }, []);

  return loaded;
};
