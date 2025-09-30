'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import type { User } from '@supabase/supabase-js'

// Tipagens para nossos dados
type Service = { 
  id: number; 
  nome: string; 
  preco: number; 
  duracao_minutos: number 
}
type Barber = { 
  id: string; 
  nome_completo: string | null; // O nome pode ser nulo inicialmente
  funcao: string 
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Estados para gerenciar Serviços
  const [services, setServices] = useState<Service[]>([])
  const [newServiceName, setNewServiceName] = useState('')
  const [newServicePrice, setNewServicePrice] = useState('')
  const [newServiceDuration, setNewServiceDuration] = useState('')

  // Estados para gerenciar Funcionários (Barbeiros)
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [newBarberName, setNewBarberName] = useState('')
  const [newBarberEmail, setNewBarberEmail] = useState('')
  const [newBarberPassword, setNewBarberPassword] = useState('')
  const [isSubmittingBarber, setIsSubmittingBarber] = useState(false)

  // Função otimizada para buscar todos os dados iniciais
  const fetchData = async () => {
    // Busca os serviços da barbearia de id=1 (lembre-se que isso é temporário)
    const fetchServices = supabase.from('servicos').select('*').eq('id_barbearia', 1)
    
    // Busca os perfis que são 'barbeiro' e pertencem à barbearia de id=1
    const fetchBarbers = supabase.from('perfis').select('id, nome_completo, funcao').eq('funcao', 'barbeiro').eq('id_barbearia', 1)

    // Executa as duas buscas em paralelo para mais eficiência
    const [servicesRes, barbersRes] = await Promise.all([fetchServices, fetchBarbers])

    if (servicesRes.error) console.error('Erro ao buscar serviços:', servicesRes.error)
    else setServices(servicesRes.data || [])

    if (barbersRes.error) console.error('Erro ao buscar barbeiros:', barbersRes.error)
    else setBarbers(barbersRes.data || [])
  }

  useEffect(() => {
    const checkSessionAndFetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
        await fetchData()
        setLoading(false)
      }
    }
    checkSessionAndFetchData()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Funções CRUD para Serviços
  const handleAddService = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const { data, error } = await supabase.from('servicos').insert([{ nome: newServiceName, preco: parseFloat(newServicePrice), duracao_minutos: parseInt(newServiceDuration), id_barbearia: 1 }]).select()
    if (!error && data) {
      setServices([...services, data[0]])
      setNewServiceName(''); setNewServicePrice(''); setNewServiceDuration('')
    } else if (error) {
      alert('Erro ao adicionar serviço: ' + error.message)
    }
  }

  const handleDeleteService = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja deletar este serviço?')) return
    const { error } = await supabase.from('servicos').delete().match({ id })
    if (!error) {
      setServices(services.filter((s) => s.id !== id))
    } else {
      alert('Erro ao deletar serviço: ' + error.message)
    }
  }

  // Funções CRUD para Funcionários
  const handleAddBarber = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmittingBarber(true)
    
    const { data, error } = await supabase.functions.invoke('create-barber', {
        body: {
            name: newBarberName,
            email: newBarberEmail,
            password: newBarberPassword,
            barbearia_id: 1, // IMPORTANTE: Hardcoded por enquanto
        }
    })

    if (error) {
        alert('Erro ao criar funcionário: ' + error.message)
    } else {
        alert(data.message || 'Funcionário criado com sucesso!')
        await fetchData() // Recarrega todos os dados para mostrar o novo barbeiro na lista
        setNewBarberName(''); setNewBarberEmail(''); setNewBarberPassword('')
    }
    setIsSubmittingBarber(false)
  }

  // A função de deletar um funcionário é mais complexa e faremos em um próximo passo
  const handleDeleteBarber = async (id: string) => {
    alert('A função de deletar funcionário será implementada no próximo passo!')
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><p className="text-xl">Carregando...</p></div>
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          {user && <p className="text-gray-600">Bem-vindo, {user.email}</p>}
        </div>
        <button onClick={handleLogout} className="rounded-lg bg-red-600 px-5 py-2 text-white transition hover:bg-red-700">Sair</button>
      </header>

      {/* Seção de Serviços */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold text-gray-700">Gerenciar Serviços</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="rounded-lg bg-white p-6 shadow-md">
                <h3 className="mb-4 text-xl font-semibold text-gray-800">Adicionar Novo Serviço</h3>
                <form onSubmit={handleAddService} className="space-y-4">
                    <input type="text" placeholder="Nome do Serviço" value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} className="w-full rounded-md p-2 text-gray-800 border border-gray-300" required />
                    <input type="number" step="0.01" placeholder="Preço (R$)" value={newServicePrice} onChange={(e) => setNewServicePrice(e.target.value)} className="w-full rounded-md p-2 text-gray-800 border border-gray-300" required />
                    <input type="number" placeholder="Duração (minutos)" value={newServiceDuration} onChange={(e) => setNewServiceDuration(e.target.value)} className="w-full rounded-md p-2 text-gray-800 border border-gray-300" required />
                    <button type="submit" className="w-full rounded-lg bg-blue-600 py-2 text-white transition hover:bg-blue-700">Adicionar Serviço</button>
                </form>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-md">
                <h3 className="mb-4 text-xl font-semibold text-gray-800">Meus Serviços</h3>
                <ul className="space-y-3 max-h-60 overflow-y-auto">
                  {services.length > 0 ? services.map(s => (
                    <li key={s.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                      <span className="font-medium text-gray-700">{s.nome} - R$ {Number(s.preco).toFixed(2)}</span>
                      <button onClick={() => handleDeleteService(s.id)} className="text-red-600 hover:text-red-800 text-sm font-semibold">Deletar</button>
                    </li>
                  )) : <p className="text-gray-500">Nenhum serviço cadastrado.</p>}
                </ul>
            </div>
        </div>
      </section>

      {/* Seção de Funcionários */}
      <section>
        <h2 className="mb-4 text-2xl font-semibold text-gray-700">Gerenciar Funcionários</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="rounded-lg bg-white p-6 shadow-md">
                <h3 className="mb-4 text-xl font-semibold text-gray-800">Adicionar Novo Funcionário</h3>
                <form onSubmit={handleAddBarber} className="space-y-4">
                    <input type="text" placeholder="Nome Completo" value={newBarberName} onChange={(e) => setNewBarberName(e.target.value)} className="w-full rounded-md p-2 text-gray-800 border border-gray-300" required />
                    <input type="email" placeholder="Email de Acesso" value={newBarberEmail} onChange={(e) => setNewBarberEmail(e.target.value)} className="w-full rounded-md p-2 text-gray-800 border border-gray-300" required />
                    <input type="password" placeholder="Senha Provisória" value={newBarberPassword} onChange={(e) => setNewBarberPassword(e.target.value)} className="w-full rounded-md p-2 text-gray-800 border border-gray-300" required />
                    <button type="submit" disabled={isSubmittingBarber} className="w-full rounded-lg bg-green-600 py-2 text-white transition hover:bg-green-700 disabled:bg-green-400">
                      {isSubmittingBarber ? 'Adicionando...' : 'Adicionar Funcionário'}
                    </button>
                </form>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-md">
                <h3 className="mb-4 text-xl font-semibold text-gray-800">Minha Equipe</h3>
                <ul className="space-y-3 max-h-60 overflow-y-auto">
                  {barbers.length > 0 ? barbers.map(b => (
                    <li key={b.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                      <span className="font-medium text-gray-700">{b.nome_completo}</span>
                      <button onClick={() => handleDeleteBarber(b.id)} className="text-red-600 hover:text-red-800 text-sm font-semibold">Deletar</button>
                    </li>
                  )) : <p className="text-gray-500">Nenhum funcionário cadastrado.</p>}
                </ul>
            </div>
        </div>
      </section>
    </div>
  )
}