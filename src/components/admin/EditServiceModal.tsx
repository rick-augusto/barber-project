// src/components/admin/EditServiceModal.tsx

'use client'

import { useState, useEffect } from 'react'

type Service = {
  id: number
  nome: string
  preco: number
  duracao_minutos: number
  id_barbearia: number
}

type EditServiceModalProps = {
  service: Service | null
  isOpen: boolean
  onClose: () => void
  onSave: (service: Service) => void
}

export default function EditServiceModal({ service, isOpen, onClose, onSave }: EditServiceModalProps) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('')

  // Efeito para preencher o formulário quando um serviço é selecionado para edição
  useEffect(() => {
    if (service) {
      setName(service.nome)
      setPrice(String(service.preco))
      setDuration(String(service.duracao_minutos))
    }
  }, [service])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!service) return

    const updatedService = {
      ...service,
      nome: name,
      preco: parseFloat(price),
      duracao_minutos: parseInt(duration),
    }
    onSave(updatedService)
  }

  // Não renderiza nada se o modal não estiver aberto
  if (!isOpen || !service) return null

  return (
    // Fundo escuro semi-transparente
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      {/* Container do Modal */}
      <div className="bg-white rounded-lg p-8 shadow-2xl w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Editar Serviço</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">Nome do Serviço</label>
            <input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md p-3 text-gray-800 border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700">Preço (R$)</label>
            <input
              id="edit-price"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 w-full rounded-md p-3 text-gray-800 border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="edit-duration" className="block text-sm font-medium text-gray-700">Duração (minutos)</label>
            <input
              id="edit-duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="mt-1 w-full rounded-md p-3 text-gray-800 border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-gray-200 px-6 py-2 text-gray-800 transition hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}