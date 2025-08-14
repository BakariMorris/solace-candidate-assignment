import { sql } from "drizzle-orm";
import {
  pgTable,
  integer,
  text,
  jsonb,
  serial,
  timestamp,
  bigint,
  index,
} from "drizzle-orm/pg-core";

const advocates = pgTable("advocates", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  city: text("city").notNull(),
  degree: text("degree").notNull(),
  specialties: jsonb("payload").default([]).notNull(),
  yearsOfExperience: integer("years_of_experience").notNull(),
  phoneNumber: bigint("phone_number", { mode: "number" }).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  firstNameIdx: index("idx_advocates_first_name").on(table.firstName),
  lastNameIdx: index("idx_advocates_last_name").on(table.lastName),
  cityIdx: index("idx_advocates_city").on(table.city),
  degreeIdx: index("idx_advocates_degree").on(table.degree),
  yearsOfExperienceIdx: index("idx_advocates_years_experience").on(table.yearsOfExperience),
  specialtiesIdx: index("idx_advocates_specialties").using("gin", table.specialties),
  createdAtIdx: index("idx_advocates_created_at").on(table.createdAt),
  nameSearchIdx: index("idx_advocates_name_search").on(table.firstName, table.lastName),
  locationExperienceIdx: index("idx_advocates_location_experience").on(table.city, table.yearsOfExperience),
}));

export { advocates };
