'use client';

import { useRef, useState } from 'react';
import { Paperclip } from 'lucide-react';
import { api } from '@/lib/api';

interface FileAttachment {
  url: string;
  publicId: string;
  resourceType: string;
  format: string;
  size: number;
  fileName: string;
  mimeType: string;
  width?: number;
  height?: number;
  duration?: number;
}

interface FileUploadProps {
  onFilesSelected: (files: FileAttachment[]) => void;
  disabled?: boolean;
}

export function FileUpload({ onFilesSelected, disabled }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedFiles: FileAttachment[] = [];

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        uploadedFiles.push(response.data);
      }

      onFilesSelected(uploadedFiles);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,.pdf,.doc,.docx,.txt"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || uploading}
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        title={uploading ? 'Uploading...' : 'Attach file'}
      >
        <Paperclip className={`w-5 h-5 ${uploading ? 'animate-pulse' : ''}`} />
      </button>
    </>
  );
}
