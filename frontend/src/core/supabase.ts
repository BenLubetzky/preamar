// The one supabase connection for the frontend, used for login, signup and the session
// Its URL and public key come from .env.local

import {createClient} from "@supabase/supabase-js";


/** The shared Supabase client used for login, signup and the session*/
export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);