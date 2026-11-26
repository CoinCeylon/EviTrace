# EviTrace GAD backend

The Government Analyst’s Department (GAD) backend receives evidence transfers
from police, records physical inspections, and checks whether received files
match their registered SHA-256 fingerprints.

## Build and test on Windows

After cloning EviTrace, open PowerShell in the repository root. This is the
folder containing `apps`, `packages`, and the shared `package-lock.json`.
Run each command below from that folder.

### 1. Install dependencies

Install the package versions recorded in the shared lockfile.

```powershell
npm.cmd ci
```

### 2. Generate Prisma Client

The backend uses Prisma Client to access its PostgreSQL database. Generate
the client before the first build and again after changing the Prisma schema.

```powershell
npm.cmd exec --workspace=@evitrace/gad-backend -- prisma generate --config=prisma7.config.ts
```

On success, Prisma prints `Generated Prisma Client`.

### 3. Build the backend

```powershell
npm.cmd run build --workspace=@evitrace/gad-backend
```

The build can finish without printing a success message. To check the result,
run `$LASTEXITCODE` immediately afterward. A value of `0` means the build succeeded.

### 4. Run the unit tests

```powershell
npm.cmd test --workspace=@evitrace/gad-backend -- --runInBand
```

Jest prints the number of test suites and tests that passed.

## License

EviTrace project code is licensed under Apache-2.0.