import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  webServer: {
    command: 'npm run preview',
    port: 4173,
    reuseExistingServer: !process.env.CI,
  },

  use: {
    // pick one:
    screenshot: 'on', // or 'on'
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  // Optional: put all outputs in a predictable folder
  outputDir: 'test-results',
});
