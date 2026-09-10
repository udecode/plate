import { type PlateStaticProps, PlateStatic } from '../../static';

export type PlateViewProps<E = PlateStaticProps['editor']> =
  PlateStaticProps<E>;

export const PlateView = PlateStatic;
