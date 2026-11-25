import { createHash } from 'node:crypto';

export function verifyAttachment(
  receivedBytes: Uint8Array,
  registeredSha256: string,
): 'PASSED' | 'FAILED' {
  if (!/^[0-9a-f]{64}$/i.test(registeredSha256)) {
    throw new Error('The registered SHA-256 fingerprint must contain 64 hexadecimal characters.');
  }

  const actual = createHash('sha256').update(receivedBytes).digest('hex');
  return actual === registeredSha256.toLowerCase() ? 'PASSED' : 'FAILED';
}
