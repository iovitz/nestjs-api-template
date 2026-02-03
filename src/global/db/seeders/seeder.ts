import { Seeder } from "@mikro-orm/seeder";
import { EntityManager } from "@mikro-orm/core";
import { UserSeeder } from "./user.seeder";

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    await this.call(em, [UserSeeder]);
  }
}
