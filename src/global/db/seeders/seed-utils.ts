import { Snowflake } from "@sapphire/snowflake";

const seedIdGenerator = new Snowflake(new Date("2000-01-01T00:00:00.000Z"));

export function generateSeedId() {
  return seedIdGenerator.generate().toString();
}
