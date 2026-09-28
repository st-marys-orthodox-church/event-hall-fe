import { createHmac, randomInt } from 'node:crypto';

/*
 * Room token for the BytePlus RTC SDK, in the wire format of BytePlus's reference generator
 * (byteplus-sdk/RTC_AIGC_Demo, Server/token.js, BSD-3-Clause): version, app id, then base64 of
 * the packed claims and their HMAC-SHA256 under the app key.
 */
const VERSION = '001';

const PRIVILEGE_PUBLISH_STREAM = 0;
const PRIVILEGE_PUBLISH_AUDIO = 1;
const PRIVILEGE_PUBLISH_VIDEO = 2;
const PRIVILEGE_PUBLISH_DATA = 3;
const PRIVILEGE_SUBSCRIBE_STREAM = 4;

const uint16 = (value: number): Buffer => {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value);
  return buffer;
};

const uint32 = (value: number): Buffer => {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value);
  return buffer;
};

const bytes = (value: Buffer): Buffer => Buffer.concat([uint16(value.length), value]);

type RtcTokenInput = {
  appId: string;
  appKey: string;
  roomId: string;
  userId: string;
  /** Unix seconds. Once past, the SDK drops the visitor from the room. */
  expiresAt: number;
  issuedAt?: number;
  nonce?: number;
};

export const createRtcToken = ({
  appId,
  appKey,
  roomId,
  userId,
  expiresAt,
  issuedAt = Math.floor(Date.now() / 1000),
  nonce = randomInt(0xffffffff),
}: RtcTokenInput): string => {
  const privileges = [
    PRIVILEGE_PUBLISH_STREAM,
    PRIVILEGE_PUBLISH_AUDIO,
    PRIVILEGE_PUBLISH_VIDEO,
    PRIVILEGE_PUBLISH_DATA,
    PRIVILEGE_SUBSCRIBE_STREAM,
  ];
  const claims = Buffer.concat([
    uint32(nonce),
    uint32(issuedAt),
    uint32(expiresAt),
    bytes(Buffer.from(roomId)),
    bytes(Buffer.from(userId)),
    uint16(privileges.length),
    ...privileges.flatMap((privilege) => [uint16(privilege), uint32(expiresAt)]),
  ]);
  const signature = createHmac('sha256', appKey).update(claims).digest();
  return `${VERSION}${appId}${Buffer.concat([bytes(claims), bytes(signature)]).toString('base64')}`;
};
