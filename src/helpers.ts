import { createHash, BinaryLike } from 'crypto';

export function hash(data: BinaryLike) {
  return createHash('sha256').update(data).digest('hex');
}

export function validatedHash(
  { hash, difficulty = 4, prefix = '0' }:
  { hash: string; difficulty: number; prefix: string; }
) {
  return hash.startsWith(
    prefix.repeat(difficulty),
  );
}
