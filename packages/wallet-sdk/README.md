# EviTrace Wallet SDK

Shared wallet integration package for EviTrace institutional
applications.

## Purpose

Provides a common foundation for browser wallet integration
and cryptographic signing operations.

The current implementation exposes the Mesh BrowserWallet API.
Application-specific wallet functions will be implemented later.

## Verified Environment

| Component | Version |
|---|---|
| Node.js | 22.23.5 |
| npm | 10.9.9 |
| Mesh Core SDK | 1.9.1 |
| Mesh Wallet SDK | 1.9.1 |
| Vite | 6.4.6 |
| Vite Node Polyfills | 0.28.0 |
| Wallet Standard | CIP-30 |
| Tested Wallet | Lace |
| Network | Cardano Preprod |

## Installation

From the repository root:

```bash
npm ci
npm run build -w @evitrace/wallet-sdk
```

## Type Checking

```bash
npm run typecheck -w @evitrace/wallet-sdk
```

## Basic Usage

```typescript
import { BrowserWallet } from "@evitrace/wallet-sdk";

const wallet = await BrowserWallet.enable("lace");

const networkId = await wallet.getNetworkId();
const address = await wallet.getChangeAddress();
const lovelace = await wallet.getLovelace();
const utxos = await wallet.getUtxos();
```

Wallet connection must run in a compatible browser environment.
The wallet provider and address must not be hardcoded to a
specific user.

## Vite Browser Compatibility

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

## Verified Functional Capabilities

- Lace wallet discovery and connection
- Testnet network identification
- Wallet balance retrieval
- Wallet address retrieval
- UTxO retrieval
- Unsigned transaction construction using MeshTxBuilder
- Transaction signing through Lace
- Transaction submission
- Transaction inclusion verification through Blockfrost

## First Test Transaction

Network: Cardano Preprod

Transaction type: Self-transfer

Amount: 2 test ADA

Transaction hash:
bf3fe5721c8b59a05d549432a8e1f69a4afea21ce9ebfb7902a38c79be1b9835

Block height: 5457740

Slot: 140002520

Transaction fee: 169989 Lovelace

Transaction size: 331 bytes

Verification: Blockfrost HTTP 200

## Security Requirements

- Never store user recovery phrases or private keys.
- Never expose Blockfrost credentials to frontend applications.
- Use testnet wallets during development.
- CIP-30 network ID 0 identifies a testnet, not specifically Preprod.
- Validate the intended network before signing transactions.
- Wallet ownership alone does not establish institutional authorization.

## Known Limitations

- Application-specific wallet functions are not implemented.
- Multi-user authentication is not implemented.
- Institutional signing infrastructure is not implemented.
- Midnight wallet integration is pending.
- Evidence-related smart contract integration is pending.
- Browser verification was performed using a temporary Vite application.
- Existing dependency vulnerabilities require remediation before
  public deployment.

## License

Apache-2.0
