'use client';

export const streamText = async ({
  abortController,
  prompt,
  system,
  onChunk,
  // onStatusChange,
}: {
  abortController: AbortController;
  prompt: string;
  system: string;
  onChunk: (chunk: string) => Promise<void> | void;
  // onStatusChange?: (status: AIStatus) => void;
}) => {
  const fullText = '';

  try {
    // const response = await fetchStream({
    //   abortSignal: abortController,
    //   prompt,
    //   system,
    // }).catch((error) => {
    //   // onStatusChange?.('error');
    //   return error;
    // });
    // const reader = response.getReader();
    // const decoder = new TextDecoder();
    // // onStatusChange?.('streaming');
    // while (true) {
    //   const { done, value } = await reader.read();
    //   if (done) break;
    //   if (value) {
    //     const chunk = decoder.decode(value);
    //     if (typeof chunk !== 'string' || chunk.length === 0) continue;
    //     fullText += chunk;
    //     await onChunk(chunk);
    //   }
    // }
  } catch {
    // onStatusChange?.('error');
  }

  return { text: fullText };
};

// export const _streamTraversal = async (
//   editor: PlateEditor,
//   fn: (delta: string | null, done: boolean) => void,
//   { prompt, system }: StreamTraversalOptions
// ) => {
//   editor.setOptions(AIPlugin, { status: 'streaming' });

//   // Mock the reader and decoder
//   const arr = [
//     { done: false, value: `Hello` },
//     { done: false, value: `Hello` },
//     { done: false, value: `Hello` },
//     { done: true, value: `Hello` },
//     // { done: false, value: `3. You can also open the AI menu by using slash` },
//     // { done: false, value: ` command` },
//     // {
//     //   done: false,
//     //   value: `'. Type '/' in the following block or end of this block.`,
//     // },
//     // {
//     //   done: true,
//     //   value: `\n\n<br>\n\n### Additional Tips for Using the AI Menu\n4`,
//     // },
//     // {
//     //   done: true,
//     //   value: `## Additional Tips for Using tasdasdasdasdasdasdasdadasdasdasdasdadahe AI Menu\n4`,
//     // },
//     // {
//     //   done: true,
//     //   value: `## Additional Tips for Using tasdasdasdasdasdasdasdadasdasdasdasdadahe AI Menu`,
//     // },
//     // {
//     //   done: true,
//     //   value: `## Additional Tips for Using tasdasdasdasdasdasdasdadasdasdasdasdadahe AI Menu`,
//     // },
//   ];

//   let currentIndex = 0;

//   const mockReader = {
//     read: async () => {
//       // Simulate some async delay
//       await new Promise((resolve) => setTimeout(resolve, 100));

//       if (currentIndex >= arr.length) {
//         return { done: true, value: undefined };
//       } else {
//         const value = arr[currentIndex].value;
//         currentIndex++;

//         return { done: false, value: new TextEncoder().encode(value) };
//       }
//     },
//   };

//   const mockDecoder = {
//     decode: (value: Uint8Array) => new TextDecoder().decode(value),
//   };

//   while (true) {
//     const { done, value } = await mockReader.read();

//     if (done) {
//       fn(null, done);

//       break;
//     }
//     if (value) {
//       const delta = mockDecoder.decode(value);
//       fn(delta, done);
//     }
//   }
// };
