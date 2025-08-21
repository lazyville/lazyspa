# LazySPA

LazySPA (pronounced "spa") is a collection of single-page applications lazily assembled using AI and a bit of sugar. It serves as an experimental playground for building turn-based fun games that can scale with AI-driven development.

## Vision
We want to build a growing lineup of turn-based games that are fun, accessible, and easy to iterate on. By leaning on AI to generate and evolve these apps, we aim to create many small games that people can play right in their browser.

## Development
Each app is generated and refined with AI tooling and modern web tech such as Vite, React, and Tailwind CSS. The goal is to keep development light-weight and fast so new ideas can be prototyped quickly.

## License
LazySPA is released under the MIT License. See [LICENSE](LICENSE) for more information.

## Deployment
The `main` branch is automatically built and deployed to the `gh-pages` branch via GitHub Actions.

## Testing

End-to-end render tests are powered by [Playwright](https://playwright.dev/). To run them locally:

```bash
cd apps
npm run test:playwright
```

During pull requests a workflow runs these tests and uploads page screenshots as build artifacts.
