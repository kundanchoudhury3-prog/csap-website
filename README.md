# CSAP IAS Academy — Website + Admin Panel

Next.js website (fast, modern, smooth animations) with a built-in admin panel at **/admin** powered by Payload CMS.

- **csap.co.in** → the public website
- **csap.co.in/admin** → login and control everything: courses, fees, images, centres slideshow, toppers, testimonials, form leads and Razorpay orders

---

## What you can control from /admin

| Admin section | What it changes on the website |
|---|---|
| **Courses** | Course cards: title, badge, description, modes, fee, image, "Enroll" (Razorpay) on/off, draft/published, display order |
| **Centres & Gallery** | The big homepage slideshow — one slide per centre (photo, name, address). Also listed in the footer |
| **Results & Toppers** | The gold scrolling results strip (name + rank) |
| **Testimonials** | "In our toppers' own words" cards |
| **Demo Classes (YouTube)** | "Free demo classes" on the homepage and /demo-classes. Paste a YouTube link — title and thumbnail fill in automatically (you can type your own title or upload a custom thumbnail). Untick *Show on homepage* to keep a video only on /demo-classes |
| **Blog posts** | Blog at `/blogs`; each post opens at `csap.co.in/<slug>` (same addresses as WordPress). Announcements open at `/announcements/<slug>` |
| **Blog categories** | Category filters on the blog |
| **Pages** | Simple pages (About Us, a course or project page) at `csap.co.in/<slug>` |
| **Resources (PDFs)** | CSAP News Analysis, Question Papers, CNA Monthly Magazine, Sample Smartbooks, Syllabus — listed at `/resources-archive/...`, each PDF at its old WordPress address |
| **Redirects** | Send any old address to a new one so links and Google results never break |
| **Media Library** | All uploaded images and PDFs |
| **Students (registered)** | Everyone who registered on `/register` (name, mobile, email). Open a student to see every PDF they viewed/downloaded. Export to CSV |
| **Downloads log** | Every view/download of a free resource: which student, which PDF, when. Filter by student or date |
| **Leads** | Every "Free Mentorship" form submission. Mark as New / Contacted / Enrolled, add call notes, export to CSV |
| **Orders (Razorpay)** | Created automatically when someone pays. Turns **Paid** only after Razorpay confirms |
| **Homepage & Site Settings** | Top announcement bar, hero title/text/photo, stats, Smartbook section, address, phone, email, WhatsApp, app link, social links |
| **Team members** | Add staff logins (Admin = full control, Staff = content & leads) |

Free resource PDFs open only for logged-in students (`/register`, `/login`, `/account`). Students can reset a forgotten password at `/forgot-password` (needs the SMTP_* email settings). Staff logged into /admin can also open them.

Until you add content, the site shows sensible default text so it never looks empty.

---

## Part 1 — Run it on your computer (to test)

1. Install **Node.js 22** or newer from https://nodejs.org
2. Create a free Postgres database at **https://neon.tech** → New project → copy the **connection string**.
3. In this folder, copy `.env.example` to a new file named `.env` and fill in:
   - `DATABASE_URL` → the Neon connection string
   - `PAYLOAD_SECRET` → any long random text
4. Open a terminal in this folder and run:
   ```
   npm install
   npm run dev
   ```
5. Open http://localhost:3000/admin → create the first admin account → start adding content.
6. Open http://localhost:3000 to see the website.

## Part 2 — Put it live (recommended setup)

| Piece | Service | Cost to start |
|---|---|---|
| Website + /admin | **Vercel Pro** (the free Hobby plan is for non-commercial use only) | $20 / month |
| Database | **Neon** Postgres, free plan (1 GB) — upgrade to pay-as-you-go later if needed | Free |
| Images & PDFs | **Cloudflare R2** — 10 GB free, no download (bandwidth) charges, ideal for hundreds of PDFs | Free up to 10 GB |

1. **Neon:** create a project (region: Singapore or Mumbai if offered, closest to Assam) → copy the connection string.
2. **Cloudflare R2:** dash.cloudflare.com → R2 → create bucket `csap-media` → Settings → enable public access (or connect a subdomain like `files.csap.co.in`) → copy the public URL. Then R2 → Manage API tokens → create a token with *Object Read & Write* → copy Access Key ID, Secret, and the S3 endpoint.
3. Upload this folder to a private **GitHub** repository. Never upload the `.env` file.
4. **Vercel:** Add New → Project → import the repository → add every variable from `.env.example` with your real values (`NEXT_PUBLIC_SITE_URL` = `https://csap.co.in`).
5. **Deploy.** Database tables are created automatically on first start.
6. Open `your-project.vercel.app/admin` and create the admin account.

