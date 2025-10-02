// src/components/barbeiro/GerenciarHabilidades.tsx
'use client'

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

type Servico = {
    id: number;
    nome: string;
};

export default function GerenciarHabilidades({ userId }: { userId: string }) {
    const [todosServicos, setTodosServicos] = useState<Servico[]>([]);
    const [habilidades, setHabilidades] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            // Busca todos os serviços disponíveis
            const { data: servicosData, error: servicosError } = await supabase
                .from('servicos').select('id, nome');

            // Busca as habilidades atuais do barbeiro
            const { data: habilidadesData, error: habilidadesError } = await supabase
                .from('barbeiro_habilidades').select('servico_id').eq('barbeiro_id', userId);

            if (servicosError || habilidadesError) {
                console.error("Erro ao buscar dados:", servicosError || habilidadesError);
            } else {
                setTodosServicos(servicosData || []);
                setHabilidades(new Set(habilidadesData.map(h => h.servico_id)));
            }
            setLoading(false);
        };
        fetchData();
    }, [userId]);

    const handleCheckboxChange = (servicoId: number) => {
        setHabilidades(prev => {
            const newSet = new Set(prev);
            if (newSet.has(servicoId)) {
                newSet.delete(servicoId);
            } else {
                newSet.add(servicoId);
            }
            return newSet;
        });
    };

    const handleSalvarHabilidades = async () => {
        setIsSaving(true);

        // 1. Deleta todas as habilidades existentes para este barbeiro
        const { error: deleteError } = await supabase.from('barbeiro_habilidades').delete().eq('barbeiro_id', userId);
        if (deleteError) {
            alert("Erro ao limpar habilidades antigas: " + deleteError.message);
            setIsSaving(false);
            return;
        }

        // 2. Insere as novas habilidades selecionadas
        const novasHabilidades = Array.from(habilidades).map(servicoId => ({
            barbeiro_id: userId,
            servico_id: servicoId,
        }));

        if (novasHabilidades.length > 0) {
            const { error: insertError } = await supabase.from('barbeiro_habilidades').insert(novasHabilidades);
            if (insertError) {
                alert("Erro ao salvar novas habilidades: " + insertError.message);
            } else {
                alert("Habilidades salvas com sucesso!");
            }
        } else {
             alert("Habilidades salvas com sucesso!"); // Caso ele não selecione nenhuma
        }
        setIsSaving(false);
    };

    if (loading) return <p>Carregando habilidades...</p>;

    return (
        <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="mb-4 text-xl font-semibold text-gray-800">Minhas Habilidades</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {todosServicos.map(servico => (
                    <label key={servico.id} className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={habilidades.has(servico.id)}
                            onChange={() => handleCheckboxChange(servico.id)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{servico.nome}</span>
                    </label>
                ))}
            </div>
             <button
                onClick={handleSalvarHabilidades}
                disabled={isSaving}
                className="mt-6 w-full rounded-lg bg-blue-600 py-3 text-white transition hover:bg-blue-700 disabled:bg-blue-400 sm:w-auto"
            >
                {isSaving ? 'Salvando...' : 'Salvar Habilidades'}
            </button>
        </div>
    );
}
