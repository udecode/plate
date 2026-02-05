'use client';

import { CalloutPlugin } from '@platejs/callout/react';

import { CalloutElement } from '@/registry/ui/callout-node';

export const CalloutKit = [CalloutPlugin.withComponent(CalloutElement)];
