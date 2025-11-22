import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './Button';
import toast from 'react-hot-toast';

const ImageUpload = ({ value, onChange, maxSize = 5 * 1024 * 1024, disabled = false }) => {
    const [preview, setPreview] = useState(value || '');
    const fileInputRef = useRef(null);

    // Sync preview with external value changes
    useEffect(() => {
        console.log('ImageUpload value changed:', value);
        console.log('Setting preview to:', value || '');
        setPreview(value || '');
    }, [value]);

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        console.log('File selected:', file.name, file.type, file.size);

        // Validate file  type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size
        if (file.size > maxSize) {
            toast.error(`Image size must be less than ${maxSize / 1024 / 1024}MB`);
            return;
        }

        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result;
            console.log('Base64 conversion complete, length:', base64String?.length);
            console.log('Base64 preview:', base64String?.substring(0, 100));
            setPreview(base64String);
            onChange(base64String);
        };
        reader.onerror = () => {
            console.error('FileReader error');
            toast.error('Failed to read image file');
        };
        reader.readAsDataURL(file);
    };

    const handleRemove = () => {
        setPreview('');
        onChange('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageError = () => {
        console.error('Failed to load image');
        toast.error('Failed to load image preview');
    };

    return (
        <div className="space-y-4">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={disabled}
            />

            {preview ? (
                <div className="relative group">
                    {console.log('Rendering preview with src:', preview?.substring(0, 100))}
                    <img
                        src={preview}
                        alt="Preview"
                        onError={handleImageError}
                        onLoad={() => console.log('Image loaded successfully')}
                        style={{ minHeight: '200px', display: 'block' }}
                        className="w-full max-h-96 object-contain rounded-lg border-2 border-slate-200 bg-white"
                    />
                    <div className="absolute top-2 right-2">
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={handleRemove}
                            disabled={disabled}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Remove
                        </Button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={handleClick}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${disabled
                        ? 'border-slate-200 bg-slate-50 cursor-not-allowed'
                        : 'border-slate-300 hover:border-indigo-500 cursor-pointer'
                        }`}
                >
                    <ImageIcon className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                    <p className="text-sm font-medium text-slate-700 mb-1">
                        Click to upload image
                    </p>
                    <p className="text-xs text-slate-500">
                        PNG, JPG, WebP up to {maxSize / 1024 / 1024}MB
                    </p>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
