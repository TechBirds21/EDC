// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { componentTagger } from "file:///home/project/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "/home/project";
var vite_config_default = defineConfig(({ mode }) => {
  const plugins = [react()];
  if (mode === "development") {
    try {
      const taggerPlugin = componentTagger();
      if (Array.isArray(taggerPlugin)) {
        plugins.push(...taggerPlugin);
      } else if (taggerPlugin) {
        plugins.push(taggerPlugin);
      }
    } catch (error) {
      console.warn("Failed to initialize componentTagger plugin:", error);
    }
  }
  return {
    server: {
      host: "::",
      port: 8080
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src")
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0LXN3Yyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGNvbXBvbmVudFRhZ2dlciB9IGZyb20gXCJsb3ZhYmxlLXRhZ2dlclwiO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuICBjb25zdCBwbHVnaW5zID0gW3JlYWN0KCldO1xuXG4gIC8vIEFkZCBjb21wb25lbnRUYWdnZXIgb25seSBpbiBkZXZlbG9wbWVudCBtb2RlXG4gIGlmIChtb2RlID09PSAnZGV2ZWxvcG1lbnQnKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHRhZ2dlclBsdWdpbiA9IGNvbXBvbmVudFRhZ2dlcigpO1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkodGFnZ2VyUGx1Z2luKSkge1xuICAgICAgICBwbHVnaW5zLnB1c2goLi4udGFnZ2VyUGx1Z2luKTtcbiAgICAgIH0gZWxzZSBpZiAodGFnZ2VyUGx1Z2luKSB7XG4gICAgICAgIHBsdWdpbnMucHVzaCh0YWdnZXJQbHVnaW4gYXMgYW55KTtcbiAgICAgIH1cbiAgICAgIC8vIElmIG51bGwvdW5kZWZpbmVkLCBkbyBub3RoaW5nLlxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ0ZhaWxlZCB0byBpbml0aWFsaXplIGNvbXBvbmVudFRhZ2dlciBwbHVnaW46JywgZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgc2VydmVyOiB7XG4gICAgICBob3N0OiBcIjo6XCIsXG4gICAgICBwb3J0OiA4MDgwLFxuICAgIH0sXG4gICAgcGx1Z2lucyxcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczoge1xuICAgICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUNBLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFKaEMsSUFBTSxtQ0FBbUM7QUFPekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDeEMsUUFBTSxVQUFVLENBQUMsTUFBTSxDQUFDO0FBR3hCLE1BQUksU0FBUyxlQUFlO0FBQzFCLFFBQUk7QUFDRixZQUFNLGVBQWUsZ0JBQWdCO0FBQ3JDLFVBQUksTUFBTSxRQUFRLFlBQVksR0FBRztBQUMvQixnQkFBUSxLQUFLLEdBQUcsWUFBWTtBQUFBLE1BQzlCLFdBQVcsY0FBYztBQUN2QixnQkFBUSxLQUFLLFlBQW1CO0FBQUEsTUFDbEM7QUFBQSxJQUVGLFNBQVMsT0FBTztBQUNkLGNBQVEsS0FBSyxnREFBZ0QsS0FBSztBQUFBLElBQ3BFO0FBQUEsRUFDRjtBQUVBLFNBQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxJQUNSO0FBQUEsSUFDQTtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBLFFBQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLE1BQ3RDO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
