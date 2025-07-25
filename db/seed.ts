import { db, User, Account } from "astro:db";

const seedData = {
  user: {
    id: "vZlCL4fJoPSx2pcNHRRhecZmrqiWwiIv",
    name: "Matt",
    email: "test@email.com",
  },
  account: {
    id: "ytaw9MmgRiUYAfCqwBTZjZmY9XSAr2RG",
    userId: "vZlCL4fJoPSx2pcNHRRhecZmrqiWwiIv",
    accountId: "vZlCL4fJoPSx2pcNHRRhecZmrqiWwiIv",
    providerId: "credential",
    password:
      "249c06b83b9cd2146dacb4d153206aef:f5a96d213204572c5055c2d6692af96032060e1ef16bcb238fdbe2804330da2e112d9c04810436faf4bd22307b4631ace2c15790e55d30483fbea2a6c7e2396f",
  },
};

export default async function seed() {
  await db.insert(User).values(seedData.user);
  await db.insert(Account).values(seedData.account);
}
