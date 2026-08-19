# Krishna Car Travels — MERN Rebuild

A responsive rebuild of the original PHP/MySQL/Bootstrap car-rental site as a
**React (Vite) frontend** + **Node.js/Express backend** + **MongoDB (Mongoose)**
database, replacing the previous PHP pages and MySQL `bookings` table.

## What changed vs. the original PHP site

| Original (PHP)                        | Rebuilt (MERN)                                      |
|----------------------------------------|------------------------------------------------------|
| `index.php`, `about.php`, `gallery.php`, `rental_plans.php`, `contact.php` | React Router pages: `Home`, `About`, `Gallery`, `RentalPlans`, `Contact` |
| `booking.php` (form POST + MySQL insert) | `POST /api/bookings` (Express + Mongoose) |
| `Admin/submit_contact.php`             | `POST /api/contact` |
| `get_car_types` (PDO/MySQL, static fallback) | `GET /api/car-types` (Mongoose, same static fallback) |
| `db.php` (mysqli + PDO connection)     | `mongoose.connect()` in `server.js` |
| `database_migration.sql`               | Mongoose schemas in `backend/models/` |
| Inline `<style>` blocks per page + `style.css` | Single mobile-first `src/styles/App.css` with the same breakpoints (576 / 768 / 992px) |
| jQuery-ish `script.js` (WhatsApp modal, phone validation, navbar toggle) | React state/hooks (`InquiryModal.jsx`, controlled form inputs, `Navbar.jsx`) |

The gallery's WhatsApp inquiry popup, the phone-number-only-10-digits
validation, the sticky "CALL NOW" button, and the booking confirmation screen
are all preserved — just reimplemented as React components instead of
Bootstrap modals + vanilla JS.

**Note on the Google Maps key found in `config.php`:** that key was hardcoded
in the uploaded PHP and should be treated as compromised — revoke/regenerate
it in the Google Cloud Console. The rebuild doesn't hardcode any secrets;
everything sensitive goes through `.env` files (see below), which are already
listed in `.gitignore`.

## Project structure

```
krishna-car-travels/
├── backend/                 # Node.js + Express + MongoDB API
│   ├── models/               # Mongoose schemas: Booking, Contact, CarType
│   ├── routes/                # /api/bookings, /api/contact, /api/car-types
│   ├── seed.js                # seeds default car types
│   ├── server.js              # app entrypoint
│   └── .env.example
└── frontend/                 # React (Vite) app
    ├── public/img/            # put your site images here
    └── src/
        ├── api/api.js         # axios client
        ├── components/        # Navbar, Footer, BookingForm, CarCard, InquiryModal, ScrollToTop
        ├── pages/              # Home, About, Gallery, RentalPlans, Contact, BookingConfirmation, NotFound
        ├── styles/App.css      # mobile-first responsive stylesheet
        ├── App.jsx
        └── main.jsx
```

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env — set MONGO_URI to your local Mongo instance or an Atlas connection string
npm run seed     # optional: seeds the car_types collection
npm run dev      # starts on http://localhost:5000 (nodemon)
# or: npm start
```

Requires a running MongoDB instance. For local development:
```bash
# install & start MongoDB Community Edition, then:
mongod --dbpath /path/to/data
```
Or use a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster and paste its
connection string into `MONGO_URI`.

### API endpoints

| Method | Endpoint                  | Purpose                                  |
|--------|----------------------------|-------------------------------------------|
| POST   | `/api/bookings`             | Create a booking (replaces `booking.php`) |
| GET    | `/api/bookings`              | List all bookings (admin)                 |
| GET    | `/api/bookings/:id`           | Get one booking                           |
| PATCH  | `/api/bookings/:id/status`     | Update booking status (admin)             |
| POST   | `/api/contact`               | Submit contact form                       |
| GET    | `/api/contact`                | List contact messages (admin)             |
| GET    | `/api/car-types`               | List car types (with static fallback)     |
| POST   | `/api/car-types`               | Add a car type (admin)                    |
| GET    | `/api/health`                  | Health check                              |

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env     # VITE_API_BASE_URL=/api works with the dev proxy below
npm run dev               # http://localhost:5173
```

The Vite dev server proxies any `/api/*` request to `http://localhost:5000`
(see `vite.config.js`), so the backend must be running for booking/contact
forms and car-type fetches to work.

**Images:** drop your existing images (logo, hero photos, car photos, etc.)
into `frontend/public/img/` — see `frontend/public/img/README.txt` for the
exact filenames referenced by the components. Vite serves `/public` files as
static assets, so no code changes are needed.

## 3. Production build

```bash
cd frontend
npm run build     # outputs static files to frontend/dist
```

Deploy `frontend/dist` to any static host (Netlify, Vercel, S3+CloudFront,
Nginx, etc.), point `VITE_API_BASE_URL` at your deployed backend's URL before
building, and deploy `backend/` to a Node host (Render, Railway, an EC2 box
behind Nginx, etc.) with `MONGO_URI` and `CLIENT_ORIGIN` set for production.

## Responsiveness

The stylesheet is mobile-first with the same three breakpoints the original
Bootstrap/custom CSS used:
- **< 768px** — mobile: stacked layout, collapsible hamburger nav, single-column
  cards/gallery, full-width buttons.
- **768–991px** — tablet: two-column grids for about/services/gallery/contact.
- **>= 992px** — desktop: full horizontal nav, three-column services/gallery grids.

All images use `object-fit: cover` with fixed aspect ratios so cards stay
aligned at every width, and the booking form, gallery inquiry modal, and
contact form are fully usable with touch input on small screens.
