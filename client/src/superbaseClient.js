// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kadwnqiceewpnbbwtjvi.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthZHducWljZWV3cG5iYnd0anZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjU1MTY4NywiZXhwIjoyMDYyMTI3Njg3fQ.cK5U9F9RuusnJ9ymd07Najn4k_f9WOsufQA_amrYcGw'
export const supabase = createClient(supabaseUrl, supabaseKey)
