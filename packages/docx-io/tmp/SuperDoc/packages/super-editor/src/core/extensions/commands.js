import { Extension } from '../Extension.js';
import * as commands from '../commands/index.js';

export const Commands = Extension.create({
  name: 'commands',

  addCommands() {
    return { ...commands };
  },
});
