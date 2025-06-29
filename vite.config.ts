
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const plugins = [react()];

  // Add componentTagger only in development mode
  if (mode === 'development') {
    try {
      const taggerPlugin = componentTagger();
      if (Array.isArray(taggerPlugin)) {
        plugins.push(...taggerPlugin);
      } else if (taggerPlugin) {
        plugins.push(taggerPlugin as any);
      }
      // If null/undefined, do nothing.
    } catch (error) {
      console.warn('Failed to initialize componentTagger plugin:', error);
    }
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
