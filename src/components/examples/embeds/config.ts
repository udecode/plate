import { Node } from 'slate';

export const initialValue: Node[] = [
  {
    children: [
      {
        text:
          'In addition to simple image nodes, you can actually create complex embedded nodes. For example, this one contains an input element that lets you change the video being rendered!',
      },
    ],
  },
  {
    type: 'video',
    url: 'https://player.vimeo.com/video/26689853',
    children: [{ text: '' }],
  },
  {
    children: [
      {
        text:
          'Try it out! This editor is built to handle Vimeo embeds, but you could handle any type.',
      },
    ],
  },
];
