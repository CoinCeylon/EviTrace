import { verifyAttachment } from './verify-attachment';

describe('verifyAttachment', () => {
  const registered = 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad';

  it('passes when the received bytes match the registered fingerprint', () => {
    expect(verifyAttachment(Buffer.from('abc'), registered)).toBe('PASSED');
  });

  it('fails when one received byte differs', () => {
    expect(verifyAttachment(Buffer.from('abd'), registered)).toBe('FAILED');
  });

  it('reports an invalid registered fingerprint separately', () => {
    expect(() => verifyAttachment(Buffer.from('abc'), 'invalid')).toThrow(
      '64 hexadecimal characters',
    );
  });
});
