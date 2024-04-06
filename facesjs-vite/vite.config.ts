import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vitest/config";
import chokidar from 'chokidar';
import path from 'path';
import processSVGs from './src/features/face_utils/processSVGs'

// Use this var such that Vite hot-reloading doesn't add multiple chokidar watchers
let isWatcherSetup = false;

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		TanStackRouterVite(),
		{
			name: 'watch-for-svg-changes',
			configureServer(server) {
				if (isWatcherSetup) return;
				isWatcherSetup = true;

				chokidar
					.watch([path.join(__dirname, "..", "svgs"), path.join(__dirname, "./src/features/face_utils/processSVGs.ts")], {
						ignoreInitial: false,
					})
					.on("all", (event, path) => {
						console.log(`Processing SVGs due to ${event} at ${path}`);
						processSVGs();
					});

			},
		},
	],
	server: {
		host: true,
		strictPort: true,
	},
});
