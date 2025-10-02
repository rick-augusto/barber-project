// src/app/admin/servicos/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import type { User } from '@supabase/supabase-js'
import EditServiceModal from '@/components/admin/EditServiceModal' // Verifique se este caminho está correto

// Tipagem para os nossos serviços
type Service = {
  id: number
  nome: string
  preco: number
  duracao_minutos: number
  id_barbearia: number
}

export default function GerenciarServicosPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Estados para gerenciar Serviços
  const [services, setServices] = useState<Service[]>([])
  const [newServiceName, setNewServiceName] = useState('')
  const [newServicePrice, setNewServicePrice] = useState('')
  const [newServiceDuration, setNewServiceDuration] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Estados para o Modal de Edição
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  // --- Funções de Autenticação e Carregamento de Dados ---
  useEffect(() => {
    const checkUserAndFetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login'); return;
      }
      const { data: profile, error } = await supabase.from('perfis').select('funcao').eq('id', session.user.id).single()
      if (error || !profile || profile.funcao !== 'admin') {
        alert('Acesso negado.'); router.push('/login'); return;
      }
      setUser(session.user)
      await fetchServices()
      setLoading(false)
    }
    checkUserAndFetchData()
  }, [router])

  // --- Funções CRUD para Serviços ---
  const fetchServices = async () => {
    const { data, error } = await supabase.from('servicos').select('*').eq('id_barbearia', 1).order('nome', { ascending: true })
    if (error) {
      console.error('Erro ao buscar serviços:', error); alert('Não foi possível carregar os serviços.');
    } else {
      setServices(data || [])
    }
  }

  const handleAddService = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const { data, error } = await supabase.from('servicos').insert([{ nome: newServiceName, preco: parseFloat(newServicePrice), duracao_minutos: parseInt(newServiceDuration), id_barbearia: 1 }]).select().single()
    if (error) {
      alert('Erro ao adicionar serviço: ' + error.message)
    } else {
      setServices([...services, data].sort((a, b) => a.nome.localeCompare(b.nome)))
      setNewServiceName(''); setNewServicePrice(''); setNewServiceDuration('');
    }
    setIsSubmitting(false)
  }

  const handleDeleteService = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.')) return
    const { error } = await supabase.from('servicos').delete().match({ id })
    if (error) {
      alert('Erro ao excluir serviço: ' + error.message)
    } else {
      setServices(services.filter((s) => s.id !== id))
    }
  }

  const handleEditService = (service: Service) => {
    setEditingService(service)
    setIsModalOpen(true)
  }

  const handleUpdateService = async (updatedService: Service) => {
    const { data, error } = await supabase
      .from('servicos')
      .update({
        nome: updatedService.nome,
        preco: updatedService.preco,
        duracao_minutos: updatedService.duracao_minutos
      })
      .eq('id', updatedService.id)
      .select()
      .single()

    if (error) {
      alert('Erro ao atualizar o serviço: ' + error.message)
    } else {
      setServices(services.map(s => (s.id === data.id ? data : s)).sort((a, b) => a.nome.localeCompare(b.nome)))
      setIsModalOpen(false)
      setEditingService(null)
    }
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><p className="text-xl">Carregando serviços...</p></div>
  }

  return (
    <>
      <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
        <header className="mb-10">
            <Link href="/admin/dashboard" className="text-blue-600 hover:underline mb-4 block">&larr; Voltar para o Painel</Link>
            <h1 className="text-3xl font-bold text-gray-800">Gerenciar Serviços</h1>
            <p className="text-gray-600">Adicione, edite ou remova os serviços oferecidos na barbearia.</p>
        </header>

        <main>
          <section>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="rounded-lg bg-white p-6 shadow-md">
                <h3 className="mb-4 text-xl font-semibold text-gray-800">Adicionar Novo Serviço</h3>
                <form onSubmit={handleAddService} className="space-y-4">
                  <input type="text" placeholder="Nome do Serviço" value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} className="w-full rounded-md p-3 text-gray-800 border border-gray-300 focus:border-blue-500 focus:ring-blue-500" required />
                  <input type="number" step="0.01" placeholder="Preço (ex: 45.50)" value={newServicePrice} onChange={(e) => setNewServicePrice(e.target.value)} className="w-full rounded-md p-3 text-gray-800 border border-gray-300 focus:border-blue-500 focus:ring-blue-500" required />
                  <input type="number" placeholder="Duração em minutos (ex: 30)" value={newServiceDuration} onChange={(e) => setNewServiceDuration(e.target.value)} className="w-full rounded-md p-3 text-gray-800 border border-gray-300 focus:border-blue-500 focus:ring-blue-500" required />
                  <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-blue-600 py-3 text-white transition hover:bg-blue-700 disabled:bg-blue-400">
                    {isSubmitting ? 'Adicionando...' : 'Adicionar Serviço'}
                  </button>
                </form>
              </div>
              <div className="rounded-lg bg-white p-6 shadow-md">
                <h3 className="mb-4 text-xl font-semibold text-gray-800">Serviços Cadastrados</h3>
                <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {services.length > 0 ? services.map(s => (
                    <li key={s.id} className="flex flex-col sm:flex-row justify-between sm:items-center bg-gray-50 p-3 rounded-md hover:bg-gray-100">
                      <div className='mb-2 sm:mb-0'>
                        <p className="font-medium text-gray-800">{s.nome}</p>
                        <p className="text-sm text-gray-500">R$ {Number(s.preco).toFixed(2)} - {s.duracao_minutos} min</p>
                      </div>
                      <div className="flex gap-2 self-end">
                        <button onClick={() => handleEditService(s)} className="text-sm font-semibold text-blue-600 hover:text-blue-800">Editar</button>
                        <button onClick={() => handleDeleteService(s.id)} className="text-sm font-semibold text-red-600 hover:text-red-800">Excluir</button>
                      </div>
                    </li>
                  )) : <p className="text-gray-500">Nenhum serviço cadastrado ainda.</p>}
                </ul>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* O Modal de Edição */}
      <EditServiceModal
        isOpen={isModalOpen}
        service={editingService}
        onClose={() => setIsModalOpen(false)}
        onSave={handleUpdateService}
      />
    </>
  )
}