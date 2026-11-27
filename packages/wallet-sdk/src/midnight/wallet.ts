import type {
    ConnectedAPI
} from "@midnight-ntwrk/dapp-connector-api";

import { WALLET_CONFIG } from "../config.js";

export async function connectMidnightWallet(): Promise<ConnectedAPI> {
    if (typeof window === "undefined") {
        throw new Error(
            "Midnight wallet requires a browser environment."
        );
    }

    const config = WALLET_CONFIG.midnight;

    const connector = window.midnight?.[config.connectorId];

    if (!connector) {
        throw new Error(
            "1AM Midnight wallet connector not found. Please install or enable 1AM Beta."
        );
    }

    if (connector.rdns !== config.rdns) {
        throw new Error(
            "Unexpected Midnight wallet identifier."
        );
    }

    if (connector.apiVersion !== config.apiVersion) {
        throw new Error(
            `Unsupported Midnight connector API version: ${connector.apiVersion}`
        );
    }

    const wallet = await connector.connect(config.network);

    const status = await wallet.getConnectionStatus();

    if (
        status.status !== "connected" ||
        status.networkId !== config.network
    ) {
        throw new Error(
            "Midnight wallet is not connected to Preprod."
        );
    }

    const configuration = await wallet.getConfiguration();

    if (configuration.networkId !== config.network) {
        throw new Error(
            "Invalid Midnight network configuration."
        );
    }

    return wallet;
}
