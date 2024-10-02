import { Path } from 'slate';

export const getNextPathByNumber = (startPath: Path, number: number) => {
  let workPath = startPath;

  for (let i = 0; i < number; i++) {
    workPath = Path.next(workPath);
  }

  return workPath;
};
