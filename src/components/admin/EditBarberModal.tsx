// src/components/admin/EditBarberModal.tsx
'use client'

import { useState, useEffect } from 'react'

type Barber = {
  id: string
  nome_completo: string | null
}

type EditBarberModalProps = {
  barber: Barber | null
  isOpen: boolean
  onClose: () => void
  onSave: (barber: Barber) => void
}

export default function EditBarberModal({ barber, isOpen, onClose, onSave }: EditBarberModalProps) {
  const [name, setName] = useState('')

  useEffect(() => {
    if (barber) {
      setName(barber.nome_completo || '')
    }
  }, [barber])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!barber) return

    onSave({ ...barber, nome_completo: name })
  }

  if (!isOpen || !barber) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-8 shadow-2xl w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Editar Funcionário</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
            <input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md p-3 text-gray-800 border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg bg-gray-200 px-6 py-2 text-gray-800 transition hover:bg-gray-300">
              Cancelar
            </button>
            <button type="submit" className="rounded-lg bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}