import crypto from 'node:crypto'

function getKey(): Buffer {
  const secret = process.env.SETTINGS_ENCRYPTION_KEY
  if (!secret) {
    throw new Error(
      'SETTINGS_ENCRYPTION_KEY não configurada nas variáveis de ambiente da Netlify. ' +
        'Gere uma com: openssl rand -hex 32',
    )
  }
  const key = Buffer.from(secret, 'hex')
  if (key.length !== 32) {
    throw new Error('SETTINGS_ENCRYPTION_KEY precisa ter 32 bytes (64 caracteres hex).')
  }
  return key
}

/** Criptografa um texto com AES-256-GCM. Formato: iv.authTag.ciphertext (hex, separados por ponto). */
export function encryptSecret(plainText: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const ciphertext = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return [iv.toString('hex'), authTag.toString('hex'), ciphertext.toString('hex')].join('.')
}

export function decryptSecret(encoded: string): string {
  const key = getKey()
  const [ivHex, tagHex, dataHex] = encoded.split('.')
  if (!ivHex || !tagHex || !dataHex) {
    throw new Error('Valor criptografado corrompido ou em formato inválido.')
  }
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(tagHex, 'hex')
  const data = Buffer.from(dataHex, 'hex')
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(authTag)
  const plain = Buffer.concat([decipher.update(data), decipher.final()])
  return plain.toString('utf8')
}
