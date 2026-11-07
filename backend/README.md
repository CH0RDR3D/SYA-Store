### local setup
Video instructions: https://youtu.be/PPxenu7IjGM

- `cd /backend`
- `pnpm install` or `npm i`
- Rename `.env.template` ->  `.env`
- To connect to your online database from your local machine, copy the `DATABASE_URL` value auto-generated on Railway and add it to your `.env` file.
  - If connecting to a new database, for example a local one, run `pnpm ib` or `npm run ib` to seed the database.
- `pnpm dev` or `npm run dev`

### requirements
- **postgres database** (Automatic setup when using the Railway template)
- **redis** (Automatic setup when using the Railway template) - fallback to simulated redis.
- **S3-compatible storage** (Automatic setup when using the Railway template) - fallback to local storage.
- **Meilisearch** (Automatic setup when using the Railway template)

### commands

`cd backend/`
`npm run ib` or `pnpm ib` will initialize the backend by running migrations and seed the database with required system data.
`npm run dev` or `pnpm dev` will start the backend (and admin dashboard frontend on `localhost:9000/app`) in development mode.
`pnpm build && pnpm start` will compile the project and run from compiled source. This can be useful for reproducing issues on your cloud instance.

### Repair customer-only promotion campaigns

The campaign repair script must run against the database used by the deployed backend:

1. Deploy the backend containing `src/scripts/repair-customer-campaigns.ts`.
2. In Railway, open the backend service shell and run `npm run repair:customer-campaigns` to dry-run.
3. Run `npm run repair:customer-campaigns -- apply` to remove campaigns whose budget requires `customer_id`.
4. Verify the dry-run reports zero affected campaigns, then restart the backend service.

To run the same script locally against Railway, temporarily set the backend service's exact `DATABASE_URL` in your local `backend/.env`, run the dry-run, and then run the apply command. Restore the local database configuration afterward.
