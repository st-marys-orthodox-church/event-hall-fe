import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { createRtcToken } from '../../src/server/voice/rtcToken';

const input = {
  appId: '0123456789abcdef01234567',
  appKey: 'test-app-key',
  roomId: 'hall_room1',
  userId: 'visitor_1',
  expiresAt: 1790000400,
  issuedAt: 1790000000,
  nonce: 305419896,
};

describe('createRtcToken', () => {
  it("matches the token BytePlus's reference generator makes from the same claims", () => {
    // Produced by Server/token.js in byteplus-sdk/RTC_AIGC_Demo at commit dd276f4.
    expect(createRtcToken(input)).toBe(
      '0010123456789abcdef01234567QwB4VjQSgDuxahA9sWoKAGhhbGxfcm9vbTEJAHZpc2l0b3JfMQUAAAAQPbFqAQAQPbFqAgAQPbFqAwAQPbFqBAAQPbFqIAD0mbtgli1UVuWZe9MPeht4mRyGdhwhHAUXw4q8cZPHfg=='
    );
  });

  it('is signed with the app key over the claims', () => {
    const body = Buffer.from(createRtcToken(input).slice(3 + input.appId.length), 'base64');
    const claimsLength = body.readUInt16LE(0);
    const claims = body.subarray(2, 2 + claimsLength);
    const signature = body.subarray(2 + claimsLength + 2);
    expect(signature).toEqual(createHmac('sha256', input.appKey).update(claims).digest());
  });

  it('carries the expiry, which is what ends a call that runs too long', () => {
    const body = Buffer.from(createRtcToken(input).slice(3 + input.appId.length), 'base64');
    expect(body.readUInt32LE(2 + 8)).toBe(input.expiresAt);
  });

  it('differs between two calls for the same visitor', () => {
    const { nonce: _nonce, ...rest } = input;
    expect(createRtcToken(rest)).not.toBe(createRtcToken(rest));
  });
});