## Part 2b — Bring over the WordPress blog, pages and PDFs

Run this **once, from your computer**, after Part 2 and **before** moving the domain (it downloads files from the old site, so WordPress must still be online).

1. Put the **production** values in your local `.env` (same `DATABASE_URL` and R2 keys as Vercel), so everything lands in the live database and R2.
2. WordPress Admin → Tools → Export → All content → save the `.xml` file in this folder.
3. Run:
   ```
   npm install
   npm run import:wordpress -- ./your-export-file.xml
   ```
   It brings in blog posts (with images, categories and Rank Math SEO titles/descriptions), announcements, all PDF libraries, and adds redirects for changed addresses. ~1,400 files are downloaded, so it can take a while; if it stops, just run it again — finished items are skipped/updated, not duplicated.
   - Quick trial without downloading files: add `skip-files` at the end (PDFs then still point to the old site — do a full run before moving the domain).
   - Only one part: add `only=posts`, `only=pages` or `only=resources`.
4. At the end it prints a summary. Any file that failed is listed in `import-file-errors.txt`.

**WordPress pages** were built with Bricks, so their layout cannot be copied. They are imported as **drafts** (title, address and SEO kept) in Admin → Pages. Until you rebuild and publish one, its old address sends visitors to the homepage. User-account pages (login, register, members…) are not imported.

## Part 3 — Razorpay

1. Razorpay Dashboard → Account & Settings → **API Keys** → generate. Start with **Test mode** keys.
2. Put them in `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
3. Razorpay Dashboard → **Webhooks** → Add:
   - URL: `https://csap.co.in/api/razorpay/webhook`
   - Secret: choose one, put the same in `RAZORPAY_WEBHOOK_SECRET`
   - Events: `payment.captured`, `payment.failed`, `order.paid`
4. In /admin → Courses, set a **Fee** and tick **Show "Enroll / Buy Now"**. The Enroll button appears on that course.
5. For the Smartbook "Buy Now": create a course for it (category "Study material", status Draft if you don't want a card), then pick it in Site Settings → Smartbook → *Course record to sell*.
6. Test a payment with Razorpay test cards, check Admin → Orders shows **Paid**, then switch to **Live** keys.

Security: the price always comes from the admin panel (never from the browser), and every payment is verified with Razorpay's signature before it is marked Paid.

## Part 4 — Move csap.co.in to the new site (same domain)

1. Keep the old WordPress site running. Test the new one on the `vercel.app` address first.
2. Vercel project → Settings → **Domains** → add `csap.co.in` and `www.csap.co.in`. Vercel shows the DNS records to add.
3. At your domain provider's DNS settings, change only the website records (`A` / `CNAME`) to what Vercel shows.
   **Do not touch `MX` records** — they run your email.
4. Wait a few minutes to a few hours. HTTPS is automatic.
5. Keep the WordPress hosting and a full backup for 1–2 weeks before cancelling.
6. List the old WordPress URLs (blog posts, important pages) so they can be redirected and Google rankings are kept.

---

## For developers

- `scripts/import-wordpress.ts` — WordPress importer
- `src/app/(frontend)/[...path]/page.tsx` — serves old WordPress addresses (posts, pages, announcements, PDFs) and Admin → Redirects
- `src/app/(frontend)/blogs`, `src/app/(frontend)/resources-archive` — listings; `src/app/sitemap.ts` for Google

- `src/collections/` — admin sections (Courses, Centres, Toppers, Testimonials, Leads, Orders, Media, Users)
- `src/globals/SiteSettings.ts` — homepage & site settings
- `src/app/(frontend)/page.tsx` — homepage; `styles.css` — design and animations
- `src/components/` — header, centres slideshow, lead form, Razorpay enroll button
- `src/app/(frontend)/api/` — `enquiry` (lead form), `razorpay/order`, `razorpay/verify`, `razorpay/webhook`
- After changing a collection's fields: `npm run generate:types`, then `npx payload migrate:create <name>` so the live database updates on the next deploy.
