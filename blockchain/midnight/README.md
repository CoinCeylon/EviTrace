
# EviTrace Midnight Development Environment

## 1. Purpose

Midnight provides the foundation for privacy-preserving authorization
and credential verification within EviTrace.

The intended use cases include:

- Private institutional credential verification.
- Analyst and supervisor authorization.
- Privacy-preserving forensic report approval.
- Zero-knowledge proof-based verification.
- Authorized institutional auditing.

These application-specific features are not yet implemented.

## 2. Verified Development Environment

| Component | Version |
|---|---|
| Operating System | Ubuntu 24.04.2 LTS (WSL 2) |
| Architecture | x86_64 |
| Node.js | 22.23.5 |
| npm | 10.9.9 |
| Docker Desktop | 4.100.1 |
| Docker Engine | 29.9.3 |
| Docker Compose | 5.7.1 |
| Compact CLI | 0.5.3 |
| Compact Compiler | 0.36.1 |
| Compact Language | 0.28.0 |
| Compact Runtime | 0.21.0 |
| Compact JS | 3.0.0 |
| Midnight JS | 5.0.0 |
| Ledger v9 | 1.0.0 |
| Proof Server | 9.0.2 |
| Target Network | Preprod |
| Selected Wallet | 1AM Beta |

## 3. Prerequisites

- Linux or Ubuntu through WSL 2.
- Docker Desktop with WSL integration enabled.
- Node.js and npm.
- Bash, curl, tar and unzip.
- Google Chrome.
- Visual Studio Code.
- 1AM Beta Wallet for wallet-based development.

## 4. Compact Installation

Download the official installer:

```bash
curl --proto '=https' --tlsv1.2 -LsSf \
https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh \
-o /tmp/compact-installer.sh
```

Review the installer before executing it:

```bash
less /tmp/compact-installer.sh
```

Press `q` to exit the file viewer.

Execute the installer:

```bash
sh /tmp/compact-installer.sh
source ~/.bashrc
```

Install the selected compiler version:

```bash
compact update 0.36.1
```

Verify installation:

```bash
compact --version
compact compile --version
which compact
```

These installation steps are only required when setting up a new
development environment.

## 5. SDK Installation

Run the following command from the repository root:

```bash
npm ci
```

The Midnight workspace is located at:

`blockchain/midnight`

### Installed SDK Dependencies

| Package | Version |
|---|---|
| @midnight-ntwrk/compact-runtime | 0.21.0 |
| @midnight-ntwrk/compact-js | 3.0.0 |
| @midnight-ntwrk/midnight-js | 5.0.0 |

Ledger v9 version 1.0.0 is resolved through the SDK dependency tree.

Do not upgrade these dependencies independently without verifying
Ledger compatibility.

### Verify TypeScript Configuration

From the repository root:

```bash
npm run typecheck -w @evitrace/midnight
npm run build -w @evitrace/midnight
```

### Verify SDK Runtime Imports

From the repository root:

```bash
cd blockchain/midnight

node --input-type=module -e '
await import("@midnightntwrk/ledger-v9");
console.log("Ledger v9: OK");

await import("@midnight-ntwrk/compact-runtime");
console.log("Compact Runtime: OK");

await import("@midnight-ntwrk/compact-js");
console.log("Compact JS: OK");

await import("@midnight-ntwrk/midnight-js");
console.log("Midnight JS: OK");
'

cd ../..
```

## 6. Proof Server

Execute these commands from the repository root.

### Start

```bash
docker compose \
  -f blockchain/midnight/proof-server/docker-compose.yml \
  up -d
```

### Verify

```bash
docker ps
curl -i http://127.0.0.1:6300/
```

Expected HTTP status: `200 OK`.

Expected response contains: `{"status":"ok"}`.

### View Logs

```bash
docker logs --tail 50 evitrace-midnight-proof-server
```

### Stop

```bash
docker compose \
  -f blockchain/midnight/proof-server/docker-compose.yml \
  stop
```

### Restart

```bash
docker compose \
  -f blockchain/midnight/proof-server/docker-compose.yml \
  start
```


## 7. Wallet Configuration

### Selected Wallet: 1AM Beta

EviTrace has selected 1AM Beta as its preferred wallet for prototype
development because it supports both Cardano and Midnight within a
single wallet application.

Beta installation:

https://1am.xyz/install-beta

Target network: Preprod.

Use testnet assets only.

Cardano and Midnight use separate blockchain addresses and
authorization mechanisms, even when accessed through the same
wallet application.

Basic application-level wallet connectivity has been independently
tested for both networks using the shared EviTrace Wallet SDK.

