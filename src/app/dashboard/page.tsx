'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import type { User } from '@supabase/supabase-js'

type Service = {
  id: number
  nome: string
  preco: number
  duracao_minutos: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const [services, setServices] = useState<Service[]>([])
  const [newServiceName, setNewServiceName] = useState('')
  const [newServicePrice, setNewServicePrice] = useState('')
  const [newServiceDuration, setNewServiceDuration] = useState('')

  const fetchServices = async () => {
    const { data, error } = await supabase.from('servicos').select('*')
    if (error) {
      console.error('Erro ao buscar serviços:', error)
    } else {
      setServices(data)
    }
  }

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
        await fetchServices()
        setLoading(false)
      }
    }
    checkSession()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleAddService = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!newServiceName || !newServicePrice || !newServiceDuration) {
      alert('Por favor, preencha todos os campos.')
      return
    }

    const { data, error } = await supabase.from('servicos').insert([
      {
        nome: newServiceName,
        preco: parseFloat(newServicePrice),
        duracao_minutos: parseInt(newServiceDuration),
        id_barbearia: 1,
      },
    ]).select()

    if (error) {
      console.error('Erro ao adicionar serviço:', error)
      alert('Não foi possível adicionar o serviço.')
    } else if (data) {
      setServices([...services, data[0]])
      setNewServiceName('')
      setNewServicePrice('')
      setNewServiceDuration('')
    }
  }

  const handleDeleteService = async (serviceId: number) => {
    if (!window.confirm('Tem certeza que deseja deletar este serviço?')) {
      return
    }

    const { error } = await supabase.from('servicos').delete().match({ id: serviceId })

    if (error) {
      console.error('Erro ao deletar serviço:', error)
      alert('Não foi possível deletar o serviço.')
    } else {
      setServices(services.filter((s) => s.id !== serviceId))
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          {user && <p className="text-md text-gray-600">Bem-vindo, {user.email}</p>}
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg bg-red-600 px-5 py-2 text-white transition hover:bg-red-700"
        >
          Sair
        </button>
      </header>

      <main className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-2xl font-semibold text-gray-700">Adicionar Novo Serviço</h2>
          <form onSubmit={handleAddService}>
            <div className="mb-4">
              <label htmlFor="serviceName" className="mb-1 block text-sm font-medium text-gray-600">Nome do Serviço</label>
              <input type="text" id="serviceName" value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} className="w-full rounded-md border border-gray-300 p-2 text-gray-800" />
            </div>
            <div className="mb-4">
              <label htmlFor="servicePrice" className="mb-1 block text-sm font-medium text-gray-600">Preço (R$)</label>
              <input type="number" step="0.01" id="servicePrice" value={newServicePrice} onChange={(e) => setNewServicePrice(e.target.value)} className="w-full rounded-md border border-gray-300 p-2 text-gray-800" />
            </div>
            <div className="mb-4">
              <label htmlFor="serviceDuration" className="mb-1 block text-sm font-medium text-gray-600">Duração (minutos)</label>
              <input type="number" id="serviceDuration" value={newServiceDuration} onChange={(e) => setNewServiceDuration(e.target.value)} className="w-full rounded-md border border-gray-300 p-2 text-gray-800" />
            </div>
            <button type="submit" className="w-full rounded-lg bg-blue-600 py-2 text-white transition hover:bg-blue-700">
              Adicionar Serviço
            </button>
          </form>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-2xl font-semibold text-gray-700">Meus Serviços</h2>
          <ul className="space-y-3">
            {services.length > 0 ? (
              services.map((service) => (
                <li key={service.id} className="flex items-center justify-between rounded-md bg-gray-50 p-3">
                  <div>
                    <p className="font-semibold text-gray-800">{service.nome}</p>
                    <p className="text-sm text-gray-600">
                      R$ {Number(service.preco).toFixed(2)} - {service.duracao_minutos} min
                    </p>
                  </div>
                  <button onClick={() => handleDeleteService(service.id)} className="rounded bg-red-100 px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-200">
                    Deletar
                  </button>
                </li>
              ))
            ) : (
              <p className="text-gray-500">Nenhum serviço cadastrado ainda.</p>
            )}
          </ul>
        </div>
      </main>
    </div>
  )
}