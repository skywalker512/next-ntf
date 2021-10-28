// @ts-check
import fs from 'fs-extra';
import path from 'path';
import { URL } from 'url';
import fg from 'fast-glob';

const ntfPaths = await fg(['**/*.nft.json'], {
  cwd: new URL('../.next', import.meta.url).pathname,
  absolute: true,
  ignore: ['cache']
});

/**
 * @type {Set<string>}
 */
const ntfSet = new Set();

await Promise.all(
  ntfPaths.map(async (ntfPath) => {
    /**
     * @type {{
     *  version: number,
     *  cacheKey: string,
     *  files: Array<string>
     * }}
     */
    const ntf = JSON.parse((await fs.readFile(ntfPath)).toString());
    for (const file of ntf.files) {
      if (file.includes('node_modules')) {
        ntfSet.add('.' + file.split('node_modules').slice(1).join('node_modules'));
      }
    }
  }),
);

const tmpPath = new URL('../tmp', import.meta.url).pathname;
await fs.emptyDir(tmpPath);

/**
 * @type {Array<Promise<void>>}
 */
const promiseList = []
for (const filePath of ntfSet) {
  promiseList.push((async () => {
    try {
      await fs.copy(
        path.resolve(tmpPath, '../node_modules', filePath),
        path.resolve(tmpPath, filePath),
      );
    } catch (error) {
      console.log(error)
    }

  })())
}

await Promise.all(promiseList)

await fs.copy(new URL('./config-utils.js', import.meta.url).pathname, path.resolve(tmpPath, './next/dist/server/config-utils.js'))
