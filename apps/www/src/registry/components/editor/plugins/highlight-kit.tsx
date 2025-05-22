'use client';

import { HighlightPlugin } from '@udecode/plate-highlight/react';

import { HighlightLeaf } from '@/registry/ui/highlight-node';

export const HighlightKit = [HighlightPlugin.withComponent(HighlightLeaf)];
