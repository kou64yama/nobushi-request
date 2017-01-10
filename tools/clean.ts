import { cleanDir } from './lib/fs';

/**
 * Cleans up the output (lib) directory.
 */
function clean(): Promise<string[]> {
  return cleanDir('lib/*', { nosort: true, dot: true });
}

export default clean;
