'use client';

import { useCallback } from 'react';

interface ImageUploaderProps {
    onImageLoad: (imageUrl: string) => void;
}

export default function ImageUploader({ onImageLoad }: ImageUploaderProps) {
    const handleFileSelect = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Пожалуйста, выберите изображение');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                onImageLoad(e.target.result as string);
            }
        };
        reader.readAsDataURL(file);
    }, [onImageLoad]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    }, [handleFileSelect]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
    }, []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    }, [handleFileSelect]);

    return (
        <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="upload-zone"
        >
            <div className="upload-content">
                <div className="upload-icon">🖼️</div>
                <h2>Загрузите изображение</h2>
                <p>Перетащите файл сюда или нажмите для выбора</p>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="file-input"
                    id="file-upload"
                />
                <label htmlFor="file-upload" className="upload-button">
                    Выбрать файл
                </label>
            </div>
        </div>
    );
}