### Previous Lace Wallet Issue

Lace Wallet version 2.5.2 encountered a
`ProtocolVersionMismatchError` during DUST registration on
Midnight Preprod.

The issue persisted when using both the local proof server and
WASM proof generation options.

This issue remains unresolved in our testing but is no longer
a blocker for EviTrace prototype development following the
migration to 1AM Beta.

### 1AM Wallet RPC Issue and Resolution

The stable version of 1AM Wallet initially failed to register DUST
because its public Midnight Preprod RPC endpoint had been retired.

Observed errors included:

- HTTP 410 Gone.
- WebSocket handshake failure.
- Abnormal WebSocket closure (1006).
- Transaction SubmissionError.

The EviTrace team contacted the 1AM developers through their
Telegram community.

The developers acknowledged the issue and provided a beta release.

After the team reported that the issue persisted in the initial
beta build, the developers included the necessary fix and
updated the build.

Following the updated beta release, the following capabilities
were verified during manual testing on November 27-28, 2026:

- Cardano DApp connectivity.
- Cardano wallet address and balance retrieval.
- Cardano transaction construction, signing and submission.
- Midnight DApp connectivity.
- Midnight Preprod network identification.
- Midnight unshielded address retrieval.
- NIGHT balance retrieval.
- Non-zero DUST balance retrieval.
- Midnight transaction history retrieval.
- Midnight DApp-originated NIGHT transfer.

The availability of a non-zero DUST balance confirms that DUST
became available following the wallet migration.

The Midnight DApp-originated token transfer was displayed as
CONFIRMED in the 1AM wallet interface.

Independent transaction verification remains pending.

### Wallet Integration Strategy

The shared `@evitrace/wallet-sdk` package provides a reusable
wallet integration layer for EviTrace institutional applications.

The current implementation includes:

- Shared wallet configuration.
- Cardano wallet connectivity through CIP-30.
- Midnight wallet connectivity through DApp Connector API 4.0.0.
- Cardano network identifier validation.
- Midnight connector RDNS and API version validation.
- Midnight Preprod connection validation.
- Reusable Cardano and Midnight connection functions.

The following functions have been implemented and verified
in a browser environment:

- `connectCardanoWallet()`
- `connectMidnightWallet()`

Both functions were successfully tested using a temporary
Vite application connected to 1AM Beta.

The current implementation is intentionally configured for
1AM Beta. Support for additional wallet providers may be
introduced in future development stages.

### Midnight Transaction Compatibility

The tested 1AM Beta implementation returned transaction
identifiers from `makeTransfer()` rather than the serialized
transaction described by the DApp Connector API 4.0.0
type declaration.

The wallet interface subsequently displayed the transaction
as CONFIRMED.

This observed behavior indicates that the tested wallet
implementation submitted the transaction during makeTransfer.

Further compatibility review is required before implementing
reusable Midnight transaction functions.

Applications must avoid duplicate transaction submission.

### Remaining Wallet Integration Tasks

- Cryptographic wallet ownership verification.
- Institutional identity binding.
- Cardano Preprod-specific network verification.
- Reusable transaction construction and submission functions.
- Automated wallet integration testing.
- Smart contract interaction.
- Actual zero-knowledge proof generation.

For implementation details, usage examples and transaction
testing records, refer to the
[Wallet SDK documentation](../../packages/wallet-sdk/README.md).

The initial wallet integration was merged into the main
development branch through Pull Request #13.


## 8. SDK Compatibility Resolution

The initial SDK configuration used:

- Compact Runtime 0.21.0.
- Compact JS 3.0.2.
- Midnight JS 5.0.1.
- Ledger v9 1.0.2.

A WebAssembly compilation error prevented successful Ledger v9
runtime initialization.

The error was reproduced by importing Ledger v9 version 1.0.2
directly.

The issue was resolved in our development environment by selecting
the compatible SDK versions documented in Section 5.

The underlying cause of the WebAssembly compilation error has
not been independently established.

Compatibility reference:

https://docs.midnight.network/relnotes/support-matrix


## 9. Verified Results

