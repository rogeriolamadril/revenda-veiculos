// Read-only integration smoke test. No users, vehicles or storage objects are created.
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
try {
  process.loadEnvFile(".env.local");
} catch {
  /* CI can provide environment variables. */
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
assert.ok(url && key, "Supabase environment is required");
const client = createClient(url, key, { auth: { persistSession: false } });
const catalog = await client
  .from("vehicles")
  .select("*,vehicle_images(*)", { count: "exact" });
assert.equal(catalog.error, null, "Anonymous catalog query failed");
assert.ok(
  catalog.data.every((vehicle) => vehicle.status === "disponivel"),
  "Non-public vehicle leaked",
);
const facets = await client.rpc("catalog_facets");
assert.equal(facets.error, null, "Filter RPC failed");
const admins = await client.from("admin_profiles").select("user_id");
assert.ok(admins.error, "Anonymous user must not read admin profiles");
const storage = await client.storage.from("vehicle-images").list();
assert.ok(
  storage.error || storage.data.length === 0,
  "Anonymous storage listing must not expose objects",
);
const authSettings = await fetch(`${url}/auth/v1/settings`, {
  headers: { apikey: key },
});
assert.equal(authSettings.ok, true, "Auth settings endpoint failed");
const auth = await authSettings.json();
console.log(
  JSON.stringify(
    {
      catalog: "PASS",
      availableRows: catalog.count,
      filters: "PASS",
      administratorTableDenied: "PASS",
      storageListingRestricted: "PASS",
      emailAuthEnabled: auth.external?.email,
      publicSignupDisabled: auth.disable_signup,
    },
    null,
    2,
  ),
);
