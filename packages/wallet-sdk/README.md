
# EviTrace Wallet SDK

Shared dual-blockchain wallet integration package for EviTrace
institutional applications.

## 1. Purpose

The EviTrace Wallet SDK provides a common integration layer for
Cardano and Midnight browser wallets.

It allows institutional applications to connect to both blockchains
through a single wallet application while maintaining separate
blockchain addresses and authorization mechanisms.

The SDK is intended for use by:

- Police Station A.
- Police Station B.
- Government Analyst's Department.
- Oversight Authority.

## 2. Verified Development Environment

| Component | Version |
|---|---|
| Node.js | 22.23.5 |
| npm | 10.9.9 |
| Mesh Core SDK | 1.9.1 |
| Midnight DApp Connector API | 4.0.0 |
| Vite | 6.4.6 |
| Vite Node Polyfills | 0.28.0 |
| Preferred Wallet | 1AM Beta |
| Cardano Wallet Standard | CIP-30 |
| Cardano Target Network | Preprod |
| Midnight Target Network | Preprod |

## 3. Wallet Selection

EviTrace uses 1AM Beta as its preferred wallet for prototype
development because it supports both Cardano and Midnight within
a single wallet application.

### Installation

1AM Beta:

https://1am.xyz/install-beta

Enable the wallet extension in a compatible browser and select
the appropriate testnet networks.

Use testnet assets only.

### Previous Wallet: Lace

Lace was initially used for Cardano development and successfully
supported Cardano wallet connectivity and transaction execution.

However, DUST registration on Midnight Preprod failed with a
ProtocolVersionMismatchError.

The stable version of 1AM also initially experienced Midnight
transaction submission failures following the retirement of the
public Preprod RPC endpoint.

The EviTrace team contacted the 1AM developers through their
Telegram community and reported the issue.

Following an updated beta release, Midnight wallet connectivity,
DUST availability and a DApp-originated token transfer were
successfully tested.

EviTrace subsequently selected 1AM Beta for prototype development.

## 4. Package Structure

```text
packages/wallet-sdk/
├── src/
│   ├── cardano/
│   │   └── wallet.ts
│   ├── midnight/
│   │   ├── globals.d.ts
│   │   └── wallet.ts
│   ├── config.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

## 5. Dependencies

| Package | Version |
|---|---|
| @meshsdk/core | 1.9.1 |
| @midnight-ntwrk/dapp-connector-api | 4.0.0 |

These dependencies provide the Cardano and Midnight wallet
integration interfaces used by this package.

Do not upgrade the Midnight connector dependency independently
without reviewing wallet and Ledger compatibility.

## 6. Installation and Build

From the repository root:

```bash
npm ci
npm run build -w @evitrace/wallet-sdk
```

### Type Checking

```bash
npm run typecheck -w @evitrace/wallet-sdk
```

### Runtime Import Verification

```bash
node --input-type=module -e '
import {
    WALLET_CONFIG,
    BrowserWallet,
    connectCardanoWallet,
    connectMidnightWallet
} from "@evitrace/wallet-sdk";

console.log(WALLET_CONFIG);
console.log(typeof BrowserWallet);
console.log(typeof connectCardanoWallet);
console.log(typeof connectMidnightWallet);
'
```

## 7. Shared Wallet Configuration

The shared wallet configuration is defined in:

`src/config.ts`

```typescript
export const WALLET_CONFIG = {
    name: "1AM Beta",
    cardano: {
        connectorId: "1am",
        network: "preprod",
        networkId: 0
    },
    midnight: {
        connectorId: "1am",
        rdns: "com.midnight.1am",
        network: "preprod",
        apiVersion: "4.0.0"
    }
} as const;
```

Applications should use the shared configuration rather than
duplicating wallet identifiers across individual frontends.

No wallet addresses, private keys, recovery phrases or service
credentials are stored in this configuration.

## 8. Public SDK Exports

```typescript
import {
    WALLET_CONFIG,
    BrowserWallet,
    connectCardanoWallet,
    connectMidnightWallet
} from "@evitrace/wallet-sdk";

import type {
    MidnightWalletAPI
} from "@evitrace/wallet-sdk";
```

| Export | Purpose |
|---|---|
| WALLET_CONFIG | Shared wallet configuration |
| BrowserWallet | Existing Mesh wallet interface |
| connectCardanoWallet | Connect to the preferred Cardano wallet |
| connectMidnightWallet | Connect to the preferred Midnight wallet |
| MidnightWalletAPI | Connected Midnight wallet API type |

The BrowserWallet export is retained for backward compatibility.

## 9. Cardano Wallet Integration

### Connect to Cardano

```typescript
import {
    connectCardanoWallet
} from "@evitrace/wallet-sdk";

