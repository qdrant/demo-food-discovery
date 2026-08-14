import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The backend (main.py) serves static files from ./build, and the Dockerfile
// copies the frontend's build output there, so emit to "build".
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "build",
    target: "esnext",
  },
});
