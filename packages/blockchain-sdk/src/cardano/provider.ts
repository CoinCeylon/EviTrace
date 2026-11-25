import { BlockfrostProvider } from "@meshsdk/core";

export function createCardanoProvider(
    projectId: string
): BlockfrostProvider {

    if (!projectId.trim()) {
        throw new Error(
            "Blockfrost project ID is required."
        );
    }

    if (!projectId.startsWith("preprod")) {
        throw new Error(
            "A Cardano Preprod project ID is required."
        );
    }

    return new BlockfrostProvider(projectId);
}
