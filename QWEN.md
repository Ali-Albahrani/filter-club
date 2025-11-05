# Disco Spoons — Developer Specification

## Goals (short)
- Host blind cupping events.
- Collect ratings and guesses (origin, process).
- Award points and generate per-participant result spreadsheets.
- Provide admin tools to manage events and coffees.
- Support leaderboards across events.
- Store data flexibly to enable future analytics and machine learning.

---

## 1. Concepts & Entities

### Primary entities
- **User**: authenticated person (participant, organizer, or admin).
- **Event**: a cupping session (date, venue, organizer, coffees).
- **Coffee**: a sample within an event (labelled A, B, C...).
- **Session**: a participant's record in an event.
- **Rating**: numeric score (1–10) per coffee.
- **Guess**: guessed origin/process per coffee.
- **Points**: computed total after results publish.

---

## 2. Data Models (MongoDB)

Each top-level model lives in its own collection. Embedded relationships are used where logical and denormalization improves read performance.

### 2.1 `users` Collection
```js
{
  _id: ObjectId,
  email: String,
  name: String,
  role: {
    type: String,
    enum: ["participant", "organizer", "admin"],
    default: "participant"
  },
  createdAt: Date,
  updatedAt: Date
}
```
Indexes:
- `{ email: 1 }` unique

---

### 2.2 `events` Collection
```js
{
  _id: ObjectId,
  name: String,
  startTs: Date,
  endTs: Date,
  location: String,
  organizerId: ObjectId, // ref users._id
  coffees: [
    {
      _id: ObjectId,
      label: String, // "A", "B", ...
      name: String,
      roaster: String,
      originCountry: String,
      process: {
        type: String,
        enum: ["washed", "honey", "natural", "experimental"]
      },
      createdBy: ObjectId, // ref users._id
      createdAt: Date
    }
  ],
  published: Boolean,
  coffeeStats: Map, // Coffee statistics calculated after results are published
  createdAt: Date,
  updatedAt: Date
}
```
Indexes:
- `{ organizerId: 1 }`
- `{ "coffees.label": 1, _id: 1 }` unique constraint enforced in app logic

---

### 2.3 `sessions` Collection
```js
{
  _id: ObjectId,
  userId: ObjectId, // ref users._id
  eventId: ObjectId, // ref events._id
  email: String, // required if user is anonymous
  joinedAt: Date,
  ratings: [
    {
      coffeeId: ObjectId,
      score: {
        type: Number,
        min: 1,
        max: 10
      },
      submittedAt: Date
    }
  ],
  guesses: [
    {
      coffeeId: ObjectId,
      guessedOriginCountry: String,
      guessedProcess: {
        type: String,
        enum: ["washed", "honey", "natural", "experimental"]
      },
      createdAt: Date
    }
  ],
  points: Number, // computed after event publish
  results: { // Detailed results after event publication
    published: Boolean,
    detailedResults: Map, // Map of coffee results with user performance data
    totalPossiblePoints: Number,
    rankInEvent: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```
Indexes:
`{ eventId: 1, userId: 1 }` (unique with partial filter for ObjectId)
`{ eventId: 1, email: 1 }` (unique with partial filter for email string)

---

### 2.4 `leaderboard` Collection (optional denormalized view)
```js
{
  _id: ObjectId,
  userId: ObjectId,
  totalPoints: Number,
  monthlyPoints: Number,
  lastUpdated: Date
}
```
Populated via background jobs or triggers on publish.

---

## 3. Business Logic & Rules

### Labeling
- Coffees labeled alphabetically (`A`–`Z`).
- `label` unique per event (enforce at app level).

### Rating
- One rating per coffee per session.
- Score ∈ [1, 10].

### Guessing & Points
- Correct country guess = +1
- Correct process guess = +1
- Submitting rating = 0 - cannot submit empty rating
- Total computed when organizer publishes results.

### Origin dropdown
- Use pre-configured list of equatorial coffee-producing countries.

### Process dropdown
- Options: `washed`, `honey`, `natural`, `experimental`.

---

## 4. API — REST

Auth: JWT (Bearer). Base path: `/api/v1`

