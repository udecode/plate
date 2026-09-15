'use client';

import { ElementIdPlugin } from 'platejs';
import { toReactPlugin } from 'platejs/react';

export const HtmlExportSchemaKit = [toReactPlugin(ElementIdPlugin)] as const;
