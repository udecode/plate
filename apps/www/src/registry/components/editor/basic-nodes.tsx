'use client';

import { BasicBlocksKit } from './basic-blocks';
import { BasicMarksKit } from './basic-marks';

export const BasicNodesKit = [...BasicBlocksKit, ...BasicMarksKit] as const;
