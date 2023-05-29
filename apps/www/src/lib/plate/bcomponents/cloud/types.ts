import { Dispatch, SetStateAction } from 'react';

export type ImageSize = { width: number; height: number };

export type SetImageSize = Dispatch<SetStateAction<ImageSize>>;
