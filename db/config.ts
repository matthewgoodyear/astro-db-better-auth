import { defineDb, defineTable, column } from "astro:db";
import { Auth } from "./auth";

export default defineDb({
  tables: {
    ...Auth,
  },
});
