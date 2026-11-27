// Public entry point for the EviTrace Wallet SDK.

export { WALLET_CONFIG } from "./config.js";

export {
    BrowserWallet,
    connectCardanoWallet
} from "./cardano/wallet.js";

export {
    connectMidnightWallet
} from "./midnight/wallet.js";

export type {
    ConnectedAPI as MidnightWalletAPI
} from "@midnight-ntwrk/dapp-connector-api";
