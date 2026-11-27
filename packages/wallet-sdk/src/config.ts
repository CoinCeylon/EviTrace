// Shared wallet configuration for EviTrace.

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
