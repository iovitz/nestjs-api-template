import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "node:crypto";
import argon2 from "argon2";

@Injectable()
export class CryptoService implements OnModuleInit {
  private readonly logger = new Logger(CryptoService.name);
  private publicKey: string = "";

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const privateKeyEnv = [
      "-----BEGIN PRIVATE KEY-----",
      this.configService.getOrThrow<string>("ED25519_PRIVATE_KEYS"),
      "-----END PRIVATE KEY-----",
    ].join("\n");
    const privateKey = crypto.createPrivateKey(privateKeyEnv);
    const publicKeyObj = crypto.createPublicKey(privateKey);
    this.publicKey = publicKeyObj.export({ format: "pem", type: "spki" });
    console.log(this.publicKey);

    this.logger.log("Loaded Ed25519 public key from environment");
  }

  getEd25519PublicKeys(): string {
    if (!this.publicKey) {
      throw new Error("Ed25519 not available");
    }
    return this.publicKey;
  }

  ed25519Sign(message: string, privateKeyPEM: string): Buffer {
    const privateKey = crypto.createPrivateKey({
      key: privateKeyPEM,
      type: "pkcs8",
      format: "pem",
    });
    return crypto.sign(null, Buffer.from(message), privateKey);
  }

  ed25519Verify(message: string, signature: Buffer, publicKeyPEM: string): boolean {
    const publicKey = crypto.createPublicKey(publicKeyPEM);
    return crypto.verify(null, Buffer.from(message), publicKey, signature);
  }

  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  async verifyPassword(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }
}
