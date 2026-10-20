const { file } = Bun;

export const read = (name: string) => file(name).text();
