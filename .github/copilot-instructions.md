# Project Verification

- After every prompt that changes repository files, run `npm run verify` before reporting completion.
- Treat component/integration tests, lint, the production build, and Playwright browser smoke tests as required checks.
- Fix failures caused by the current change. Do not claim completion while `npm run verify` fails.
- Browser smoke coverage lives in `e2e/app.spec.ts`; extend it when adding a new user-facing workflow.