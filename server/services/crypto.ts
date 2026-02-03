/**
 * Encryption utilities for sensitive data (Z-API tokens, etc.)
 * Uses AES-256-GCM for authenticated encryption
 *
 * NOTE: Bun automatically loads .env files - no dotenv needed.
 * See: https://bun.sh/docs/runtime/environment-variables
 */
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 16;
const KEY_LENGTH = 32;

// Cache the encryption key to avoid repeated scrypt calls
let _cachedKey: Buffer | null = null;

function getEncryptionKey(): Buffer {
  if (_cachedKey) return _cachedKey;

  // Use Bun.env for more reliable access, fallback to process.env
  const secret = Bun.env.ENCRYPTION_KEY ?? process.env.ENCRYPTION_KEY;

  if (!secret) {
    throw new Error(
      "ENCRYPTION_KEY environment variable is required. " +
        "Add ENCRYPTION_KEY=<32-char-random-string> to your .env file."
    );
  }

  // Derive a key from the secret using scrypt
  _cachedKey = scryptSync(secret, "neondash-salt", KEY_LENGTH);
  return _cachedKey;
}

/**
 * Encrypt a string value
 * Returns format: salt:iv:tag:ciphertext (base64 encoded)
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const salt = randomBytes(SALT_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, "utf8", "base64");
  encrypted += cipher.final("base64");

  const tag = cipher.getAuthTag();

  return [salt.toString("base64"), iv.toString("base64"), tag.toString("base64"), encrypted].join(
    ":"
  );
}

/**
 * Decrypt a string value
 * Expects format: salt:iv:tag:ciphertext (base64 encoded)
 */
export function decrypt(encryptedData: string): string {
  const key = getEncryptionKey();
  const [_salt, ivB64, tagB64, ciphertext] = encryptedData.split(":");

  if (!ivB64 || !tagB64 || !ciphertext) {
    throw new Error("Invalid encrypted data format");
  }

  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(ciphertext, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Safe decrypt that returns null on error
 */
export function safeDecrypt(encryptedData: string | null | undefined): string | null {
  if (!encryptedData) return null;
  try {
    return decrypt(encryptedData);
  } catch {
    return null;
  }
}
