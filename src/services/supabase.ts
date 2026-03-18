import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://hamnohvhvxqkunimrixe.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_xtq3umPe752gqoRZ-6bTOQ_-d3bN4Vs";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
