# ReadQuest — Reading Tracker (Delivery 1)

A responsive, game-inspired reading tracker built for the UNIFAL-MG Full Stack Web Development semester assignment.

## Delivery scope

This repository is the **Frontend / Delivery 1** only. It uses vanilla HTML, CSS and JavaScript modules, with browser `localStorage` persistence. There is no backend in this delivery.

> The assignment explicitly prohibits Bootstrap and other frontend frameworks/UI libraries. The interface therefore uses custom CSS and system fonts. Charts are rendered with local CSS/HTML, so the frontend does not wait for external chart or font CDNs.

## Team

Project author:

| Name | Student ID |
|---|---|
| Victor Orlando Avelar | 2026.2.08.005 |

## Requirements checklist

### Core requirements (mandatory)

| ID | Status | Implementation |
|---|---|---|
| FR-01 — Manage authors | Implemented | Create, view, edit and delete authors. An author linked to one or more books cannot be deleted; the UI reports the linked titles. |
| FR-02 — Manage books | Implemented | Create, view, edit and delete books. Authors are selected from existing records; themes can be selected or created from the book form. |
| FR-03 — Manage readings | Implemented | Add, edit and delete reading records. A new book can be saved together with its first reading. Deleting a book confirms and reports the number of reading records removed. |
| FR-04 — Status workflow | Implemented | Supports Want to read, Reading, Paused, Read and Abandoned. Priority is cleared outside Want to read; moving a reading to a status that disallows year/grade asks before clearing those values. |
| FR-05 — Reading log | Implemented | Sortable reading list for title, author, status, year and grade. Default order is year read descending, then ID ascending. Missing values display as `-` and sort after filled values. |
| FR-06 — Validation | Implemented | Required fields, unique author/theme names, date rules, publication-year rules, reading status/year/grade/priority constraints are validated with messages beside the affected fields. Invalid records are not saved. |
| FR-07 — Seed data and reset | Implemented | `data/seed.json` is fetched only on first use and saved in `localStorage`. Changes survive reload. Restore starter data confirms, clears the app's storage key and reloads the seed. |

### Optional exercises

| ID | Status | Implementation |
|---|---|---|
| FR-08 — Filters and search | Implemented | Combined status, year, author, form, theme and title/author text filters in the reading log. |
| FR-09 — Wishlist | Implemented | Dedicated Want to read view sorted by priority, including recommender. |
| FR-10 — Books by century | Implemented | Computed view in Insights, including Unknown century and year sorting within each century. |
| FR-11 — Authors by nationality | Implemented | Computed nationality groups with birth/death dates, age and books with at least one Read record. |
| FR-12 — Statistics | Implemented | Readings per year, average grade per year, average grade by nationality/form and top 10 books by average grade. |
| FR-13 — Charts | Implemented | Charts are rendered locally with HTML/CSS for readings per year and average grade per year; no external chart library is loaded. |
| FR-14 — Open Library autofill | Not implemented | Outside the core Delivery 1 requirements. |
| FR-15 — Import/export | Partially implemented | Export all current data as JSON; import is not implemented. |

## Run locally

`fetch()` is required to load the seed file, so do not open `index.html` with `file://`.

1. Open PowerShell in this project folder (the folder containing `index.html`).
2. Run the included launcher:

   ```powershell
   .\run.ps1
   ```

3. Open `http://localhost:5500` in your browser. Press `Ctrl+C` in PowerShell to stop the server.

The launcher starts a small static web server using .NET already included with Windows PowerShell. Python, Node.js, npm, and extra dependencies are not required. If PowerShell blocks local scripts, run `powershell -ExecutionPolicy Bypass -File .\run.ps1`; this bypass applies only to that launch and does not change the machine-wide policy.

**Java version:** Not applicable to Delivery 1. This frontend-only delivery does not use Java or require a Java installation. Delivery 2 requires Java 21 or newer, as specified in the assignment.

The frontend uses local assets only and does not require an internet connection. The core CRUD, validation, localStorage persistence, and CSS-based charts work without a backend.

## Project structure

```text
readquest-frontend/
├── index.html
├── README.md
├── data/
│   └── seed.json
└── assets/
    ├── css/
    │   └── styles.css
    └── js/
        ├── app.js          # UI events and application flow
        ├── render.js       # Shell, pages, forms, charts and feedback
        ├── store.js        # Async data access / localStorage boundary
        ├── validation.js   # Domain validation rules
        ├── strings.js      # Interface labels and controlled values
        └── utils.js        # Shared formatting and calculation helpers
```

## Data and persistence

- Seed data is loaded from `data/seed.json` only when the app has no saved data.
- All changes are saved under the `readquest.data.v1` key in `localStorage`.
- The data structures preserve the seed/API shapes: `countries`, `authors`, `themes`, `books` and `readings`.
- Every data-access function in `store.js` is asynchronous and returns a Promise. The rest of the UI calls it with `await`, so the storage module can be replaced by API calls for Delivery 2.
- New records use the next integer ID after the largest existing ID.

### Seed-data note

The provided `Seed_Data_Guide.pdf` says there are 132 themes, while the actual `seed.json` included in the assignment archive contains **135 theme records**. This project uses the JSON file as the source of truth and loads all 135 records unchanged.

## AI usage statement

| Tool | Used for | Parts affected |
|---|---|---|
| ChatGPT | Project structure, initial UI implementation, CSS visual system, JavaScript modules, validation logic, and test planning | `index.html`, `assets/css/styles.css`, `assets/js/*`, `README.md` |

The student/team must review and understand the submitted code and update this statement if other AI tools or external code sources are used.

## Delivery 2 preparation

Data access is isolated in `assets/js/store.js`. The UI calls asynchronous store functions and uses the same entity shapes as `seed.json`, allowing the store module to be replaced with API requests without rewriting the page rendering and form flow. Copy the frontend folder into Spring Boot's `src/main/resources/static` for Delivery 2, as described in the assignment.