const wallet = await connectCardanoWallet();

const networkId = await wallet.getNetworkId();
const address = await wallet.getChangeAddress();
const lovelace = await wallet.getLovelace();
const utxos = await wallet.getUtxos();
```

The connection function:

- Uses the shared wallet configuration.
- Connects through the 1AM CIP-30 connector.
- Validates the Cardano network identifier.
- Rejects mainnet connections.
- Returns the connected Mesh BrowserWallet instance.

### Network Validation

CIP-30 network ID 0 identifies a Cardano testnet.

It does not distinguish Preprod from other Cardano testnets.

Applications must perform additional network validation before
constructing, signing or submitting transactions intended for
Cardano Preprod.

### Verified Capabilities

- Browser connector discovery.
- Wallet permission requests.
- Wallet connection.
- Testnet network identification.
- Wallet address retrieval.
- ADA balance retrieval.
- UTxO retrieval.
- Transaction construction using MeshTxBuilder.
- Transaction signing.
- Transaction submission.

Cardano transaction construction, signing and submission were
reported successful during manual 1AM testing.

The reusable connectCardanoWallet function was subsequently
verified using a temporary Vite application.

Independent on-chain verification of the 1AM Cardano test
transaction has not been documented.

## 10. Midnight Wallet Integration

### Connect to Midnight

```typescript
import {
    connectMidnightWallet
} from "@evitrace/wallet-sdk";

const wallet = await connectMidnightWallet();

