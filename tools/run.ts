/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

function format(time: Date) {
  return time.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');
}

interface Task<T, U> {
  (options?: U): Promise<T>;
  default?: Task<T, U>;
}

function run<T, U>(fn: Task<T, U>, options?: U): Promise<T> {
  const task = typeof fn.default === 'undefined' ? fn : fn.default;
  const start = new Date();
  console.log(
    `[${format(start)}] Starting '${task.name}${options ? ` (${options})` : ''}'...`,
  );
  return task(options).then(resolution => {
    const end = new Date();
    const time = end.getTime() - start.getTime();
    console.log(
      `[${format(end)}] Finished '${task.name}${options ? ` (${options})` : ''}' after ${time} ms`,
    );
    return resolution;
  });
}

if (require.main === module && process.argv.length > 2) {
  delete require.cache[__filename];
  const module = require(`./${process.argv[2]}.ts`).default;
  run(module).catch((err: Error) => { console.error(err.stack); process.exit(1); });
}

export default run;
