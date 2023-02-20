import { createPluginFactory } from '../../utils/plate/createPluginFactory';
import { withInsertData } from './withInsertData';

export const KEY_INSERT_DATA = 'insertData';

export const createInsertDataPlugin = createPluginFactory({
  key: KEY_INSERT_DATA,
  withOverrides: withInsertData,
});
