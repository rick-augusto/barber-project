// src/components/barbeiro/GerenciarHorarios.tsx
'use client'

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

type Horario = {
    dia_semana: number;
    hora_inicio: string;
    hora_fim: string;
};

const diasDaSemana = [
    { id: 1, nome: 'Segunda-feira' },
    { id: 2, nome: 'Terça-feira' },
    { id: 3, nome: 'Quarta-feira' },
    { id: 4, nome: 'Quinta-feira' },
    { id: 5, nome: 'Sexta-feira' },
    { id: 6, nome: 'Sábado' },
];

export default function GerenciarHorarios({ userId }: { userId: string }) {
    const [horarios, setHorarios] = useState<Record<number, { inicio: string; fim: string }>>({});
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchHorarios = async () => {
            const { data, error } = await supabase
                .from('horarios_trabalho')
                .select('dia_semana, hora_inicio, hora_fim')
                .eq('barbeiro_id', userId);

            if (error) {
                console.error("Erro ao buscar horários:", error);
            } else {
                const horariosIniciais: Record<number, { inicio: string; fim: string }> = {};
                data.forEach(h => {
                    horariosIniciais[h.dia_semana] = {
                        inicio: h.hora_inicio.substring(0, 5), // Formata para HH:mm
                        fim: h.hora_fim.substring(0, 5),
                    };
                });
                setHorarios(horariosIniciais);
            }
            setLoading(false);
        };
        fetchHorarios();
    }, [userId]);

    const handleHorarioChange = (dia: number, tipo: 'inicio' | 'fim', valor: string) => {
        setHorarios(prev => ({
            ...prev,
            [dia]: {
                ...prev[dia],
                [tipo]: valor,
            },
        }));
    };

    const handleSalvarHorarios = async () => {
        setIsSaving(true);
        const dadosParaUpsert = Object.entries(horarios)
            .filter(([_, h]) => h.inicio && h.fim) // Salva apenas se ambos os campos estiverem preenchidos
            .map(([dia, h]) => ({
                barbeiro_id: userId,
                dia_semana: parseInt(dia),
                hora_inicio: h.inicio,
                hora_fim: h.fim,
            }));

        // Usamos 'upsert' para inserir novos horários ou atualizar existentes
        const { error } = await supabase.from('horarios_trabalho').upsert(dadosParaUpsert, {
            onConflict: 'barbeiro_id, dia_semana'
        });

        if (error) {
            alert("Erro ao salvar horários: " + error.message);
        } else {
            alert("Horários salvos com sucesso!");
        }
        setIsSaving(false);
    };

    if (loading) return <p>Carregando horários...</p>;

    return (
        <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="mb-4 text-xl font-semibold text-gray-800">Meus Horários de Trabalho</h3>
            <div className="space-y-4">
                {diasDaSemana.map(dia => (
                    <div key={dia.id} className="grid grid-cols-3 items-center gap-4">
                        <label className="font-medium text-gray-700">{dia.nome}</label>
                        <input
                            type="time"
                            value={horarios[dia.id]?.inicio || ''}
                            onChange={(e) => handleHorarioChange(dia.id, 'inicio', e.target.value)}
                            className="rounded-md border-gray-300 p-2 text-gray-800 shadow-sm"
                        />
                        <input
                            type="time"
                            value={horarios[dia.id]?.fim || ''}
                            onChange={(e) => handleHorarioChange(dia.id, 'fim', e.target.value)}
                            className="rounded-md border-gray-300 p-2 text-gray-800 shadow-sm"
                        />
                    </div>
                ))}
            </div>
            <button
                onClick={handleSalvarHorarios}
                disabled={isSaving}
                className="mt-6 w-full rounded-lg bg-blue-600 py-3 text-white transition hover:bg-blue-700 disabled:bg-blue-400 sm:w-auto"
            >
                {isSaving ? 'Salvando...' : 'Salvar Horários'}
            </button>
        </div>
    );
}