const status = await wallet.getConnectionStatus();
const address = await wallet.getUnshieldedAddress();
const balances = await wallet.getUnshieldedBalances();
const dust = await wallet.getDustBalance();
```

The connection function:

- Validates browser environment availability.
- Discovers the configured Midnight connector.
- Validates the connector RDNS.
- Validates the supported API version.
- Establishes a Preprod wallet connection.
- Validates the connection status.
- Validates the returned network configuration.

Connector metadata validation does not constitute
cryptographic wallet authentication.

### Verified Connector Information

| Property | Value |
|---|---|
| Wallet Name | 1AM |
| Connector ID | 1am |
| RDNS | com.midnight.1am |
| API Version | 4.0.0 |
| Network | preprod |

### Verified Capabilities

- Midnight connector discovery.
- DApp wallet connection.
- Preprod network identification.
- Unshielded address retrieval.
- NIGHT balance retrieval.
- DUST balance retrieval.
- Transaction history retrieval.
- Proving provider interface retrieval.
- DApp-originated NIGHT transfer.

The reusable connectMidnightWallet function was verified
using the same temporary Vite application as the Cardano
connection function.

### Service Configuration

Midnight service configurations can be obtained using:

```typescript
const configuration = await wallet.getConfiguration();
```

Wallet-provided indexer URLs may contain session tokens.

Do not log, persist or commit these credentials.

The wallet-provided substrateNodeUri was empty during
testing. Applications must not assume that this property
contains a usable public RPC endpoint.

The existing local Proof Server configuration is maintained
separately under the Midnight development workspace.

## 11. Midnight Transaction Compatibility Note

The Midnight DApp Connector API 4.0.0 declaration specifies
that makeTransfer returns an object containing a serialized
transaction:

```typescript
{ tx: string }
```

However, the tested 1AM Beta implementation returned
transaction identifiers instead:

- tx_id
- txId
- txHash
- extrinsicHash

The resulting transaction was displayed as CONFIRMED
in the 1AM wallet transaction history.

This indicates that the tested implementation performed
transaction submission as part of makeTransfer.

Applications must not blindly assume that all wallet
implementations have identical transaction behavior.

Do not attempt to submit a transaction again when the
wallet has already submitted it.

This behavior requires further compatibility review
before implementing reusable Midnight transaction functions.

## 12. Vite Browser Compatibility

The tested Mesh SDK version requires Node.js polyfills
when bundled using the tested Vite configuration.

Install the tested plugin in the consuming frontend workspace:

```bash
npm install -D vite-plugin-node-polyfills@0.28.0
```

Example vite.config.ts:

```typescript
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
    plugins: [
        nodePolyfills({
            globals: {
                Buffer: true,
                global: true,
                process: true
            },
            protocolImports: true
        })
    ]
});
```

Merge this configuration with existing frontend plugins.

Wallet connection functions must be executed in a compatible
browser environment rather than directly from backend services.

## 13. Transaction Testing Records

### Historical Cardano Test - Lace

| Property | Value |
|---|---|
| Network | Cardano Preprod |
| Transaction Type | Self-transfer |
| Amount | 2 test ADA |
| Block Height | 5457740 |
| Slot | 140002520 |
| Transaction Fee | 169989 Lovelace |
| Transaction Size | 331 bytes |
| Verification | Blockfrost HTTP 200 |

Transaction hash:

`bf3fe5721c8b59a05d549432a8e1f69a4afea21ce9ebfb7902a38c79be1b9835`

This historical record is retained as evidence of the
initial Cardano environment validation.

### Midnight Test - 1AM Beta

| Property | Value |
|---|---|
| Network | Midnight Preprod |
| Date | 2026-11-28 |
| Transaction Type | Self-transfer |
| Intended Amount | 1 tNIGHT |
| Origin | DApp |
| Wallet Method | DAPP_MAKE_TRANSFER |
| Status | CONFIRMED |

Transaction hash:

`7560f05f1fd8ab959a81850e2099ff6f8d0d0b778161ccfc527f573cd6c61782`

The transaction confirmation was verified through the
1AM wallet interface.

Independent explorer verification and detailed execution
status verification remain pending.

## 14. Validation Results

- [x] Wallet SDK dependency installation.
- [x] Shared wallet configuration.
- [x] Cardano connection function implementation.
- [x] Midnight connection function implementation.
- [x] TypeScript global declaration configuration.
- [x] Public SDK exports.
- [x] TypeScript typecheck.
- [x] TypeScript build.
- [x] Node.js runtime import verification.
- [x] Cardano browser connectivity through the shared SDK.
- [x] Midnight browser connectivity through the shared SDK.
- [x] Cardano address and balance retrieval.
- [x] Midnight address and balance retrieval.
- [x] DUST availability.
- [x] Midnight DApp token transfer confirmation in wallet UI.
- [ ] Independent 1AM transaction verification.
- [ ] Automated wallet SDK tests.
- [ ] Cryptographic wallet ownership verification.
- [ ] Smart contract interaction.
- [ ] Zero-knowledge proof generation.
- [ ] Multi-user institutional authorization.

## 15. Security Requirements

- Never store user recovery phrases or private keys.
- Never expose Blockfrost credentials to frontend applications.
- Never commit wallet session tokens.
- Use testnet wallets and synthetic data during development.
- Do not use beta wallets for production assets.
- Validate blockchain networks before signing transactions.
- Validate transaction recipients and amounts.
- Prevent duplicate transaction submissions.
- Treat injected wallet metadata as untrusted information.
- Perform cryptographic wallet ownership verification.
- Enforce institutional authorization independently of wallet ownership.

Cardano and Midnight addresses must be associated with an
authenticated officer through an independently verified
identity-binding mechanism.

Using a single wallet application does not automatically
prove that addresses on both networks belong to the same
authorized institutional user.

## 16. Known Limitations

- Application-specific wallet functions remain pending.
- Multi-user authentication is not implemented.
- Institutional signing infrastructure is not implemented.
- Cross-chain wallet ownership binding is not implemented.
- Cardano Preprod-specific validation requires further work.
- Midnight transaction compatibility requires further review.
- Midnight smart contract interaction remains untested.
- Actual zero-knowledge proof generation remains untested.
- Automated wallet integration tests are not implemented.
- Browser testing was performed using a temporary Vite application.
- The selected wallet is a beta release.
- Existing dependency vulnerabilities require further review
  and remediation before production deployment.

## 17. Development Status

Last updated: 2026-11-28.

The shared wallet configuration and basic connection layer
for Cardano and Midnight have been implemented and verified.

EviTrace applications can use the shared Wallet SDK to connect
to both networks through the selected 1AM Beta wallet.

The next development stages include:

1. Cryptographic wallet ownership verification.
2. Institutional identity binding.
3. Reusable blockchain transaction functions.
4. Smart contract interaction.
5. Application-level integration.
6. Integration and security testing.

## 18. Resources

- https://1am.xyz/install-beta
- https://meshjs.dev/
- https://docs.midnight.network/
- https://docs.midnight.network/relnotes/support-matrix

## 19. License

Apache-2.0
