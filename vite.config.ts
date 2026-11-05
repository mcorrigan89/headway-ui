/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const at = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// The preview imports the registry's own files through the same aliases a
// consumer's project uses, so what you see is exactly what gets installed.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  // one page with every component on it; not worth splitting
  build: { chunkSizeWarningLimit: 1600 },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: /^@\/components\/ui\//, replacement: at('./registry/headway/ui/') },
      { find: /^@\/components\/blocks\//, replacement: at('./registry/headway/blocks/') },
      { find: /^@\/lib\//, replacement: at('./registry/headway/lib/') },
      { find: /^@\/hooks\//, replacement: at('./registry/headway/hooks/') },
      { find: /^@\/docs\//, replacement: at('./src/') },
    ],
  },
  test: {
    include: ['tests/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
  },
});
