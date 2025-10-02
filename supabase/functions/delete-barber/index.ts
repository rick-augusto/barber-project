// supabase/functions/delete-barber/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Lida com a requisição preflight do CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { id } = await req.json()
    if (!id) {
      throw new Error("O ID do funcionário é obrigatório.")
    }

    // Cliente Supabase com privilégios de administrador
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Deleta o usuário do sistema de autenticação.
    // O Supabase automaticamente deletará o perfil correspondente em 'perfis'
    // graças à configuração "ON DELETE CASCADE" que definimos na tabela.
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id)

    if (error) {
      throw error
    }

    return new Response(JSON.stringify({ message: 'Funcionário excluído com sucesso!' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})