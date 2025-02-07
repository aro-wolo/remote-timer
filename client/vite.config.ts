import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";

dotenv.config();

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		host: process.env.VITE_WS_HOST || "localhost",
		port: process.env.VITE_CLIENT_PORT
			? parseInt(process.env.VITE_CLIENT_PORT)
			: 3000,
	},
});
