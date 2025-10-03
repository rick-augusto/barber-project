'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import EditBarberModal from '@/components/admin/EditBarberModal'
import { useBarbearia } from '@/contexts/BarbeariaContext'
import { useRouter } from 'next/navigation'

type Barber = { id: string; nome_completo: string | null; }

export default function GerenciarFuncionariosPage() {
  const router = useRouter();
  const { barbearia, isLoading: isBarbeariaLoading } = useBarbearia();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);

  useEffect(() => {
    if (!isBarbeariaLoading) {
      if (!barbearia) {
        alert('Barbearia não identificada. Redirecionando para o login.');
        router.push('/login');
      } else {
        fetchBarbers();
      }
    }
  }, [barbearia, isBarbeariaLoading, router]);

  const fetchBarbers = async () => {
    if (!barbearia) return;
    setLoading(true);
    const { data, error } = await supabase.from('perfis').select('id, nome_completo').eq('funcao', 'barbeiro').eq('id_barbearia', barbearia.id).order('nome_completo', { ascending: true });
    if (error) {
      alert("Erro ao buscar funcionários.");
    } else {
      setBarbers(data || []);
    }
    setLoading(false);
  };

  const handleAddBarber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barbearia) return;
    setIsSubmitting(true);
    const { error } = await supabase.functions.invoke('create-barber', {
        body: { name: newName, email: newEmail, password: newPassword, barbearia_id: barbearia.id }
    });
    if (error) {
        alert("Erro ao criar funcionário: " + error.message);
    } else {
        alert("Funcionário criado com sucesso!");
        await fetchBarbers();
        setNewName(''); setNewEmail(''); setNewPassword('');
    }
    setIsSubmitting(false);
  };

  const handleDeleteBarber = async (id: string) => {
    if (!window.confirm("Atenção: Esta ação excluirá o usuário permanentemente. Deseja continuar?")) return;
    const { error } = await supabase.functions.invoke('delete-barber', { body: { id } });
    if (error) {
        alert("Erro ao excluir funcionário: " + error.message);
    } else {
        alert("Funcionário excluído com sucesso.");
        setBarbers(barbers.filter(b => b.id !== id));
    }
  };

  const handleEditBarber = (barber: Barber) => {
    setEditingBarber(barber);
    setIsModalOpen(true);
  };

  const handleUpdateBarber = async (updatedBarber: Barber) => {
    const { data, error } = await supabase.from('perfis').update({ nome_completo: updatedBarber.nome_completo }).eq('id', updatedBarber.id).select().single();
    if (error) {
      alert("Erro ao atualizar funcionário: " + error.message);
    } else if (data) {
      setBarbers(barbers.map(b => (b.id === data.id ? data : b)));
      setIsModalOpen(false);
    }
  };

  if (isBarbeariaLoading || loading) {
    return <div className="flex min-h-screen items-center justify-center"><p>Carregando...</p></div>;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
        <header className="mb-10">
          <Link href="/admin/dashboard" className="text-blue-600 hover:underline mb-4 block">&larr; Voltar para o Painel</Link>
          <h1 className="text-3xl font-bold text-gray-800">Gerenciar Funcionários</h1>
          <p className="text-gray-600">Cadastre e gerencie os barbeiros da barbearia "{barbearia?.nome}".</p>
        </header>
        <main>
          <section>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="rounded-lg bg-white p-6 shadow-md">
                <h3 className="mb-4 text-xl font-semibold text-gray-800">Adicionar Novo Funcionário</h3>
                <form onSubmit={handleAddBarber} className="space-y-4">
                  <input type="text" placeholder="Nome Completo" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full rounded-md p-3 text-gray-800 border border-gray-300" required />
                  <input type="email" placeholder="Email de Acesso" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="w-full rounded-md p-3 text-gray-800 border border-gray-300" required />
                  <input type="password" placeholder="Senha Provisória" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full rounded-md p-3 text-gray-800 border border-gray-300" required />
                  <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-blue-600 py-3 text-white transition hover:bg-blue-700 disabled:bg-blue-400">
                    {isSubmitting ? 'Adicionando...' : 'Adicionar Funcionário'}
                  </button>
                </form>
              </div>
              <div className="rounded-lg bg-white p-6 shadow-md">
                <h3 className="mb-4 text-xl font-semibold text-gray-800">Minha Equipe</h3>
                <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {barbers.length > 0 ? barbers.map(b => (
                    <li key={b.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                      <span className="font-medium text-gray-700">{b.nome_completo}</span>
                      <div className="flex gap-2">
                        <button onClick={() => handleEditBarber(b)} className="text-sm font-semibold text-blue-600 hover:text-blue-800">Editar</button>
                        <button onClick={() => handleDeleteBarber(b.id)} className="text-sm font-semibold text-red-600 hover:text-red-800">Excluir</button>
                      </div>
                    </li>
                  )) : <p className="text-gray-500">Nenhum funcionário cadastrado.</p>}
                </ul>
              </div>
            </div>
          </section>
        </main>
      </div>
      <EditBarberModal isOpen={isModalOpen} barber={editingBarber} onClose={() => setIsModalOpen(false)} onSave={handleUpdateBarber} />
    </>
  );
}