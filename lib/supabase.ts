import { createClient } from '@supabase/supabase-js'

// Direct configuration to bypass Vercel Env Var issues
const supabaseUrl = 'https://ymqbmpnzteegashtjccn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltcWJtcG56dGVlZ2FzaHRqY2NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMDY5MjgsImV4cCI6MjA4NDc4MjkyOH0.RafRRKq1YcRWf4T9SKcmPn7DZ9LslTCKY9JhQNqLoRw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
