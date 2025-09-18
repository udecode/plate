'use client';

import * as React from 'react';

import { AIChatPlugin } from '@platejs/ai/react';
import { useEditorPlugin } from 'platejs/react';

import { ToolbarButton } from './toolbar';

export function AIToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const { api, editor } = useEditorPlugin(AIChatPlugin);

  return (
    <ToolbarButton
      {...props}
      onClick={() => {
        api.aiChat.show();

        // const nodes = [{ text: '111', id: 1 }];

        // const nodes = [
        //   {
        //     children: [
        //       {
        //         text: '111',
        //       },
        //     ],
        //     type: 'p',
        //     id: 'TOD9VvM5gf',
        //   },
        //   {
        //     children: [
        //       {
        //         text: '222',
        //       },
        //     ],
        //     type: 'p',
        //     id: 'KdnQaU5WPw',
        //   },
        // ];

        // editor.tf.insertFragment(nodes);

        // const path = editor.api.findPath(nodes[0], { text: true });

        // console.log('🚀 ~ AIToolbarButton ~ path:', path);
      }}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
    />
  );
}
