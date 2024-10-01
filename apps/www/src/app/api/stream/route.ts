export function POST() {
  const streams = [
    { delay: 100, texts: 'Hello' },
    { delay: 200, texts: 'World' },
  ];

  const stream = new ReadableStream({
    async start(controller) {
      for (const stream of streams) {
        await new Promise((resolve) => setTimeout(resolve, stream.delay)); // Increasing delay
        controller.enqueue(stream.texts);
      }

      controller.close();
    },
  });

  return new Response(stream);
}
