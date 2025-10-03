// src/app/agendar/horarios/[barbeiroId]/[servicoId]/page.tsx
'use client'
// Esta é uma implementação simplificada para os próximos 7 dias.
// Lógicas mais complexas podem ser adicionadas.

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EscolherHorarioPage({ params }: { params: { barbeiroId: string, servicoId: string } }) {
    const [diasDisponiveis, setDiasDisponiveis] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState(true);
    const [diaSelecionado, setDiaSelecionado] = useState('');
    const [horarioSelecionado, setHorarioSelecionado] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const gerarHorarios = async () => {
            const { data: servico, error: errServico } = await supabase.from('servicos').select('duracao_minutos').eq('id', params.servicoId).single();
            const { data: horariosTrabalho, error: errHorarios } = await supabase.from('horarios_trabalho').select('*').eq('barbeiro_id', params.barbeiroId);

            if (errServico || errHorarios || !servico || !horariosTrabalho) {
                alert("Não foi possível carregar a agenda.");
                setLoading(false);
                return;
            }

            const { data: agendamentos } = await supabase.from('agendamentos').select('data_hora').eq('barbeiro_id', params.barbeiroId);
            const horariosOcupados = agendamentos?.map(a => new Date(a.data_hora).getTime()) || [];

            const slotsDisponiveis: Record<string, string[]> = {};
            for (let i = 0; i < 7; i++) { // Gera para os próximos 7 dias
                const dataAtual = new Date();
                dataAtual.setDate(dataAtual.getDate() + i);
                const diaSemana = dataAtual.getDay();
                const dataISO = dataAtual.toISOString().split('T')[0];

                const horarioDoDia = horariosTrabalho.find(h => h.dia_semana === diaSemana);
                if (!horarioDoDia) continue;

                slotsDisponiveis[dataISO] = [];
                const [startH, startM] = horarioDoDia.hora_inicio.split(':').map(Number);
                const [endH, endM] = horarioDoDia.hora_fim.split(':').map(Number);

                let slotAtual = new Date(dataISO);
                slotAtual.setUTCHours(startH, startM, 0, 0);

                const fimDoDia = new Date(dataISO);
                fimDoDia.setUTCHours(endH, endM, 0, 0);

                while (slotAtual.getTime() < fimDoDia.getTime()) {
                    if (!horariosOcupados.includes(slotAtual.getTime())) {
                        slotsDisponiveis[dataISO].push(slotAtual.toTimeString().substring(0, 5));
                    }
                    slotAtual.setMinutes(slotAtual.getMinutes() + servico.duracao_minutos);
                }
            }
            setDiasDisponiveis(slotsDisponiveis);
            setLoading(false);
        };

        gerarHorarios();
    }, [params.barbeiroId, params.servicoId]);

    const handleConfirmarAgendamento = async () => {
        if (!diaSelecionado || !horarioSelecionado) {
            alert("Por favor, selecione um dia e um horário.");
            return;
        }
        setIsSubmitting(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert("Você precisa estar logado para agendar.");
            router.push('/login');
            return;
        }

        const [hora, minuto] = horarioSelecionado.split(':').map(Number);
        const dataHoraAgendamento = new Date(diaSelecionado);
        dataHoraAgendamento.setUTCHours(hora, minuto, 0, 0);

        const { error } = await supabase.from('agendamentos').insert({
            cliente_id: user.id,
            barbeiro_id: params.barbeiroId,
            servico_id: params.servicoId,
            data_hora: dataHoraAgendamento.toISOString(),
        });

        if (error) {
            alert("Erro ao criar agendamento: " + error.message);
        } else {
            alert("Agendamento realizado com sucesso!");
            router.push('/cliente/dashboard');
        }
        setIsSubmitting(false);
    };

    return (
         <div className="flex min-h-screen flex-col items-center bg-gray-100 p-8 text-gray-800">
            <div className="w-full max-w-2xl">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-800">Agendar Horário</h1>
                    <p className="mt-2 text-lg text-gray-600">Passo 3: Escolha a data e o horário</p>
                </header>
                <main className="rounded-lg bg-white p-8 shadow-lg">
                    {loading ? <p>Calculando horários disponíveis...</p> : (
                        <div className="space-y-6">
                            <div>
                                <label className="font-medium">Escolha o dia:</label>
                                <select onChange={(e) => setDiaSelecionado(e.target.value)} className="w-full mt-2 p-2 border rounded-md">
                                    <option value="">Selecione uma data</option>
                                    {Object.keys(diasDisponiveis).map(dia => (
                                        <option key={dia} value={dia}>{new Date(dia + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })}</option>
                                    ))}
                                </select>
                            </div>

                            {diaSelecionado && (
                                <div>
                                    <label className="font-medium">Horários disponíveis:</label>
                                    <div className="grid grid-cols-4 gap-2 mt-2">
                                        {diasDisponiveis[diaSelecionado]?.length > 0 ? diasDisponiveis[diaSelecionado].map(hora => (
                                            <button key={hora} onClick={() => setHorarioSelecionado(hora)} className={`p-2 rounded-md text-center ${horarioSelecionado === hora ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                                                {hora}
                                            </button>
                                        )) : <p>Nenhum horário disponível para este dia.</p>}
                                    </div>
                                </div>
                            )}

                            <button onClick={handleConfirmarAgendamento} disabled={!horarioSelecionado || isSubmitting} className="w-full rounded-lg bg-green-600 py-3 text-white transition hover:bg-green-700 disabled:bg-green-400">
                                {isSubmitting ? 'Agendando...' : 'Confirmar Agendamento'}
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}