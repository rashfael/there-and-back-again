import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fhbdqjdurbxlbqpbfvoz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoYmRxamR1cmJ4bGJxcGJmdm96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzM0Njc1NjEsImV4cCI6MTk4OTA0MzU2MX0.r-iYHJfNiDmxJ1SbdT2A-CJCiduIQZzvM9nXDXr6sD0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase
