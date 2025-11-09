import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  main: {
    build: {
      outDir: 'dist/main',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/presentation/main/index.ts')
        },
        external: ['bufferutil', 'utf-8-validate']
      }
    },
    resolve: {
      alias: {
        '@domain': resolve(__dirname, 'src/domain'),
        '@application': resolve(__dirname, 'src/application'),
        '@infrastructure': resolve(__dirname, 'src/infrastructure'),
        '@presentation': resolve(__dirname, 'src/presentation'),
        '@shared': resolve(__dirname, 'src/shared')
      }
    },
    plugins: [externalizeDepsPlugin({ exclude: ['bufferutil', 'utf-8-validate'] })]
  },
  preload: {
    build: {
      outDir: 'dist/preload',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/presentation/preload/index.ts')
        }
      }
    }
  },
  renderer: {
    root: resolve(__dirname, 'src/presentation/renderer'),
    build: {
      outDir: resolve(__dirname, 'dist/renderer'),
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/presentation/renderer/index.html')
        }
      }
    },
    resolve: {
      alias: {
        '@shared': resolve(__dirname, 'src/shared'),
        '@infrastructure': resolve(__dirname, 'src/infrastructure')
      }
    },
    plugins: [react()]
  }
});

