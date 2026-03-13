import { Migration } from "@mikro-orm/migrations";

export class Migration20260313164804 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "users" ("id" varchar(255) not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "name" text not null, "email" text not null, "password" text not null, "status" smallint not null default 0, "last_login_at" timestamptz null, primary key ("id"));`,
    );
    this.addSql(`comment on column "users"."id" is '主键（雪花ID）';`);
    this.addSql(`comment on column "users"."created_at" is '创建时间';`);
    this.addSql(`comment on column "users"."updated_at" is '更新时间';`);
    this.addSql(`comment on column "users"."name" is '用户昵称';`);
    this.addSql(`comment on column "users"."email" is '邮件';`);
    this.addSql(`comment on column "users"."password" is '密码';`);
    this.addSql(
      `comment on column "users"."status" is '状态：0（用户正常），1（未校验邮箱），2（账号被封禁）';`,
    );
    this.addSql(`comment on column "users"."last_login_at" is '最后登录时间';`);
    this.addSql(`alter table "users" add constraint "users_email_unique" unique ("email");`);
  }
}
