// src/app/admin/relatorios/page.tsx
import Link from 'next/link';

export default function RelatoriosPage() {
    return (
        <div className="p-8">
            <Link href="/admin/dashboard" className="text-blue-600 hover:underline mb-4 block">&larr; Voltar para o Painel</Link>
            <h1 className="text-3xl font-bold">Relatórios</h1>
            <p className="mt-2 text-gray-600">Acompanhe o desempenho da sua barbearia.</p>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="rounded-lg bg-white p-6 shadow-md">
                    <h3 className="text-xl font-semibold text-gray-800">Relatório de Agendamentos</h3>
                    <p className="mt-2 text-gray-500">Visualize todos os cortes, barbeiros, clientes e avaliações.</p>
                    <p className="mt-4 text-lg font-bold text-blue-500">Em construção...</p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-md">
                    <h3 className="text-xl font-semibold text-gray-800">Desempenho dos Funcionários</h3>
                    <p className="mt-2 text-gray-500">Veja a performance individual, média de notas e valores a pagar.</p>
                    <p className="mt-4 text-lg font-bold text-blue-500">Em construção...</p>
                </div>
            </div>
        </div>
    );
}