// src/components/barbeiro/GerenciarHorarios.tsx
'use client'

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import isEqual from 'lodash.isequal';

// 1. Defina as colunas (dias) e linhas (horários) da nossa grelha
const diasDaSemana = [
    { id: 1, nome: 'Seg' },
    { id: 2, nome: 'Ter' },
    { id: 3, nome: 'Qua' },
    { id: 4, nome: 'Qui' },
    { id: 5, nome: 'Sex' },
    { id: 6, nome: 'Sáb' },
    { id: 0, nome: 'Dom' },
];

const faixasDeHorario = Array.from({ length: 13 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`); // Das 08:00 às 20:00

type Schedule = Record<number, string[]>;

const defaultSchedule: Schedule = {
    1: faixasDeHorario, // Segunda
    2: faixasDeHorario, // Terça
    3: faixasDeHorario, // Quarta
    4: faixasDeHorario, // Quinta
    5: faixasDeHorario, // Sexta
    6: [], // Sábado
    0: [], // Domingo
};

export default function GerenciarHorarios({ userId }: { userId: string }) {
    const [initialSchedule, setInitialSchedule] = useState<Schedule>({});
    const [currentSchedule, setCurrentSchedule] = useState<Schedule>({});
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const groupSlotsByDay = (slots: { dia_semana: number; hora_inicio: string }[]): Schedule => {
        const grouped: Schedule = { 0:[], 1:[], 2:[], 3:[], 4:[], 5:[], 6:[] };
        slots.forEach(slot => {
            const hora = slot.hora_inicio.substring(0, 5);
            if (!grouped[slot.dia_semana]) {
                grouped[slot.dia_semana] = [];
            }
            grouped[slot.dia_semana].push(hora);
        });
        return grouped;
    };

    useEffect(() => {
        const fetchHorarios = async () => {
            const { data, error } = await supabase
                .from('slots_trabalho')
                .select('dia_semana, hora_inicio')
                .eq('barbeiro_id', userId);

            if (error) {
                console.error("Erro ao buscar horários:", error);
            } else if (data && data.length > 0) {
                const schedule = groupSlotsByDay(data);
                setInitialSchedule(schedule);
                setCurrentSchedule(schedule);
            } else {
                // Se for um novo funcionário sem horário, aplica o padrão
                setInitialSchedule(defaultSchedule);
                setCurrentSchedule(defaultSchedule);
            }
            setLoading(false);
        };
        fetchHorarios();
    }, [userId]);

    // Verifica se houve mudanças para ativar/desativar o botão Salvar
    useEffect(() => {
        setHasChanges(!isEqual(initialSchedule, currentSchedule));
    }, [currentSchedule, initialSchedule]);


    const handleCheckboxChange = (dia: number, hora: string) => {
        const newSchedule = { ...currentSchedule };
        if (!newSchedule[dia]) {
            newSchedule[dia] = [];
        }

        const horariosDoDia = new Set(newSchedule[dia]);
        if (horariosDoDia.has(hora)) {
            horariosDoDia.delete(hora);
        } else {
            horariosDoDia.add(hora);
        }
        newSchedule[dia] = Array.from(horariosDoDia).sort();
        setCurrentSchedule(newSchedule);
    };

    const handleSalvarHorarios = async () => {
        setIsSaving(true);

        // 1. Deleta todos os slots antigos deste barbeiro
        const { error: deleteError } = await supabase.from('slots_trabalho').delete().eq('barbeiro_id', userId);
        if (deleteError) {
            alert("Erro ao limpar horários antigos: " + deleteError.message);
            setIsSaving(false);
            return;
        }

        // 2. Prepara os novos slots para inserir
        const novosSlots = Object.entries(currentSchedule).flatMap(([dia, horas]) => 
            horas.map(hora => ({
                barbeiro_id: userId,
                dia_semana: parseInt(dia),
                hora_inicio: hora,
            }))
        );

        // 3. Insere os novos slots
        if (novosSlots.length > 0) {
            const { error: insertError } = await supabase.from('slots_trabalho').insert(novosSlots);
            if (insertError) {
                alert("Erro ao salvar novos horários: " + insertError.message);
            } else {
                alert("Horários salvos com sucesso!");
                setInitialSchedule(currentSchedule); // Atualiza o estado inicial para o novo estado salvo
            }
        } else {
            alert("Horários salvos com sucesso! (Todos os horários foram removidos)");
            setInitialSchedule(currentSchedule);
        }

        setIsSaving(false);
    };


    if (loading) return <div className="rounded-lg bg-white p-6 shadow-md"><p>Carregando horários...</p></div>;

    return (
        <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Meus Horários de Trabalho</h3>
                <button
                    onClick={handleSalvarHorarios}
                    disabled={!hasChanges || isSaving}
                    className="rounded-lg bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-center border-collapse">
                    <thead>
                        <tr>
                            <th className="border p-2 bg-gray-50">Hora</th>
                            {diasDaSemana.map(dia => <th key={dia.id} className="border p-2 bg-gray-50">{dia.nome}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {faixasDeHorario.map(hora => (
                            <tr key={hora}>
                                <td className="border p-2 font-mono">{hora}</td>
                                {diasDaSemana.map(dia => (
                                    <td key={`${dia.id}-${hora}`} className="border p-2">
                                        <input
                                            type="checkbox"
                                            className="h-5 w-5 cursor-pointer accent-blue-600"
                                            checked={currentSchedule[dia.id]?.includes(hora) || false}
                                            onChange={() => handleCheckboxChange(dia.id, hora)}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}