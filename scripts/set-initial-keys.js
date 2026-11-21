// Run once, after running supabase/schema.sql, to set the first site key
// and admin key. Usage:
//   node scripts/set-initial-keys.js <site-key> <admin-key>
// Example:
//   node scripts/set-initial-keys.js 243571 hci-aycf-2027
//
// Requires .env.local to be filled in first (NEXT_PUBLIC_SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY).

require("dotenv").config({ path: ".env.local" });
const bcrypt = require("bcryptjs");
const { createClient } = require("@supabase/supabase-js");

async function main() {
  const [siteKey, adminKey] = process.argv.slice(2);
  if (!siteKey || !adminKey) {
    console.error(
      "Usage: node scripts/set-initial-keys.js <site-key> <admin-key>"
    );
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey);

  const site_key_hash = await bcrypt.hash(siteKey, 10);
  const admin_key_hash = await bcrypt.hash(adminKey, 10);

  const { error } = await supabase
    .from("site_config")
    .upsert({ id: 1, site_key_hash, admin_key_hash });

  if (error) {
    console.error("Failed to set keys:", error.message);
    process.exit(1);
  }

  console.log("Site key and admin key set successfully.");
  console.log("Site key:", siteKey);
  console.log("Admin key:", adminKey);
  console.log("Keep these somewhere safe — you can rotate them later from the Admin tab.");
}

main();
