// src/components/barbeiro/GerenciarAvatar.tsx
'use client'

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState, useRef } from "react";
import Image from 'next/image';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export default function GerenciarAvatar({ userId }: { userId: string }) {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    
    // Estados para o modal de corte
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imgSrc, setImgSrc] = useState('');
    const [crop, setCrop] = useState<Crop>();
    const imgRef = useRef<HTMLImageElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const fetchAvatar = async () => {
            const { data } = await supabase.from('perfis').select('avatar_url').eq('id', userId).single();
            if (data?.avatar_url) setAvatarUrl(data.avatar_url);
        };
        fetchAvatar();
    }, [userId]);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () => setImgSrc(String(reader.result)));
            reader.readAsDataURL(e.target.files[0]);
            setIsModalOpen(true);
            // Limpa o input para permitir o upload da mesma imagem novamente
            e.target.value = "";
        }
    };

    const getCroppedImgBlob = (): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const image = imgRef.current;
            const canvas = canvasRef.current;
            if (!image || !canvas || !crop) {
                reject(new Error('Elementos de corte não estão prontos.'));
                return;
            }

            const scaleX = image.naturalWidth / image.width;
            const scaleY = image.naturalHeight / image.height;
            canvas.width = crop.width * scaleX;
            canvas.height = crop.height * scaleY;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Não foi possível obter o contexto 2D do canvas.'));
                return;
            }

            ctx.drawImage(
                image,
                crop.x * scaleX,
                crop.y * scaleY,
                crop.width * scaleX,
                crop.height * scaleY,
                0, 0,
                canvas.width,
                canvas.height
            );

            canvas.toBlob(blob => {
                if (!blob) {
                    reject(new Error('Falha ao criar o blob da imagem cortada.'));
                    return;
                }
                resolve(blob);
            }, 'image/jpeg', 0.95);
        });
    };

    const handleUploadCroppedImage = async () => {
        try {
            setUploading(true);
            setIsModalOpen(false);
            
            const croppedImageBlob = await getCroppedImgBlob();
            const filePath = `${userId}-${Date.now()}.jpeg`;

            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, croppedImageBlob);
            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            const newAvatarUrl = data.publicUrl;

            const { error: updateError } = await supabase.from('perfis').update({ avatar_url: newAvatarUrl }).eq('id', userId);
            if (updateError) throw updateError;
            
            setAvatarUrl(newAvatarUrl);

        } catch (error) {
            alert('Erro ao enviar a imagem: ' + (error as Error).message);
        } finally {
            setUploading(false);
            setImgSrc('');
        }
    };

    return (
        <>
            <div className="rounded-lg bg-white p-6 shadow-md">
                <h3 className="mb-4 text-xl font-semibold text-gray-800">Foto de Perfil</h3>
                <div className="flex items-center gap-4">
                    {avatarUrl ? (
                        <Image src={avatarUrl} alt="Avatar" width={80} height={80} className="rounded-full object-cover"/>
                    ) : (
                        <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                            Sem foto
                        </div>
                    )}
                    <div>
                        <label htmlFor="avatar-upload" className="cursor-pointer rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-300">
                            {uploading ? 'Enviando...' : 'Trocar Foto'}
                        </label>
                        <input id="avatar-upload" type="file" accept="image/*" onChange={onFileChange} disabled={uploading} className="hidden" />
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 shadow-2xl w-full max-w-lg">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Ajustar Imagem</h2>
                        {imgSrc && (
                            <ReactCrop
                                crop={crop}
                                onChange={c => setCrop(c)}
                                aspect={1} // Força um corte quadrado/circular
                                circularCrop // Mostra a guia de corte como um círculo
                            >
                                <img ref={imgRef} src={imgSrc} alt="Imagem para cortar" style={{ maxHeight: '70vh' }}/>
                            </ReactCrop>
                        )}
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                        <div className="flex justify-end gap-4 mt-4">
                            <button onClick={() => setIsModalOpen(false)} className="rounded-lg bg-gray-200 px-6 py-2 text-gray-800 transition hover:bg-gray-300">Cancelar</button>
                            <button onClick={handleUploadCroppedImage} className="rounded-lg bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700">Confirmar e Salvar</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}