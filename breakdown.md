# Quizeen — Project Breakdown

Date: 2025-10-24

## Short summary

Quizeen is a Next.js (App Router) learning/test system (CBT) that lets users register/login, create and take quizzes, and save or view quiz results. The repo uses MongoDB (Mongoose), JWT for authentication, and a React + Tailwind UI. There are both frontend pages/components and server API routes under `app/api/*`.

## Stack

- Next.js (App Router) — `next` @ 15.x
- React 19
- TypeScript (strict)
- MongoDB + Mongoose
- JWT for auth
- bcryptjs for password hashing
- Axios on the client (`utils/api.ts`)
- Tailwind + Radix UI for UI primitives

## High-level features (observed)

- User registration and login
- JWT-based authentication and cookie setting (server-side)
- User profile read & update
- Account deletion
- Quiz CRUD (create, read, update, delete)
- Quiz attempt submission (compute score & optionally persist results)
- Retrieval of quiz results (by user, result id, or quiz id)
- Admin quiz creation endpoint (duplicate of quiz creation)
- Frontend components for quiz UI, timer, result tables, admin forms, auth forms, etc.

## Files I inspected (key)

- `package.json`, `tsconfig.json`, `README.md`
- Models: `models/Quiz.ts`, `models/QuizResult.ts`, `models/User.ts`
- DB helper: `lib/mongo.ts`
- Client API wrapper: `utils/api.ts`
- API routes: all `app/api/**/route.ts` files (auth, quizzes, results, admin)

---

## Route-by-route review (what each route does + issues & recommendations)

Notes: I inspected the contents of each `route.ts` file under `app/api`. Below I list the endpoints and detailed issues.

### `POST /api/auth/register` (`app/api/auth/register/route.ts`)
Purpose: Register a new user.
Observations / issues:
- Redundant and confusing checks:
  - Code calls `const users = await User.find()` and then `if (users.length > 0 && (await User.find({ email })).length > 0)` to detect existing user. This is unnecessary and confusing. A single `await User.findOne({ email })` is the correct approach.
- Returns generic message on failure; OK but consider returning structured errors.
- No validation of `email` format, `password` strength, or other required fields.
- Saves `passwordHash` but the `User` model's toJSON transform has a commented-out `delete ret.passwordHash;` — currently the transform does not remove `passwordHash`, so downstream responses may leak password hashes if returned as `user` anywhere (see login route).
- No email normalization check beyond lowercase in model; but registration uses provided email directly.

Recommendations:
- Replace the double-find logic with `const existing = await User.findOne({ email });` and if exists return 409.
- Validate inputs (email format, minimum password length/strength).
- Ensure `passwordHash` is excluded in JSON responses (uncomment the delete in toJSON or explicitly remove before returning user objects).

