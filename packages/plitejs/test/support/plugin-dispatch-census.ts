import { createEditor } from 'plitejs';
import { authored } from 'plitejs/authored';
import { dom } from 'plitejs/dom';
import { history } from 'plitejs/history';

import { getPluginRegistry } from '../../src/core/plugin-registry';
import { getTxMethodLocate, isTxOnlyMethod } from '../../src/core/tx-only';
import type { AnyEditor } from '../../src/interfaces/editor';

export const censusRuntimeEditor = () =>
  createEditor({
    plugins: [dom(), history(), authored({ authorId: 'census' })],
  });

// `length` stops counting at the first default or rest parameter, so
// `(options = {}) => …` reports 0; read the parameter list instead.
const takesArguments = (method: (...args: never[]) => unknown) => {
  const source = Function.prototype.toString.call(method);

  if (/^(?:async\s+)?[\w$]+\s*=>/.test(source)) return true;

  const open = source.indexOf('(');

  return open !== -1 && source.slice(open + 1).trimStart()[0] !== ')';
};

export const collectUpdateDeclarations = (editor: AnyEditor) => {
  const undeclared: string[] = [];
  let methods = 0;
  const walk = (value: unknown, path: string) => {
    if (typeof value === 'function') {
      methods += 1;
      if (
        (value.length > 0 || takesArguments(value)) &&
        !isTxOnlyMethod(value) &&
        getTxMethodLocate(value) === undefined
      ) {
        undeclared.push(path);
      }
    }
    if (
      value === null ||
      (typeof value !== 'object' && typeof value !== 'function')
    ) {
      return;
    }
    for (const [name, member] of Object.entries(value)) {
      walk(member, `${path}.${name}`);
    }
  };
  editor.update((tx) => {
    for (const [name, registration] of getPluginRegistry(editor).txGroups) {
      walk(registration.factory(tx, editor, { afterCommit() {} }), name);
    }
  });
  return { methods, undeclared };
};
