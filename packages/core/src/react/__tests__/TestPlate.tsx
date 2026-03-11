import React from 'react';

import { Plate } from '../components/Plate';

export const TestPlate = (props: React.ComponentProps<typeof Plate>) => (
  <Plate suppressInstanceWarning {...props} />
);