- [x] Docker WSL integration.
- [x] Docker container execution.
- [x] Compact CLI installation.
- [x] Compact compiler installation.
- [x] Proof Server Docker Compose configuration.
- [x] Cryptographic resource initialization.
- [x] Proof Server HTTP connectivity.
- [x] Ledger v9 runtime import.
- [x] Compact Runtime import.
- [x] Compact JS import.
- [x] Midnight JS import.
- [x] Initial TypeScript typecheck.
- [x] Initial TypeScript build.
- [x] Updated 1AM Beta wallet manual testing.
- [x] DUST balance availability confirmation.
- [x] 1AM Cardano DApp connectivity.
- [x] 1AM Midnight DApp connectivity.
- [x] Midnight DApp Connector API integration.
- [x] Shared wallet configuration.
- [x] Reusable Cardano wallet connection function.
- [x] Reusable Midnight wallet connection function.
- [x] Wallet SDK TypeScript typecheck and build.
- [x] Wallet SDK runtime import verification.
- [x] Dual-network browser connectivity validation.
- [x] Midnight DApp token transfer confirmation in wallet UI.
- [x] Wallet SDK integration merged into main.
- [ ] Final clean-install validation following main synchronization.
- [ ] Independent verification of 1AM test transactions.
- [ ] Midnight transaction API compatibility verification.
- [ ] Cryptographic wallet ownership verification.
- [ ] Automated wallet integration tests.
- [ ] Compact contract compilation.
- [ ] Zero-knowledge proof generation.
- [ ] Midnight Preprod contract deployment.
- [ ] End-to-end smart contract execution.


## 10. Security Requirements

- Keep the proof server bound to localhost during development.
- Do not expose the proof server directly to the public internet.
- Use synthetic data during development.
- Use testnet assets only.
- Never commit wallet recovery phrases or private keys.
- Never expose private API credentials.
- Never log, persist or commit wallet session tokens.
- Treat wallet-provided service URLs as potentially sensitive.
- Review verbose logging before processing confidential data.
- Do not use floating compiler or Docker image versions.
- Do not use beta wallets for production assets.
- Do not share wallet recovery information between team members.
- Validate the intended blockchain network before signing.
- Validate transaction recipients and amounts.
- Prevent duplicate transaction submissions.
- Treat injected wallet connector metadata as untrusted.
- Verify wallet ownership cryptographically.
- Enforce institutional authorization independently of wallet ownership.

Cardano and Midnight wallet addresses must be bound to an
authenticated institutional identity using independently
verified cryptographic mechanisms.

Access to a single wallet application does not automatically
prove ownership of both blockchain addresses.

Blockchain wallet ownership alone does not establish an
officer's institutional role or permissions.


## 11. Known Limitations

- Application-specific Compact contracts are not implemented.
- Actual Compact contract compilation remains pending.
- Actual zero-knowledge proof generation remains untested.
- Midnight smart contract deployment remains untested.
- End-to-end smart contract execution remains pending.
- Independent verification of 1AM test transactions remains pending.
- Cardano Preprod-specific network validation requires further work.
- Midnight makeTransfer API compatibility requires further review.
- Cryptographic wallet ownership verification is not implemented.
- Institutional identity binding is not implemented.
- Automated wallet integration tests are not implemented.
- Browser validation was performed using a temporary Vite application.
- The selected 1AM wallet is a beta release.
- Lace Wallet DUST registration remains unresolved but is no
  longer a blocker for prototype development.
- On-chain Runtime v4 versions 4.0.0 and 4.0.2 coexist
  in the dependency tree.
- TypeScript build verification currently covers the initial
  workspace scaffold rather than application-specific contracts.
- Final clean-install validation after wallet integration
  remains pending.


## 12. Development Status

Last updated: 2026-11-28.

The initial Midnight development environment has been configured
and SDK runtime imports have been verified.

The environment configuration was merged into the main
development branch through Pull Request #11.

The shared EviTrace Wallet SDK has been extended to support
both Cardano and Midnight through 1AM Beta.

Basic dual-network wallet connectivity, wallet address retrieval,
balance retrieval and DUST availability have been verified
in a browser environment.

The wallet integration was merged into the main development
branch through Pull Request #13.

The project is ready to proceed with application-specific
smart contract development, subject to the remaining
validation and security requirements.

The next development stages are:

1. Finalize Midnight smart contract architecture.
2. Define contract state, circuits and authorization rules.
3. Implement and compile the Compact smart contract.
4. Implement contract testing.
5. Verify actual zero-knowledge proof generation.
6. Deploy and test the contract on Midnight Preprod.
7. Implement cryptographic wallet ownership verification.
8. Implement institutional identity binding.
9. Integrate Midnight functionality into EviTrace applications.
10. Perform end-to-end integration and security testing.

Cardano and Midnight smart contract implementations will be
managed through separate feature branches and pull requests.

Development environment validation does not establish
smart contract correctness or production readiness.


## 13. Resources

- https://docs.midnight.network/
- https://docs.midnight.network/relnotes/support-matrix
- https://github.com/midnightntwrk/compact
- https://1am.xyz/install-beta

## 14. License

Apache-2.0
