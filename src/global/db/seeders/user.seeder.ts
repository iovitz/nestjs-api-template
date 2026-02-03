import { Seeder } from "@mikro-orm/seeder";
import { User } from "../entities/user.entity";
import { EntityManager } from "@mikro-orm/core";

export class UserSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // 检查是否已存在用户，避免重复插入
    const existingUser = await em.findOne(User, { email: "admin@xiaoshi.dev" });
    if (existingUser) {
      console.log("Admin user already exists, skipping...");
      return;
    }

    // // 注意：实际项目中应该使用加密后的密码
    const hashedPassword = "$argon2id$v=19$m=65536,t=3,p=4$PlaceholderHash$PlaceholderValue";

    em.create(User, {
      id: "1",
      name: "Admin",
      email: "admin@xiaoshi.dev",
      password: hashedPassword,
      status: 0,
    });

    console.log("Admin user seeded successfully!");
  }
}
