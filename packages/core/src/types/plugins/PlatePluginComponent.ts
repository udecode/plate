import { AnyObject } from '../utility/AnyObject';
import { RenderFunction } from '../utility/RenderFunction';

export type PlatePluginComponent<T = AnyObject> = RenderFunction<T>;
