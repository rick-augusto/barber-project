// supabase/functions/create-barber/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Lida com a requisição preflight do CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, email, password, barbearia_id } = await req.json()

    // Cria um cliente Supabase com privilégios de administrador
    // Isso é seguro porque este código roda no servidor do Supabase
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Cria o usuário no sistema de autenticação
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirma o email
    })

    if (authError) throw authError

    // 2. Cria o perfil correspondente na tabela 'perfis'
    const { error: profileError } = await supabaseAdmin.from('perfis').insert({
      id: authData.user.id, // Usa o mesmo ID do usuário criado
      nome_completo: name,
      funcao: 'barbeiro',
      id_barbearia: barbearia_id,
    })

    if (profileError) throw profileError

    return new Response(JSON.stringify({ message: 'Barbeiro criado com sucesso!' }), {
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