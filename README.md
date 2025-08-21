# Lazy SPA
These single page apps are lazily created using AI and some sugar!

## Deployment

The `main` branch is automatically built and deployed to the `gh-pages` branch via GitHub Actions.

## Testing

End-to-end render tests are powered by [Playwright](https://playwright.dev/). To run them locally:

```bash
cd apps
npm run test:playwright
```

During pull requests a workflow runs these tests and uploads page screenshots as build artifacts.
