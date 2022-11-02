export const commentsValue = [
  {
    type: 'p',
    children: [
      { text: 'A line of text in a ' },
      {
        type: 'thread',
        thread: {
          id: '7fca1d48-7349-4308-bfdf-310eeffc7df3',
          comments: [
            {
              id: '4c176ac0-1238-4bca-b5fd-ecac09d71bcf',
              text: 'This is a comment.',
              createdAt: 1663453625129,
              createdBy: {
                id: '1',
                name: 'John Doe',
                email: 'osama@gmail.com',
                avatarUrl:
                  'https://avatars.githubusercontent.com/u/1863771?v=4',
              },
            },
          ],
          isResolved: false,
          createdBy: {
            id: '1',
            name: 'John Doe',
            email: 'osama@gmail.com',
            avatarUrl: 'https://avatars.githubusercontent.com/u/1863771?v=4',
          },
        },
        selected: false,
        children: [{ text: 'paragraph' }],
      },
      { text: '.' },
    ],
  },
  {
    type: 'p',
    children: [
      { text: '' },
      {
        type: 'thread',
        thread: {
          id: 'df5f35a5-97c1-4ccd-9c1e-f906052eb0ef',
          comments: [
            {
              id: '186be713-4a12-4073-bfe5-693b8a59b2b4',
              text: 'What?',
              createdAt: 1663453729191,
              createdBy: {
                id: '1',
                name: 'John Doe',
                email: 'osama@gmail.com',
                avatarUrl:
                  'https://avatars.githubusercontent.com/u/1863771?v=4',
              },
            },
          ],
          isResolved: false,
          createdBy: {
            id: '1',
            name: 'John Doe',
            email: 'osama@gmail.com',
            avatarUrl: 'https://avatars.githubusercontent.com/u/1863771?v=4',
          },
        },
        selected: false,
        children: [{ text: 'Lorem' }],
      },
      { text: ' ipsum dolor sit ' },
      {
        type: 'thread',
        thread: {
          id: '02ecd299-a900-4961-86cb-f0049f4c2688',
          comments: [
            {
              id: '6dcc8d26-0497-4676-98eb-ac5535bb5ff7',
              text: 'This is a resolved comment.',
              createdAt: 1663453740180,
              createdBy: {
                id: '1',
                name: 'John Doe',
                email: 'osama@gmail.com',
                avatarUrl:
                  'https://avatars.githubusercontent.com/u/1863771?v=4',
              },
            },
          ],
          isResolved: true,
          createdBy: {
            id: '1',
            name: 'John Doe',
            email: 'osama@gmail.com',
            avatarUrl: 'https://avatars.githubusercontent.com/u/1863771?v=4',
          },
        },
        selected: false,
        children: [{ text: 'amet' }],
      },
      {
        text:
          ' consectetur, adipisicing elit. Nobis consequuntur modi odit incidunt unde animi molestias necessitatibus nisi ab optio dolorum, libero placeat aut, facere tempore accusamus veniam voluptatem aspernatur.',
      },
    ],
  },
  { type: 'p', children: [{ text: '' }] },
];
