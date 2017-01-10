/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import * as glob from 'glob';
import * as rimraf from 'rimraf';

export const readDir = (pattern: string, options: glob.IOptions = {}) => new Promise<string[]>((resolve, reject) =>
  glob(pattern, options, (err, result) => (err ? reject(err) : resolve(result))),
);

interface RimrafOptions {
  maxBusyTries?: number;
  emfileWait?: number;
  glob?: glob.IOptions;
  disableGlob?: boolean;
}

type RimrafCallback = (err: Error, matches: string[]) => void;

interface Yarimraf {
  (pattern: string, options: RimrafOptions, callback?: RimrafCallback): void;
  (pattern: string, callback?: RimrafCallback): void;
}

export const cleanDir = (pattern: string, options: glob.IOptions = {}) => new Promise<string[]>((resolve, reject) =>
  (rimraf as Yarimraf)(pattern, { glob: options }, (err, result) => (err ? reject(err) : resolve(result))),
);
