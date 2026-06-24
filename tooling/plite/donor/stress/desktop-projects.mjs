import * as os from 'node:os';

export const getDesktopProjects = () => {
  const projects = ['chromium', 'firefox'];

  if (os.type() === 'Darwin') {
    projects.push('webkit');
  }

  return projects;
};
