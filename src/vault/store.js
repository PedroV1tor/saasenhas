import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { dirname } from 'node:path';

const emptyData = () => ({ users: {} });

// Usado nos testes: nada vai para o disco.
export function createMemoryStore() {
  let data = emptyData();
  return {
    async load() {
      return structuredClone(data);
    },
    async save(next) {
      data = structuredClone(next);
    },
  };
}

export function createFileStore(filePath) {
  return {
    async load() {
      try {
        return JSON.parse(await readFile(filePath, 'utf8'));
      } catch (err) {
        if (err.code === 'ENOENT') return emptyData();
        throw err;
      }
    },
    async save(data) {
      await mkdir(dirname(filePath), { recursive: true });
      // Escreve num temporário e renomeia, para não corromper o cofre se o processo cair no meio.
      const tmp = `${filePath}.tmp`;
      await writeFile(tmp, JSON.stringify(data, null, 2));
      await rename(tmp, filePath);
    },
  };
}
