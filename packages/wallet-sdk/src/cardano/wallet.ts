import { BrowserWallet } from "@meshsdk/core";
import { WALLET_CONFIG } from "../config.js";

export { BrowserWallet };

export async function connectCardanoWallet(): Promise<BrowserWallet> {
    const wallet = await BrowserWallet.enable(
        WALLET_CONFIG.cardano.connectorId
    );

    const networkId = await wallet.getNetworkId();

    if (networkId !== WALLET_CONFIG.cardano.networkId) {
        throw new Error(
            "Invalid Cardano network. Please select a testnet wallet."
        );
    }

    return wallet;
}
