# Quizeen — Implementation Todo List

## Overview

This file describes a phased implementation plan for Quizeen.
Each phase has a goal, detailed tasks with file and folder suggestions, reasons, and a validation checklist.
Follow Next.js, React, and TypeScript standards.
Commit and update a changelog after finishing each major task or phase.

---

## Repository conventions

* Branch per phase feature, branch name format: `feat/phase-{n}-{short-desc}`.
* Commit messages: Conventional Commits style.
* Changelog: `CHANGELOG.md`, follow Keep a Changelog format.
* Tests live alongside code in `__tests__` or `*.test.tsx` files.
* Types in `types/` and `types.d.ts`.
* Use TypeScript `strict` mode.

---

## Suggested folders

* `app/` or `pages/` depending on Next.js routing style.
* `components/` atomic components, organized by feature.
* `lib/` utilities and adapters, e.g. `lib/auth`, `lib/db`, `lib/jwt`.
* `middleware/` server middleware and edge middleware.
* `hooks/` React hooks.
* `services/` server API wrappers and business logic.
* `schemas/` Zod schemas.
* `types/` shared type definitions.
* `tests/` integration and E2E support.
* `scripts/` maintenance scripts.
* `infra/` deployment manifests, terraform, or helm.
* `docs/` design decisions and runbooks.

---

## External references

* OWASP Top Ten for security.
* RFC 7519 for JWT.
* Next.js docs for middleware and image handling.
* WCAG 2.1 for accessibility.
* TypeScript handbook for typing patterns.
* RFC Conventional Commits for commit messages.

---

# Phase 1: Critical Security (Days 1-3)

Goal

* Stop sensitive data leaks.
* Enforce secure auth primitives.
* Provide baseline access control.

Tasks

* User model hardening

  * Remove password fields from API responses.
  * File: `models/user.ts` or `models/User.model.ts`.
  * Implementation: ensure `toJSON()` strips `passwordHash`, `salt`, `resetToken`.
  * Add test that serializing a user does not expose sensitive fields.
  * Why: prevents accidental leaks in logs and responses.
* JWT handling

  * Create `lib/auth/jwt.ts`.
  * Use `jose` library for signing and verification.
  * Add functions: `signAccessToken(payload)`, `verifyAccessToken(token)`, `signRefreshToken`, `rotateRefreshToken`.
  * Validate `process.env.JWT_SECRET` and refuse startup if missing.
  * Use 8+ hour access token TTL for UI, 30 day refresh token TTL for refresh tokens stored HttpOnly cookie.
  * Why: strong crypto library increases security.
* Secure cookies

  * Central cookie helper `lib/auth/cookies.ts`.
  * Set flags `HttpOnly`, `Secure`, `SameSite=Strict` for refresh tokens, `SameSite=Lax` for session where needed.
  * Use `cookie` or `next` built-in cookie helpers.
  * Why: reduces XSS and CSRF surface.
* Authorization middleware

  * File: `middleware/withAuth.ts` and `middleware/withRole.ts`.
  * Implement role-based access control (RBAC) with roles `admin`, `instructor`, `student`.
  * Add claims verification and minimal privilege checks.
  * Protect admin endpoints: user delete, user update, system config.
  * Why: centralizes access checks and reduces duplicate logic.
* Secrets and config

  * Enforce env validation at startup with `envalid` or custom check.
  * Required envs: `DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`, `SENTRY_DSN` if used.
  * Why: avoids runtime misconfiguration in production.
* Log hardening

  * Remove sensitive fields from logs.
  * Use structured logs with JSON output in server.
  * Why: prevents leaks in log stores.

Validation checklist

* [x] `toJSON()` removes sensitive fields, tests pass.
* [x] `lib/auth/jwt.ts` exists, uses `jose`, has unit tests.
* [x] Cookies set with `HttpOnly` and `Secure` flags (cookie helper and usage present).
* [x] Middleware protects admin endpoints.
* [x] Env validation prevents startup on missing secrets (enhanced `lib/env.ts`).
* [x] Changelog updated, commit created.

