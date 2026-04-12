# Smart Campus OS - Architecture

## Backend

- `config/`: environment and app config
- `db/`: MongoDB connection and DB utility code
- `modules/`: domain-based feature modules
  - `health/`
  - `campus/`
- `middleware/`: shared request/response middleware

## Frontend

- `components/`: reusable UI sections
- `hooks/`: interaction and behavior hooks
- The landing page is intentionally componentized for future portal integrations.
