import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base MUST match the repo name for GitHub Pages, since the site is served
// from https://<user>.github.io/<repo-name>/ — a subpath, not the domain
// root. Getting this wrong is the #1 cause of a blank white page after a
// GitHub Pages deploy (assets get requested from the wrong path).
export default defineConfig({
  plugins: [react()],
  base: '/mental-health-app/',
})
