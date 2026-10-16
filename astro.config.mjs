import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.gabrieledesideri.it',
  trailingSlash: 'never',
  build: { format: 'file' },
});
