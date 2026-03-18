# Tent UI

Frontend for the Tent app. It handles Firebase-authenticated login, worker company submissions, and admin review of workers inputs.

## Tech Stack

- Next.js 16 with the App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Firebase Authentication
- `@microsoft/fetch-event-source` for live admin updates
- ESLint for linting

## How To Run

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file with these variables:

```bash
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

3. Start the development server:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

Other useful commands:

```bash
npm run lint
npm run build
npm run start
```

## Pages

- `/`
  Redirect page. Sends unauthenticated users to `/auth`, admins to `/dashboard/admin`, and workers to `/dashboard/worker`.
- `/auth`
  Login page using Firebase email/password auth.
- `/dashboard/worker`
  Worker dashboard for submitting company details, including company name, number of users, number of products, and a calculated percentage.
- `/dashboard/admin`
  Admin dashboard showing workers, image upload actions, and links to each worker's inputs and images.
- `/dashboard/admin/users/[id]/companies`
  Admin view of a worker's submitted inputs with pagination and live updates via server-sent events.
- `/dashboard/admin/users/[id]/images`
  Admin view of images uploaded to worker's account with pagination and a link to open each image.

## Notes

- Auth state is provided globally through `AuthProvider` in the root layout.
- Dashboard routes are protected and redirect based on the signed-in user's role.
