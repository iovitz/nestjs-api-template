import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import argon2 from "argon2";
import { encrypt, decrypt } from "eciesjs";

@Injectable()
export class CryptoService implements OnModuleInit {
  private readonly logger = new Logger(CryptoService.name);
  private eciesPrivateKey: string = "";
  private eciesPublicKey: string = "";

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    // Load ECIES keys from environment
    this.eciesPrivateKey = this.configService.getOrThrow<string>("ECIES_PRIVATE_KEY");
    this.eciesPublicKey = this.configService.getOrThrow<string>("ECIES_PUBLIC_KEY");

    this.logger.log("Loaded ECIES keys from environment");
  }

  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  async verifyPassword(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }

  /**
   * Encrypt data using ECIES with the configured public key
   * @param data - The data to encrypt (string or Buffer)
   * @returns Encrypted data as Buffer (IV + ciphertext)
   */
  eciesEncrypt(data: string | Buffer): Buffer {
    return encrypt(this.eciesPublicKey, Buffer.from(data));
  }

  /**
   * Decrypt data using ECIES with the configured private key
   * @param encryptedData - The encrypted data (Buffer or hex string)
   * @returns Decrypted data as Buffer
   */
  eciesDecrypt(encryptedData: Buffer | string): Buffer {
    const data =
      typeof encryptedData === "string" ? Buffer.from(encryptedData, "hex") : encryptedData;
    return decrypt(this.eciesPrivateKey, data);
  }

  /**
   * Get the configured ECIES public key
   * @returns The ECIES public key (hex string)
   */
  getEciesPublicKey(): string {
    return this.eciesPublicKey;
  }
}
