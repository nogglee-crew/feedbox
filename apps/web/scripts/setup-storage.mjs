import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  throw new Error("Supabase URL and secret key are required");
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: buckets, error: listError } = await supabase.storage.listBuckets();
if (listError) throw listError;

if (!buckets.some((bucket) => bucket.id === "screenshots")) {
  const { error } = await supabase.storage.createBucket("screenshots", {
    public: true,
    allowedMimeTypes: ["image/png"],
    fileSizeLimit: "8MB",
  });
  if (error) throw error;
}

console.log("Supabase Storage bucket is ready: screenshots");
