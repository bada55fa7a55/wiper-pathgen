import path from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import tsconfigPaths from 'vite-tsconfig-paths';
import { execSync } from 'node:child_process';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));
const buildTimestamp = new Date().toISOString();
const gitHash = (() => {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: projectRoot, stdio: 'pipe' }).toString().trim();
  } catch {
    return 'unknown';
  }
})();

export default defineConfig({
  define: {
    __BUILD_DATE__: JSON.stringify(buildTimestamp),
    __GIT_HASH__: JSON.stringify(gitHash),
  },
  plugins: [tailwindcss(), solid(), tsconfigPaths()],
  resolve: {
    //dedupe: ['solid-js', 'solid-js/web', 'solid-js/store'],
    alias: {
      'solid-js': path.resolve(projectRoot, 'node_modules/solid-js'),
      src: fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    // include: ['solid-js', 'solid-js/web', 'solid-js/store'],
  },
});
