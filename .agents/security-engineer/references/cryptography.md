# Cryptography & Secrets Management Reference

## Modern Cryptographic Algorithms

### Hashing (Password Storage)
- **Argon2id** (recommended): Memory-hard, GPU-resistant, configurable time/memory/parallelism
- **bcrypt**: Cost factor 10+ (2^10 rounds), older but widely supported
- **scrypt**: Memory-hard, CPU + memory intensive
- **PBKDF2**: NIST-approved, less memory-hard (use with high iterations)
- **NEVER**: MD5, SHA-1, SHA-256 alone (fast, no salt), unsalted hashes

### Symmetric Encryption
- **AES-256-GCM**: Authenticated encryption (confidentiality + integrity), preferred
- **AES-256-CBC**: Block cipher, requires HMAC for integrity (encrypt-then-MAC)
- **ChaCha20-Poly1305**: Fast in software, good for mobile/embedded
- **Key Sizes**: Minimum 128-bit (AES-128), recommended 256-bit
- **IV/Nonce**: Always random, never reuse with same key

### Asymmetric Cryptography
- **RSA**: 2048-bit minimum (3072-bit recommended), verify before decrypt
- **Elliptic Curve (ECDSA, EdDSA)**: P-256 (secp256r1), Ed25519 (recommended)
- **Key Exchange**: X25519 (ECDH) for key agreement
- **Signing**: Ed25519 for signatures, ECDSA P-256 for compatibility

### TLS Configuration
- **TLS 1.3** preferred, TLS 1.2 minimum
- **Cipher Suites**: TLS_AES_256_GCM_SHA384, TLS_CHACHA20_POLY1305_SHA256
- **Disable**: TLS 1.0, 1.1, SSLv2, SSLv3
- **HSTS**: max-age=31536000, includeSubDomains, preload

## Key Management
- Use KMS (AWS KMS, GCP Cloud KMS, Azure Key Vault, HashiCorp Vault)
- Separate keys per environment (dev/staging/prod)
- Regular key rotation (90 days standard, 30 days for high-security)
- Encrypt keys at rest with HSM-backed keys
- Use envelope encryption (data key + master key)
- Audit all key access (CloudTrail, audit logs)
- Never hardcode keys in source code, config files, or env vars

## Secrets Management
- **HashiCorp Vault**: Dynamic secrets, leasing, rotation, audit
- **AWS Secrets Manager**: Automatic rotation for RDS, Redshift, DocumentDB
- **GCP Secret Manager**: Versioned, access logging, IAM integration
- **Azure Key Vault**: Hardware-backed keys, certificate management
- **Kubernetes External Secrets**: Sync secrets from vault to K8s Secrets
- **SOPS**: Encrypt files in Git (YAML, JSON, ENV) with AWS KMS/GCP KSM/Azure Key Vault/Age

## Common Anti-Patterns to Avoid
- Rolling your own cryptography
- Using ECB mode (leaks patterns in data)
- Hardcoded keys and secrets
- Storing secrets in environment variables (leaked in /proc)
- Using SHA-1/MD5 for security
- Reusing nonces/IVs
- Not rotating keys
- Storing secrets in git

## JWK (JSON Web Key) Format
```json
{
  "kty": "EC",
  "crv": "P-256",
  "x": "MKBCTNIcKUSDii11ySs3526iDZ8AiTo7Tu6KPAqv7D4",
  "y": "4Etl6SRW2YiLUrN5vfvVHuhp7x8PxltmWWlbbM4IFyM",
  "use": "enc",
  "alg": "ECDH-ES"
}
```