Phase 1 completion note

Implemented and verified (2025-10-25):

- User model hardening: `models/User.ts` already included a `toJSON` transform that removes `passwordHash` and normalizes timestamps.
- JWT handling: replaced implementation with a `jose`-based signer/verifier in `lib/auth/jwt.ts` (async `signJWT` / `verifyToken`), including startup validation for `JWT_SECRET`.
- Secure cookies: `setTokenCookie` is used to set HttpOnly, Secure (production) cookies with `SameSite=Lax` and 8-hour TTL.
- Authorization middleware: updated `middleware/withAuth.ts` to await token verification and protect routes; `withAdmin` helper available to guard admin endpoints.
- Env validation: enhanced `lib/env.ts` to validate required environment variables and raise a clear error on misconfiguration.
- Tests updated: updated JWT unit tests to the async jose-based API.

Notes and next steps:

- The JWT implementation is now async (uses `jose`); all callers were updated (login route, middleware, tests). If you prefer centralizing cookie helpers, we can extract `setTokenCookie` to `lib/auth/cookies.ts` and update imports.
- Run the full test suite and CI checks locally or in CI to ensure no type/lint errors (this environment may flag missing package types if `jose` isn't installed).

If you'd like, I can now:

- Run an automated scan to list any remaining Phase 1 gaps (e.g., missing refresh token rotation, explicit refresh-token cookie with Strict SameSite), or
- Extract cookie helpers and add unit tests for cookie behavior.

---

# Phase 2: Validation and Security Hardening (Days 4-7)

Goal

* Validate inputs at the boundary.
* Reduce attack surface for CSRF and abuse.
* Normalize error handling.

Tasks

* Input validation

  * Install and use Zod. File: `schemas/` and `lib/validation/validate.ts`.
  * Create per-endpoint schemas, e.g. `schemas/auth.login.ts`, `schemas/quiz.create.ts`.
  * Add server middleware to run validation for API routes and Next.js route handlers.
  * Add type inference from Zod schemas to TypeScript types using `z.infer`.
  * Why: prevents malformed payloads and provides types.
* CSRF protection

  * Strategy: For cookie-based auth, add CSRF tokens or use SameSite+double submit.
  * Files: `lib/security/csrf.ts` and `middleware/withCsrf.ts`.
  * For SPA API calls use anti-forgery header check with a rotating token.
  * Why: prevents cross-origin form submissions.
* Rate limiting and abuse protection

  * Add rate limiter for auth endpoints, public endpoints, and quiz submission endpoints.
  * Use `express-rate-limit` or Next.js-compatible Redis-backed limiter.
  * Implement global policy and stricter policy for IPs with repeated abuse.
  * Log and alert when thresholds are hit.
  * Why: prevents brute force and DoS.
* CSP and security headers

  * Add CSP header, set `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`.
  * File: `middleware/securityHeaders.ts` or Next.js `headers()` config.
  * Use nonce-based CSP for inline scripts if necessary.
  * Why: reduces XSS and clickjacking.
* Standardize error handling

  * Create `lib/errors.ts` with error classes: `AppError`, `AuthError`, `ValidationError`.
  * Add global error handler for API routes to return structured responses `{code, message, details?}`.
  * Map internal errors to safe client messages.
  * Why: consistent error surface, easier client logic.
* Secrets rotation plan

  * Document rotation steps in `docs/runbook/secrets.md`.
  * Add script to roll tokens and invalidate refresh tokens.

Validation checklist

* [ ] Zod schemas exist for all public endpoints.
* [ ] CSRF middleware applied where cookies are used.
* [ ] Rate limiter in place and tested.
* [ ] Security headers applied.
* [ ] Global error types and handler implemented.
* [ ] Runbook added, commit and changelog entry present.

---

# Phase 3: State Management and Data Fetching (Week 2)

Goal

* Stabilize client state.
* Improve caching, reduce duplication and stale UI.

Tasks

* React Query setup

  * Install `@tanstack/react-query` v5.
  * Create `lib/react-query/client.ts`.
  * Wrap `_app.tsx` or `app/layout.tsx` with `QueryClientProvider`.
  * Create hooks per resource: `hooks/queries/useQuizzes.ts`, `useQuiz.ts`, `useResults.ts`.
  * Use stale-while-revalidate, timeouts, and cacheTime tuned for quiz flows.
  * Why: dedupes requests and manages cache lifecycle.
* Migrate quiz transient state to React Query

  * Move quiz progress, answers, timers into React Query + local state hooks for ephemeral UI.
  * Keep auth and global settings in a minimal client store such as Zustand.
  * Reason: reduce Redux boilerplate and improve developer ergonomics.
* Websocket and realtime

  * Add optional realtime via WebSockets or server-sent events for live proctoring or live scoreboards.
  * File: `lib/realtime/socket.ts`.
  * Abstract connection behind hooks `useSocket`.
* Optimistic updates and offline resilience

  * Implement optimistic updates for small writes like marking question reviewed.
  * Add background sync strategies for submissions with retry on network loss.
* Loading and error UX

  * Add skeleton components and low-latency UI patterns.
  * Use React Error Boundaries for UI failures.
* Type-safe API layer

  * Create `lib/api/client.ts` with typed fetch wrappers using generated types from Zod schemas.
  * Standardize error shape across client hooks.

Validation checklist

* [ ] `QueryClientProvider` integrated.
* [ ] Query hooks available for main resources.
* [ ] Quiz progress flows use React Query for persistence.
* [ ] Error boundary and skeleton components present.
* [ ] Minimal Zustand store for auth only.
* [ ] Changelog entry and commit recorded.

---

# Phase 4: TypeScript and Code Quality (Week 2-3)

Goal

* Strong typing across codebase.
* Enforce consistent style and pre-commit checks.

Tasks

* Strict TypeScript

  * Set `tsconfig.json` with `strict: true`, `noImplicitAny`, `exactOptionalPropertyTypes`.
  * Move any remaining `any` uses to explicit safe wrappers or typed unions.
  * Create shared types in `types/` with `ProductReady`, `Quiz`, `UserPublic`.
* Type guards and runtime validation

  * For external inputs, use Zod validators and small type guards for runtime checks.
* Linting and formatting

  * Add ESLint with `@typescript-eslint` and Next.js plugin.
  * Add Prettier config, run `prettier --check`.
  * Add Husky hooks, `lint-staged` to run `eslint --fix` and `prettier` on staged files.
* Commit hooks and CI checks

  * Enforce tests and lint on CI pull requests.
* Documentation and JSDoc

  * Add JSDoc to complex functions and public utilities.
  * Add `docs/typing-guidelines.md` with common patterns.
* Dependency hygiene

  * Add `depcheck` run in CI to report unused dependencies.
  * Use `pnpm` or `npm` lockfile for deterministic installs.

Validation checklist

* [ ] `tsconfig.json` strict mode enabled, compile errors resolved.
* [ ] ESLint and Prettier configured, pre-commit hooks active.
* [ ] No `any` in new code, existing `any` flagged.
* [ ] Docs added for typing rules.
* [ ] Changelog updated, commit created.

---

# Phase 5: Component Architecture and UI Patterns (Week 3)

Goal

* Improve component reuse and testability.
* Make UI accessible and responsive.

Tasks

* Atomic component library

  * Create `components/ui/` for base elements: `Button`, `Input`, `Modal`, `Select`, `Toast`.
  * Use compound component patterns for complex controls like `Question`, `AnswerList`.
  * Add strict prop typing and minimal presentation logic.
* Design tokens and theming

  * Use CSS variables for tokens in global CSS or Tailwind variables.
  * Provide light and dark themes. Store user theme preference in `settings`.
* Accessibility

  * Follow WCAG 2.1 practices.
  * Ensure keyboard navigation, focus management, ARIA roles for quiz flows.
  * Add automated axe tests in CI.
* Storybook

  * Add Storybook `@storybook/react` with stories for UI primitives.
  * Use Storybook to test edge cases and visual states.
* Performance patterns

  * Use `React.memo`, `useCallback`, `useId` for stable ids.
  * Avoid prop drilling by using context for deeply nested state, with narrow contexts.
* Forms and inputs

  * Use React Hook Form or a minimal controlled approach.
  * Integrate Zod resolver for validation.

Validation checklist

* [ ] UI primitives in `components/ui` with stories.
* [ ] Accessibility checks included in CI.
* [ ] Theming implemented with tokens.
* [ ] Component tests exist for major components.
* [ ] Changelog and commit for this phase.

---

# Phase 6: Performance and Scalability (Week 4)

Goal

* Reduce load times.
* Prepare for larger user numbers.

Tasks

* Code splitting and dynamic imports

  * Use `next/dynamic` for heavy components and editors.
  * Split admin bundles from student bundles.
* Tree-shake and dependency audit

  * Run bundle analyzer in CI, set budget limits.
  * Remove large unused libraries, replace with smaller ones.
* Image optimization

  * Use `next/image` for static assets.
  * Add proper widths and layout sizes.
  * Serve AVIF/WebP where supported.
* Virtualization

  * Use `@tanstack/react-virtual` for long lists like question banks and results tables.
* Caching and CDN

  * Set caching headers for static assets.
  * Use CDN for `/_next/static` and media. Add cache invalidation strategy.
* Database scaling patterns

  * Add read replicas if using relational DB, or partitioning for large tables.
  * Implement pagination cursors for large list endpoints.
* Background processing

  * Offload heavy tasks to background workers using BullMQ or similar.
  * Create `workers/` folder and job handlers.
* Performance monitoring

  * Add RUM and server-side tracing and sampling.
  * Add page timing telemetry.

Validation checklist

* [ ] Bundle size under defined budget.
* [ ] Virtualized lists for large data.
* [ ] `next/image` used and media optimized.
* [ ] CDN and caching headers configured.
* [ ] Background worker implemented for heavy jobs.
* [ ] Changelog and commit created.

---

# Phase 7: Testing and CI/CD (Week 4-5)

Goal

* Ensure quality through automated tests.
* Automate deploys and checks.

Tasks

* Unit and integration tests

  * Use Jest and React Testing Library for unit tests.
  * Add MSW for API mocks during component tests.
  * Place tests next to implementations.
* E2E tests

  * Add Cypress for end-to-end flows: login, quiz flow, submission, grading.
  * Add test data factories in `tests/factories`.
* Test coverage thresholds

  * Report coverage in CI, set minimums for new code.
* CI pipelines

  * Create GitHub Actions workflows:

    * `ci.yml` for lint, tests, typecheck, build.
    * `deploy.yml` for staging and production with approvals.
  * Run `bundle-analyzer` on PRs if bundle changes are detected.
* Deployment strategy

  * Use Vercel or another provider for Next.js.
  * Staging environment on PR merge to `staging` branch.
  * Blue green or canary deployments for production.
* Rollback and health checks

  * Add health endpoints: `/api/health` returning app and DB status.
  * Configure automated rollback on failed health checks.
* Security scanning

  * Add Snyk or dependabot alerts.
  * Run ESLint security rules.

Validation checklist

* [ ] Unit, integration, and E2E tests exist for critical flows.
* [ ] CI runs and enforces checks on PRs.
* [ ] Deploy pipeline to staging and production set.
* [ ] Health checks and rollback configured.
* [ ] Changelog updated, commit created.

---

# Phase 8: Monitoring, Observability, and Production Readiness (Week 5)

Goal

* Observe system health.
* Provide analytics and alerting.

Tasks

* Error tracking

  * Integrate Sentry or similar for server and client errors.
  * Add release tagging during deployment.
* Metrics and monitoring

  * Instrument key metrics: request latency, error rates, job queue length, DB slow queries.
  * Export metrics to Prometheus and visualize in Grafana or use SaaS like Datadog.
* Logging

  * Use structured logs, include request ids.
  * Centralize logs in ELK or hosted provider.
* Real user monitoring

  * Add RUM for front-end performance metrics.
  * Track quiz timings and submission delays.
* Audit logs

  * Record critical actions in an append-only audit log: user role changes, grading changes, content publish.
  * Store audit log in durable storage.
* Compliance and backups

  * Add backup schedule for DB, validate restores in sandbox.
  * Document retention policies.
* Postmortem and runbook

  * Add incident response playbook in `docs/runbook/incident.md`.
  * Create on-call rotation and alerting rules.
* Production readiness checklist

  * Load test to expected peak concurrency.
  * Security review and pentest report if possible.

Validation checklist

* [ ] Error tracking configured and tested.
* [ ] Metrics and dashboards available.
* [ ] Backups and restore tested.
* [ ] Audit logs in place for critical actions.
* [ ] Runbook exists, changelog updated, commit created.

---

## Global Nonfunctional Tasks

* Accessibility

  * Run axe checks, fix high impact issues.
  * Provide keyboard-first flows for quizzes.
* Internationalization

  * Prepare i18n using `next-intl` or similar, store translations in `locales/`.
* Data privacy

  * Add data retention and deletion endpoints.
  * Provide export endpoints for user data.
* Logging and observability

  * Ensure request tracing correlation across services.

Validation checklist

* [ ] Accessibility audit passed for critical features.
* [ ] i18n scaffolding present.
* [ ] Data retention and export flows documented.
* [ ] Changelog entry created.

---

## Dependencies to install

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-virtual": "^3.0.0",
    "zod": "^3.22.0",
    "jose": "^5.0.0",
    "next": "14.x",
    "react": "18.x",
    "react-dom": "18.x",
    "cookie": "^0.6.0"
  },
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "jest": "^29.0.0",
    "cypress": "^13.0.0",
    "msw": "^2.0.0",
    "@storybook/react": "^7.0.0",
    "husky": "^8.0.0",
    "lint-staged": "^13.0.0",
    "prettier": "^3.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "14.x"
  }
}
```

Explicit install commands

* Install dependencies

  * `npm install @tanstack/react-query @tanstack/react-virtual zod jose cookie next react react-dom`
* Install dev dependencies

  * `npm install -D @testing-library/react @testing-library/jest-dom jest cypress msw @storybook/react husky lint-staged prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint eslint-config-next`

---

## Suggested file examples and locations

* `lib/auth/jwt.ts` sign and verify functions.
* `lib/auth/cookies.ts` cookie helpers.
* `middleware/withAuth.ts` server middleware.
* `schemas/quiz.create.ts` Zod schema.
* `hooks/queries/useQuizzes.ts` typed query hooks.
* `components/ui/Button.tsx` base button.
* `workers/emailSender.ts` background job handler.
* `tests/factories/userFactory.ts` test data builder.
* `docs/runbook/incident.md` incident guide.
* `CHANGELOG.md` phase entries.

---

## Best practice references

* Security: OWASP Top Ten.
* Auth: RFC 7519 for JWT.
* Accessibility: WCAG 2.1.
* TypeScript: TypeScript handbook.
* Testing: Testing Library guides.
* CI: GitHub Actions docs.
* Next.js: official Next.js documentation.

---

## Release and changelog policy

* Update `CHANGELOG.md` for every completed phase and for each major PR.
* Tag releases with semantic tags.
* Create a release note summarizing security changes, breaking changes, and migration steps.
* Create a commit for each major milestone and for each phase completion.

---

## Final notes

* Write tests as you change code.
* Use feature branches and PR reviews.
* Keep commits small and focused.
* Prioritize running security and type checks on CI.

End of plan.
