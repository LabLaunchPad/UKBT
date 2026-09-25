# Contributing to UKBT

## Development Setup
1. Install Node 22+ and pnpm 10.x
2. Run `pnpm install` to set up the monorepo
3. Run `pnpm dev` to start the dev server
4. Run `pnpm build` for production build
5. Run `pnpm test` for unit tests

## Code Quality
- Lint: `pnpm run lint` (Biome)
- Typecheck: `pnpm run typecheck`
- Tests: `pnpm run test`

## Deployment
All changes go through pull requests to main. The branch requires 18 CI checks to pass (plus Workers Builds / deploys).