### Authentication
- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/profile`

### Events
- `GET /events` — list all events (with filters)
- `GET /events/:id` — details (includes coffees)
- `POST /events` — create (organizer)
- `PATCH /events/:id`
- `DELETE /events/:id`

### Coffees
- `POST /events/:eventId/coffees`
- `GET /events/:eventId/coffees`
- `PATCH /events/:eventId/coffees/:coffeeId`
- `DELETE /events/:eventId/coffees/:coffeeId`

### Sessions
- `POST /events/:eventId/sessions` — join event
- `GET /events/:eventId/sessions/:sessionId`
- `GET /sessions/:id/results` — get detailed results

### Ratings & Guesses
- `POST /sessions/:sessionId/ratings`
- `POST /sessions/:sessionId/guesses`
- `GET /events/:eventId/results` — pre-publish (masked)
- `POST /events/:eventId/publish` — compute points, email results

### Leaderboard
- `GET /leaderboard?period=monthly|alltime`
- `GET /users/:userId/points`

### Document Generation
- `GET /events/:eventId/results/spreadsheet` — download event results as XLSX
- `GET /events/:eventId/results/pdf` — download event results as PDF
- `GET /sessions/:sessionId/results/spreadsheet` — download individual results as XLSX
- `GET /sessions/:sessionId/results/pdf` — download individual results as PDF

---

## 5. Example Documents

### Rating Example (embedded in session)
```js
{
  coffeeId: ObjectId("66c8a123..."),
  score: 8,
  submittedAt: ISODate("2025-10-15T14:00:00Z")
}
```

### Guess Example (embedded in session)
```js
{
  coffeeId: ObjectId("66c8a123..."),
  guessedOriginCountry: "Ethiopia",
  guessedProcess: "natural",
  createdAt: ISODate("2025-10-15T14:05:00Z")
}
```

---

## 6. Background Jobs

- **Publish job**:
  - Calculate averages and total points.
  - Update `sessions.points`.
  - Update `leaderboard` collection.
  - Generate spreadsheet (CSV/XLSX).
  - Send email with results.
- **Email job**: triggered by publish job completion.
- **Cleanup job**: delete sessions inactive > X days.
Recommended queue: **BullMQ** (Node.js) or **Celery** (Python).

---

## 7. Spreadsheet Format (CSV/XLSX)

| Column | Description |
|--------|--------------|
| A | Coffee label |
| B | Average score |
| C | Actual origin |
| D | Actual process |
| E | User guess (origin) |
| F | User guess (process) |
| G | Rating score |

Additional sheets:
- `Scores` — per-user totals
- `Leaderboard` — global rankings

---

## 8. Validation Rules

- `score` must be integer ∈ [1, 10]
- `label` unique per event
- `originCountry` from predefined list
- `process` in enum
- Session must exist before submission

Error format (consistent across API):
```json
{
  "error": "ValidationError",
  "details": "Score must be between 1 and 10"
}
```

---

## 9. Security & Privacy

- Hide actual coffee origins until publish.
- Use signed URLs for spreadsheet downloads.
- Encrypt stored emails and PII.
- Role-based access control (RBAC).
- Rate-limit API calls per user/session.

---

## 10. Frontend Components (React + Material UI)

### Pages
- Event List (Lobby)
- Event Admin (manage coffees, publish)
- Cupping UI (ratings, guesses)
- Results Page (download sheet)
- Leaderboard

### Components
- CoffeeGrid
- CoffeePanel
- RatingSlider
- GuessDropdown
- ProgressTracker

UX features:
- Autosave ratings.
- Local cache for offline mode.
- "Unsaved changes" warnings.

---

## 11. Analytics Hooks (for future data warehouse integration)

Each interaction (rating, guess, publish) should emit an **event document** to a `metrics` collection:
```js
{
  _id: ObjectId,
  eventType: "rating_submitted" | "guess_made" | "event_published",
  userId: ObjectId,
  eventId: ObjectId,
  coffeeId: ObjectId,
  metadata: {
    score: 8,
    guessedOrigin: "Ethiopia",
    guessedProcess: "natural"
  },
  createdAt: Date
}
```
Later, this can be exported into a data warehouse or queried by an LLM for insights.

---

## 12. Suggested Tech Stack

- **Backend**: Node.js (Express or NestJS)
- **Database**: MongoDB (Atlas recommended)
- **Queue**: BullMQ (Redis)
- **Auth**: JWT (Auth0, Clerk, or custom)
- **Frontend**: React + Material UI
- **File Storage**: Supabase
- **XLSX Generation**: `xlsx` or `exceljs`
- **Emails**: SendGrid / Mailgun / SES

---

## 13. Testing & QA

- Unit tests: scoring and point calculations.
- Integration tests: publish job and leaderboard.
- E2E tests: full user flow (create → rate → publish → download).

---

## 14. Roadmap

1. Core API + MongoDB schema + frontend MVP
2. Add publish job + email results
3. Leaderboard aggregation
4. Event analytics dashboard
5. Data warehouse pipeline + LLM querying

---

## 15. Deliverables (for dev agent)

- MongoDB schema definitions (Mongoose or similar)
- REST API routes with validation
- Publish job logic
- Frontend React components (per wireframe)
- Integration tests
- Deployment setup (Docker + CI/CD)

---

## 16. Implementation Progress

### Phase 1: Database Schema & Models ✅ COMPLETED
- Created User, Event, Session, and Leaderboard models with proper validation
- Set up MongoDB connection and migrated from JSON storage to MongoDB
- Created proper indexes as specified
- Added additional fields like published status, coffeeStats, and detailed results structures

### Phase 2: API Endpoints ✅ COMPLETED
- Implemented authentication system (signup, login, logout, profile)
- Created comprehensive event management endpoints
- Implemented coffee management within events
- Added session management endpoints
- Built complete rating and guessing endpoints
- Created publish results endpoint
- Implemented leaderboard endpoints
- Added proper validation and security middleware

### Phase 3: Backend Logic ✅ COMPLETED
- Implemented rating system with 1-10 integer scores
- Added complete guessing functionality for origin and process
- Created sophisticated point calculation logic based on correct guesses
- Built publish job that calculates averages, rankings, and updates leaderboards
- Implemented account-based result storage with detailed performance analytics
- Created PDF and spreadsheet generation services for result distribution
- Added endpoints for downloading results in multiple formats

### Phase 4: Frontend Adaptation 🔄 IN PROGRESS
- Update React components to work with new data structures
- Modify UI to reflect rating/guessing workflow
- Add authentication UI
- Implement cupping UI with rating sliders and dropdowns
- Add leaderboard and results pages

### Phase 5: Integration & Testing 📋 TODO
- Connect frontend to backend APIs
- Implement comprehensive testing
- Add error handling
- Optimize performance

### Phase 6: Advanced Features 📋 TODO
- Background jobs
- Email notifications
- Analytics hooks
- Deployment updates