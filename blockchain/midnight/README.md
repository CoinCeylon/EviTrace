
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

Application-level wallet connectivity and transaction signing
must be verified independently for both networks.

### Previous Lace Wallet Issue

Lace Wallet version 2.5.2 encountered a
`ProtocolVersionMismatchError` during DUST registration on
Midnight Preprod.

The issue persisted when using both the local proof server and
WASM proof generation options.

This issue remains unresolved in our testing.

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

The updated beta wallet was reported working during manual
testing on November 27, 2026.

Successful DUST registration confirmation, application-level
wallet integration and end-to-end transaction verification
must be documented through further testing.

### Wallet Integration Strategy

The shared `@evitrace/wallet-sdk` package will provide a
wallet-independent integration layer for EviTrace applications.

The intended interfaces include:

- Cardano wallet connectivity through CIP-30.
- Midnight wallet connectivity through the DApp Connector API.
- Wallet address retrieval.
- Network validation.
- Transaction signing and submission.
- Wallet ownership verification.
- Consistent wallet error handling.

1AM Beta is the preferred wallet for the prototype.

Compatibility with its Cardano and Midnight connector interfaces
must be verified before completing the integration.

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
- [ ] Final validation following main branch synchronization.
- [ ] DUST registration and balance confirmation.
- [ ] 1AM Cardano DApp integration.
- [ ] 1AM Midnight DApp integration.
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
- Review verbose logging before processing confidential data.
- Do not use floating compiler or Docker image versions.
- Do not use beta wallets for production assets.
- Do not share wallet recovery information between team members.

## 11. Known Limitations

- Application-specific Compact contracts are not implemented.
- Actual Compact contract compilation remains pending.
- Midnight DApp Connector integration remains pending.
- Cardano integration with 1AM remains pending verification.
- Actual zero-knowledge proof generation remains untested.
- End-to-end Preprod transaction verification remains pending.
- Lace Wallet DUST registration remains unresolved.
- On-chain Runtime v4 versions 4.0.0 and 4.0.2 coexist
  in the dependency tree.
- TypeScript build verification currently covers the initial
  workspace scaffold rather than application-specific contracts.

### Known Dependency Security Issues

The previous Midnight workspace npm audit reported eight
moderate vulnerabilities.

- Advisory: GHSA-chp3-j5qr-2vfr.
- Affected dependency: @effect/platform@0.96.3.
- Introduced through platform-js@3.0.0.

Forced SDK downgrades and dependency overrides have been
avoided to preserve compatibility.

Further security review and remediation are required before
production deployment.

## 12. Development Status

Last updated: 2026-11-27.

The initial Midnight development environment has been configured
and SDK runtime imports have been verified.

The environment setup is ready for final validation before
merging into the main development branch.

The next development stages are:

1. Verify Cardano and Midnight DApp connectivity with 1AM.
2. Implement reusable wallet integration functions.
3. Implement and compile Compact smart contracts.
4. Verify zero-knowledge proof generation.
5. Test contract deployment and execution on Preprod.
6. Integrate Midnight functionality into EviTrace applications.
7. Perform integration and security testing.

Wallet integration and smart contract development will be
managed as separate development tasks.

## 13. Resources

- https://docs.midnight.network/
- https://docs.midnight.network/relnotes/support-matrix
- https://github.com/midnightntwrk/compact
- https://1am.xyz/install-beta

## 14. License

Apache-2.0
