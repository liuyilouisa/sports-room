// apps/server/test/setup.ts
import { createApp, close } from '@midwayjs/mock';
import { join } from 'path';

export let app: any;

beforeAll(async () => {
  // 直接让框架按 src/config/config.unittest.ts 里的配置创建内存 SQLite
  app = await createApp(join(__dirname, '..'), {
    env: 'unittest',   // 会自动加载 config.unittest.ts
  });
});

afterAll(async () => {
  await close(app);
});
