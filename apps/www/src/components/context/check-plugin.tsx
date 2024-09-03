// render children only if editor.plugins[id] exists

import type { WithRequiredKey } from '@udecode/plate-core';

import { useEditorRef } from '@udecode/plate-common/react';
import { castArray } from 'lodash';

import { useDemoId } from '@/registry/default/example/playground-demo';

import { settingsStore } from './settings-store';

export const CheckPlugin = ({
  children,
  component,
  componentId,
  id,
  plugin,
}: {
  children: React.ReactNode;
  component?: any;
  componentId?: string;
  id?: string | string[];
  plugin?: WithRequiredKey;
}) => {
  const editor = useEditorRef();
  const demoId = useDemoId();
  const enabledComponent = settingsStore.use.checkedComponentId(componentId);

  if (componentId && !enabledComponent) {
    return null;
  }

  const ids = castArray(id);

  const isEnabled =
    (!demoId && component !== false) || !demoId || ids.includes(demoId);

  if (!isEnabled) {
    return null;
  }
  if (plugin && !editor?.plugins[plugin.key]) {
    return null;
  }

  return children;
};
