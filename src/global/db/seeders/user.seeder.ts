import { Seeder } from "@mikro-orm/seeder";
import { User } from "../entities/user.entity";
import { EntityManager } from "@mikro-orm/core";
import { generateSeedId } from "./seed-utils";
import argon2 from "argon2";

export class UserSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // 检查是否已存在用户，避免重复插入
    const record = await em.findOne(User, { email: "me@gmail.com" });
    if (record) {
      console.log("Test user already exists, skipping...");
      return;
    }

    em.create(User, {
      id: generateSeedId(),
      name: "Me",
      email: "me@gmail.com",
      password: await argon2.hash("123123"),
      status: 0,
    });

    console.log(`User seeder completed, inserted ${1} banners`);
  }
}
