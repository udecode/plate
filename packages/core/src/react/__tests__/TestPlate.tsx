import React from 'react';

import { Plate, type PlateProps } from '../components/Plate';

export const TestPlate = (props: PlateProps<any>) => (
  <Plate suppressInstanceWarning {...props} />
);
