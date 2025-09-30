// src/lib/supabaseClient.ts

import { createClient } from '@supabase/supabase-js'

// Pega a URL e a Chave anônima do seu arquivo .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cria e exporta uma única instância do cliente Supabase para ser reutilizada em todo o seu projeto.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)