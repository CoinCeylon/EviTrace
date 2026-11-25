import { MeshTxBuilder } from "@meshsdk/core";

export function createTransactionBuilder(): MeshTxBuilder {
    return new MeshTxBuilder();
}
