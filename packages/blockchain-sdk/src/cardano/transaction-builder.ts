import { MeshTxBuilder } from "@meshsdk/core";
import { createCardanoProvider } from "./provider.js";

export function createTransactionBuilder(
    projectId: string
): MeshTxBuilder {

    const provider = createCardanoProvider(projectId);

    return new MeshTxBuilder({
        fetcher: provider,
        submitter: provider,
        evaluator: provider
    });
}
