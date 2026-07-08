# Meta Ad Account Setup Wizard

A self-serve wizard that walks Whitney Bateson's Done-for-You Funnel clients
through everything Facebook, Instagram and Meta need on their end — setting up a
Business Page, connecting Instagram, creating a real ad account, and granting
our team partner access — so we can run ads for them.

Clients land on a page, enter their name and email, answer a Business Portfolio
prerequisite, then move through five branching steps (Facebook Account →
Business Page → Instagram → Ad Account → Invite Our Team). The final step has
them invite our Business Portfolio as a partner once and grant access to all the
assets we need, matching Meta's current permissions model. Progress saves to Supabase after every action, so they can
close the tab and resume later by re-entering the same email and last name. When
they finish, a notification email fires to the admin inbox via Resend.

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS** for styling
- **Supabase** (Postgres) for storing progress — accessed server-side only with
  the service role key
- **Resend** for the completion notification email
- Designed to deploy on **Vercel**

The Supabase and Resend clients are created lazily (see `src/lib/supabase.ts`
and `src/lib/resend.ts`) so `next build` succeeds even with no environment
variables set — clients only initialise when an API route is actually called.

## Project structure

```
src/
  app/
    page.tsx              Landing / entry page
    wizard/page.tsx       The wizard (portfolio prerequisite + 5 steps)
    complete/page.tsx     Completion page
    api/
      start/route.ts      Create or look up a client record
      progress/route.ts   Read progress (GET) / save an answer or step (POST)
      complete/route.ts   Mark complete and send the notification email
  components/              UI: EntryForm, WizardClient, ProgressRail, etc.
  lib/
    steps.ts              Single source of truth: questions, options, videos, BM ID
    supabase.ts           Lazy, cached Supabase admin client
    resend.ts             Lazy, cached Resend client
supabase/
  schema.sql              Database schema — run this once in Supabase
```

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the example env file and fill it in:

   ```bash
   cp .env.example .env.local
   ```

   | Variable | What it is |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only — never expose it) |
   | `RESEND_API_KEY` | Resend API key |
   | `NOTIFY_EMAIL` | Where the completion notice is sent (default `admin@whitneybateson.com`) |
   | `FROM_EMAIL` | Verified sender address (default `notifications@whitneybateson.com`) |

3. Run the dev server:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000.

> The app builds and runs without env vars set, but the API routes will return
> errors until Supabase (and, for the final step, Resend) are configured.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste the contents of [`supabase/schema.sql`](./supabase/schema.sql),
   and **Run**. This creates the `meta_setup` table, the resume-lookup index, the
   `updated_at` trigger, and enables Row Level Security with no policies.
   - **Already ran an earlier version of the schema?** Don't re-run `schema.sql`.
     Instead run the latest file in [`supabase/migrations/`](./supabase/migrations)
     — it only adds the columns the Business Portfolio step needs.
3. From **Project Settings → API**, copy:
   - the **Project URL** into `NEXT_PUBLIC_SUPABASE_URL`
   - the **service_role** key into `SUPABASE_SERVICE_ROLE_KEY`

Because RLS is enabled with no policies, the table is only reachable via the
service role key, which we use exclusively on the server.

## Resend setup

1. Create an account at [resend.com](https://resend.com).
2. **Verify the sending domain** (`whitneybateson.com`) under **Domains**, adding
   the DNS records Resend provides. The `FROM_EMAIL` address must be on a
   verified domain or the email won't send.
3. Create an API key under **API Keys** and put it in `RESEND_API_KEY`.

The completion email is best-effort: if Resend isn't configured or a send fails,
the client is still marked complete — we just log the failure rather than
blocking them.

## Deploying to Vercel

1. Push this repo to GitHub (already done if you're reading this there).
2. In Vercel, **New Project → Import** this repository. Vercel auto-detects
   Next.js; no build settings needed.
3. Under **Settings → Environment Variables**, add all five:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `NOTIFY_EMAIL`
   - `FROM_EMAIL`
4. Deploy. Redeploy after changing env vars so they take effect.

## Swapping in the real videos later

Video placeholders live in one place. Open [`src/lib/steps.ts`](./src/lib/steps.ts)
and fill in the `VIDEOS` map with **embed** URLs:

```ts
export const VIDEOS: Record<VideoKey, string | null> = {
  businessPage: "https://player.vimeo.com/video/123456789",
  instagram: "https://www.youtube.com/embed/VIDEO_ID",
  adAccount: "https://www.loom.com/embed/VIDEO_ID",
  addTeamToPage: null,       // still shows a "video coming soon" placeholder
  addTeamToAdAccount: null,
};
```

Any embeddable provider works — Vimeo, unlisted YouTube, or Loom. Use the embed
form of the URL (e.g. `player.vimeo.com/video/…`, `youtube.com/embed/…`,
`loom.com/embed/…`). Leave a value as `null` to keep the placeholder until the
video is ready.

## Branding

The design uses Whitney Bateson's brand palette, defined once in
[`tailwind.config.ts`](./tailwind.config.ts):

| Token | Hex | Use |
| --- | --- | --- |
| `cream` / `paper` | `#efeae3` | Page background |
| `teal` / `ink` | `#02525d` | Text / dark anchor |
| `coral` | `#ff7f50` | Accent — buttons, active markers |
| `sky` | `#aed3dd` | Light blue (info) |
| `pink` | `#ffcdcd` | Soft pink |
| `lime` | `#e3f696` | Pale lime |
| `alert` | `#b23a1f` | Errors / warnings (functional, not a brand colour) |

### Fonts (licensed — needs one activation step)

The brand fonts are **Boston Angel** (display/headings), **Proxima Nova** (body)
and **Milkshake Script** (handwritten accents). These are licensed and are *not*
bundled in the repo. Until they're activated, the layout falls back to close
stand-ins loaded in [`src/app/layout.tsx`](./src/app/layout.tsx) — Playfair
Display, Montserrat and Caveat — so it already looks intentional.

The licensed family names are first in each font stack (see
[`src/app/globals.css`](./src/app/globals.css)), so they take over automatically
once the browser can load them. Activate them **one** of two ways:

- **Adobe Fonts (recommended):** create/copy Whitney's Adobe Fonts web project
  (Proxima Nova lives there; add Boston Angel and Milkshake to the same kit if
  licensed), then paste the kit `<link>` into `layout.tsx` where the comment
  points. Nothing else to change.
- **Self-host:** drop the `.woff2` files into [`public/fonts/`](./public/fonts)
  and uncomment the `@font-face` blocks at the bottom of `globals.css`
  (filenames are pre-stubbed to match).

### Logo

The pages currently show "Whitney Bateson" set in the script font as a stand-in
wordmark (landing + completion). To use her real logo, drop the file into
`public/` and replace that `<p className="font-script …">Whitney Bateson</p>`
line with an `<img>`.

## Editing the questions and copy

Everything the wizard says — step titles, answer options, helper text, branching
interstitials, action-step copy, and our Business Portfolio ID
(`483230735518997`) — is defined in `src/lib/steps.ts`. That's the only file you
need to touch to change wording or the flow.
