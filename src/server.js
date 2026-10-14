import { createApp } from './app.js';
import { config } from './config.js';
import { createSessionManager } from './auth/sessions.js';
import { createFileStore } from './vault/store.js';
import { createVaultService } from './vault/vault-service.js';

const app = createApp({
  vaultService: createVaultService(createFileStore(config.dataFile)),
  sessions: createSessionManager({ ttlMinutes: config.sessionTtlMinutes }),
});

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`SaaSenhas ouvindo em http://localhost:${config.port}`);
});
