'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import EditServiceModal from '@/components/admin/EditServiceModal'
import { useBarbearia } from '@/contexts/BarbeariaContext'

type Service = {
  id: number; nome: string; preco: number; duracao_minutos: number; id_barbearia: number;
}

export default function GerenciarServicosPage() {
  const router = useRouter();
  const { barbearia, isLoading: isBarbeariaLoading } = useBarbearia();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  useEffect(() => {
    if (!isBarbeariaLoading) {
      if (!barbearia) {
        alert('Barbearia não identificada. Redirecionando para o login.');
        router.push('/login');
      } else {
        fetchServices();
      }
    }
  }, [barbearia, isBarbeariaLoading, router]);

  const fetchServices = async () => {
    if (!barbearia) return;
    setLoading(true);
    const { data, error } = await supabase.from('servicos').select('*').eq('id_barbearia', barbearia.id).order('nome', { ascending: true });
    if (error) {
      console.error('Erro ao buscar serviços:', error);
      alert('Não foi possível carregar os serviços.');
    } else {
      setServices(data || []);
    }
    setLoading(false);
  };

  const handleAddService = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!barbearia) return;
    setIsSubmitting(true);
    const { data, error } = await supabase.from('servicos').insert([{ nome: newServiceName, preco: parseFloat(newServicePrice), duracao_minutos: parseInt(newServiceDuration), id_barbearia: barbearia.id }]).select().single();
    if (error) {
      alert('Erro ao adicionar serviço: ' + error.message);
    } else if (data) {
      setServices([...services, data].sort((a, b) => a.nome.localeCompare(b.nome)));
      setNewServiceName(''); setNewServicePrice(''); setNewServiceDuration('');
    }
    setIsSubmitting(false);
  };

  const handleDeleteService = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este serviço?')) return;
    const { error } = await supabase.from('servicos').delete().match({ id });
    if (error) {
      alert('Erro ao excluir serviço: ' + error.message);
    } else {
      setServices(services.filter((s) => s.id !== id));
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleUpdateService = async (updatedService: Service) => {
    const { data, error } = await supabase.from('servicos').update({ nome: updatedService.nome, preco: updatedService.preco, duracao_minutos: updatedService.duracao_minutos }).eq('id', updatedService.id).select().single();
    if (error) {
      alert('Erro ao atualizar o serviço: ' + error.message);
    } else if (data){
      setServices(services.map(s => (s.id === data.id ? data : s)).sort((a, b) => a.nome.localeCompare(b.nome)));
      setIsModalOpen(false);
      setEditingService(null);
    }
  };

  if (isBarbeariaLoading || loading) {
    return <div className="flex min-h-screen items-center justify-center"><p className="text-xl">Carregando...</p></div>;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
        <header className="mb-10">
          <Link href="/admin/dashboard" className="text-blue-600 hover:underline mb-4 block">&larr; Voltar para o Painel</Link>
          <h1 className="text-3xl font-bold text-gray-800">Gerenciar Serviços</h1>
          <p className="text-gray-600">Adicione, edite ou remova os serviços da barbearia "{barbearia?.nome}".</p>
        </header>

        <main>
          <section>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="rounded-lg bg-white p-6 shadow-md">
                <h3 className="mb-4 text-xl font-semibold text-gray-800">Adicionar Novo Serviço</h3>
                <form onSubmit={handleAddService} className="space-y-4">
                  <input type="text" placeholder="Nome do Serviço" value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} className="w-full rounded-md p-3 text-gray-800 border border-gray-300" required />
                  <input type="number" step="0.01" placeholder="Preço (ex: 45.50)" value={newServicePrice} onChange={(e) => setNewServicePrice(e.target.value)} className="w-full rounded-md p-3 text-gray-800 border border-gray-300" required />
                  <input type="number" placeholder="Duração em minutos (ex: 30)" value={newServiceDuration} onChange={(e) => setNewServiceDuration(e.target.value)} className="w-full rounded-md p-3 text-gray-800 border border-gray-300" required />
                  <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-blue-600 py-3 text-white transition hover:bg-blue-700 disabled:bg-blue-400">
                    {isSubmitting ? 'Adicionando...' : 'Adicionar Serviço'}
                  </button>
                </form>
              </div>
              <div className="rounded-lg bg-white p-6 shadow-md">
                <h3 className="mb-4 text-xl font-semibold text-gray-800">Serviços Cadastrados</h3>
                <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {services.length > 0 ? services.map(s => (
                    <li key={s.id} className="flex flex-col sm:flex-row justify-between sm:items-center bg-gray-50 p-3 rounded-md">
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
      <EditServiceModal isOpen={isModalOpen} service={editingService} onClose={() => setIsModalOpen(false)} onSave={handleUpdateService} />
    </>
  );
}