### `POST /api/auth/login` (`app/api/auth/login/route.ts`)
Purpose: Authenticate user and issue JWT.
Issues:
- Returns `user` in the response as stored; because `User.toJSON` does not remove `passwordHash`, this endpoint likely returns `passwordHash` to the client — this is a critical security issue.
- Token handling: code does `const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '7d' });` and then `(await cookies()).set('token', token)`. Using `cookies()` like this in route handlers may not produce an outgoing Set-Cookie header in the Next.js response object — the code sets a cookie on the server-side cookies object but doesn't attach that to the response explicitly. The safer pattern is to build `NextResponse.json(...)` and use `response.cookies.set(...)` or set the cookie header on the response. There is a risk cookies will not be set correctly.
- Missing checks for presence of JWT_SECRET in runtime (there's a `!` operator but no early validation) — if missing, jwt.sign will throw.

Recommendations:
- Remove any password/hash from returned user object.
- Set cookie properly on the NextResponse (e.g., create response, call `response.cookies.set()` and then return `response`). Ensure cookie options (HttpOnly, Secure, SameSite, path, maxAge) are set.
- Consider returning 401 for incorrect credentials.

### `POST /api/auth/deleteAccount` (`app/api/auth/deleteAccount/route.ts`)
Purpose: Delete an account by email (apparently).
Issues:
- There is no authentication/authorization check. Anyone can call this endpoint and delete any account by providing an email — major security hole.
- Unnecessary `users = await User.find()` call; the logic returns `User not found` if `users.length === 0 || !user` — awkward.
- Error message in catch returns `Profile update failed` which is the wrong text for delete operation.

Recommendations:
- Protect this endpoint: require Authorization (JWT) and only allow the authenticated user or an admin to delete the account.
- Remove the global `User.find()` call; only check `findOne({ email })`.
- Return consistent error messages and status codes.

### `GET/POST /api/auth/profile` (`app/api/auth/profile/route.ts`)
Purpose: GET: return currently-authenticated user's profile (uses Authorization header); POST: update profile with provided body.
Issues:
- Both functions expect `Authorization: Bearer <token>` header, verify JWT, then call `User.findById` or `findByIdAndUpdate` — this is fine but:
  - Uses `jwt.verify(token, JWT_SECRET)` with no early validation that JWT_SECRET exists.
  - The update path takes `body` and passes it directly into `findByIdAndUpdate(decoded.userId, body, { new: true })` — no validation or allowed fields filtering. This allows clients to overwrite any user fields (role, passwordHash) if the body includes them.
- In both GET and POST the code explicitly removes `passwordHash` in the returned `userData` which is good; but in other routes this is inconsistent.

Recommendations:
- Whitelist updatable fields (`fullName`, `preferences`, etc.) rather than passing the entire body to `findByIdAndUpdate`.
- Validate inputs and sanitize fields.

### `PUT /api/auth/updateUserProfile` (`app/api/auth/updateUserProfile/route.ts`)
Purpose: Update user profile (similar to `profile` POST). 
Issues:
- Duplicate functionality with `POST /api/auth/profile`. Having both endpoints can be confusing and leads to maintenance issues.
- Same concerns about allowing arbitrary fields to be updated and not validating the request.

Recommendation:
- Consolidate endpoints (use one canonical update endpoint), and implement field whitelisting.

### `GET /api/quizzes` and `POST /api/quizzes` and `PATCH /api/quizzes` (`app/api/quizzes/route.ts`)
Purpose: CRUD for quizzes (list, create, patch/update).
Issues found:
- `GET` uses `const quizzes = Quiz.find(); return NextResponse.json(await quizzes.exec());` — OK.
- `POST` creates a `new Quiz({ ... })` with provided `createdAt` and `updatedAt` values. The `Quiz` schema currently stores createdAt/updatedAt as plain strings instead of using Mongoose timestamps. This is inconsistent and error-prone.
- `PATCH` calls `await Quiz.updateOne({ ...body })` — this is incorrect because `updateOne` takes `(filter, update, options)`. Passing `{ ...body }` as the single parameter will be treated as the `filter` and no update is provided. This will not work as expected.

Recommendations:
- Use Mongoose `timestamps: true` on quiz schema or ensure proper date types.
- Use `findByIdAndUpdate(id, update, { new: true })` or `updateOne({ _id: id }, { $set: update })` with proper filter fields for PATCH.
- Add authentication/authorization for quiz creation and updates (e.g., only instructor or admin, or the quiz owner can modify).
- Validate quiz payload (title, duration, questions shape and question options/correctAnswer).

### `GET/PUT/DELETE /api/quizzes/[quizId]` (`app/api/quizzes/[quizId]/route.ts`)
Purpose: fetch a quiz by id, update it, or delete it.
Issues:
- GET returns quiz by ID — OK.
- PUT: uses `findByIdAndUpdate(quizId, updatedData, { new: true })` — OK, but no validation or authentication at update time.
- DELETE: uses `findByIdAndDelete(quizId)` — OK, but must protect route with authorization.

Recommendations:
- Enforce authorization on update/delete.
- Validate update payload and protect immutable fields.

### `POST /api/quizzes/[quizId]/submit` (`app/api/quizzes/[quizId]/submit/route.ts`)
Purpose: Accept quiz answers, compute score, optionally persist result.
Issues & Observations:
- No authentication required to submit: the route expects `{ quizId, userId, answers, role, saveResult }` in the body. The server trusts the `userId` value provided by the client — this allows arbitrary people to submit as other users and to save results under another user.
- Logic for role check: if `role === 'none'` it returns 404 Not allowed (should be 403). Roles should be determined from the JWT not passed by the client.
- Answers are read via `answers["][ind+1]` (index-based key like "1", "2" etc.) — this requires strict front-end format; no validation performed.
- Time fields (`timeTaken`, `completionTime`) are hard-coded strings (`'00:30'`, `'15:00'`).
- Creating `resultWithoutUser` includes manual `_id` using `new mongoose.Types.ObjectId()` and `createdAt` string — inconsistent with `QuizResult` schema which uses `timestamps: true`.
- When `saveResult` is true, code constructs `new QuizResult({ ...resultWithoutUser, userId })` and `await result.save()`. But because client provides `userId`, there's no guarantee the result belongs to the JWT-authenticated user.

Security risks:
- No auth/ownership checks; clients can submit results for arbitrary user IDs.
- No rate limiting or bot protections — could be abused to inflate scores.

Recommendations:
- Require Authorization and derive `userId` (and role) from the verified JWT; ignore `userId` sent by the client.
- Validate the `answers` structure; check that answer keys map appropriately to quiz questions.
- Compute and store `timeTaken` properly (prefer numeric seconds) and use Date/ISO strings consistently.
- If accepting guest submissions, use `role = 'guest'` internally but do not allow guests to save results under a real user's account.

### `GET /api/results` (`app/api/results/route.ts`)
Purpose: Fetch quiz results by query params (`uid`, `rid`, `qid`).
Issues:
- No authentication — anyone can fetch anyone's results by passing `uid`.
- Accepts `_id` in query param; note that `QuizResult.find({ _id })` will return array, but better to use `findById` for single _id.

Recommendations:
- Protect this route; require the requesting user either be the requested `uid` or an admin.
- Use `findById` for single result lookup.

### `POST /api/admin/create` (`app/api/admin/create/route.ts`)
Purpose: Create new quiz (same functionality as `POST /api/quizzes`).
Issues:
- This is a duplicate create route with no admin authorization checks — the path implies an admin-only operation but currently anyone can call it.

Recommendations:
- Remove duplication or consolidate and ensure admin-only access for admin endpoints.

---

## Model / Schema issues

### `models/Quiz.ts`
- `createdAt` and `updatedAt` are typed as `String` and are required — prefer `Date` and use `timestamps: true` so Mongoose manages them.
- `question._id` is a string — acceptable but ensure uniqueness and consistent id generation.
- Consider adding validation to ensure `questions` is an array of the expected shape and question options (`A`..`D`) exist.

### `models/QuizResult.ts`
- Uses `timestamps: true` which is good; ensure any created documents don't supply conflicting string `createdAt` values.

### `models/User.ts`
- `passwordHash` is stored and the schema `toJSON` transform leaves `passwordHash` in the returned object (the delete is commented out). This leaks password hashes when documents are serialized.
- `role` is a required string but not validated against allowed values (`'user'|'admin'`) other than `lowercase`.

Recommendations for models:
- Use `timestamps: true` for `Quiz` and `User` where appropriate.
- Normalize date fields as `Date` types, not strings.
- Ensure `toJSON` excludes `passwordHash`.
- Add schema-level validation for fields where possible.

---

## Security and auth problems (high priority)

1. Password hash leakage: API responses (login, possibly other endpoints) may include `passwordHash`. Fix immediately by removing hash from serialized user output.
2. Missing authentication/authorization in many endpoints (account deletion, quiz create/update/delete, result fetching) — any client can call them.
3. Client-supplied `userId` and `role` are trusted in quiz submission and result endpoints — these must be derived from a verified token.
4. Cookie/token setting in login may be incorrectly applied; ensure cookies are set with `HttpOnly`, `Secure`, `SameSite=Strict` (or Lax as appropriate), and `path=/` plus correct maxAge.
5. No validation of JWT_SECRET or MONGODB_URI at startup — add required-env check.
6. No rate limiting, no brute-force protections on login, no email verification for registration.

Remediation priority: fix password leakage and authentication checks first (critical). Then address authorization for destructive endpoints and finally add input validation and operational protections.

---

## Bugs, code smells and bad dev practices (medium priority)

- Duplicate endpoints and duplicated code (`admin/create` vs `quizzes POST`). Consolidate.
- `PATCH` implementation that calls `Quiz.updateOne({ ...body })` incorrectly.
- Repeated `await User.find()` calls used as existence checks — expensive and unnecessary.
- Inconsistent use of HTTP verbs (profile POST vs separate PUT route) — standardize REST semantics.
- Console.log statements and stray comments around error handling.
- Mismatched types (strings used for createdAt/updatedAt in some places while schemas expect Dates).
- Weak/no input validation on almost all endpoints.

---

## Developer process & repository observations

- No dedicated tests found (unit/integration). Add at least a few tests around auth and quiz submission.
- No CI config visible in repository root (no GitHub Actions workflow). Consider adding automated lint/build/test runs.
- Environment variables are assumed present; consider adding `.env.example` and runtime checks at startup.
- Code duplication across API routes; DRY this up by moving shared auth / JWT verification into a helper (e.g., `lib/auth.ts` or `lib/middleware.ts`).
- Consider centralizing error response formatting.

---

## Suggested prioritized fixes (concrete)

1. Critical fixes (ship immediately):
   - Remove `passwordHash` from all API responses. In `models/User.ts` `toJSON` transform, uncomment and ensure `delete ret.passwordHash`.
   - Require and validate `JWT_SECRET` at startup and handle missing secret gracefully.
   - Protect dangerous endpoints (`deleteAccount`, quiz create/update/delete, results GET) so only the account owner or admin can access them.
   - For `POST /api/auth/login`, set cookie on the `NextResponse` properly with secure flags.

2. High-impact fixes:
   - Ensure submissions derive `userId` and `role` from JWT, not from client-provided values.
   - Fix `PATCH /api/quizzes` to accept an ID and perform update correctly (use `findByIdAndUpdate` or `updateOne(filter, update)`).
   - Consolidate duplicate endpoints (admin create vs quizzes POST).
   - Add validation (Zod or Joi or custom) to all request bodies.

3. Improvements / nice-to-have:
   - Use `timestamps: true` on the `Quiz` schema and make createdAt/updatedAt `Date` types.
   - Add tests for: register/login flow, quiz create/update/delete, quiz submit logic.
   - Add logging and proper error messages returned to clients (no stack traces in responses).
   - Add rate-limiting / brute force prevention for login.

---

## Quick code snippets to apply immediately

- Remove passwordHash from serialized user (edit `models/User.ts`):

```ts
// inside toJSON transform
delete ret.passwordHash;
```

- Replace register existing user check with a single query:

```ts
const existing = await User.findOne({ email });
if (existing) return NextResponse.json({ message: 'User already exists' }, { status: 409 });
```

- In `POST /api/auth/login`, avoid returning passwordHash and set cookie on response:

```ts
// after generating token
const resp = NextResponse.json({ token, user: sanitizedUser });
resp.cookies.set({ name: 'token', value: token, httpOnly: true, secure: true, maxAge: 60*60*24*7 });
return resp;
```

- In quiz submit, require Authorization header and get `userId` from JWT.

---

## Next steps I can take (I can implement these now if you want)

1. Create and apply a small patch that:
   - Removes `passwordHash` from `User.toJSON`.
   - Fixes the register check to `findOne`.
   - Fixes the `PATCH /api/quizzes` implementation to accept `id` and update properly.
   - Add a small helper `lib/auth.ts` with a `verifyJWT` function and refactor one auth-protected route to use it as an example.

2. Run TypeScript compile/lint and fix obvious issues.

Tell me which of the next steps you'd like me to implement; I can start with the critical security fixes immediately (removing password in responses and locking down one or two endpoints) and open a PR-style change set in this workspace.

---

## Short completion summary

I scanned the repository and all API routes under `app/api`. The main risks are: leaking password hashes, trusting client-supplied user/role values for sensitive operations, and missing authorization checks for destructive operations. There are also code-quality problems (duplicate endpoints, incorrect `updateOne` usage, inconsistent date handling). I can apply prioritized fixes if you want — tell me which you'd like first and I'll implement them and run quick checks.
