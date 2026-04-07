'use client';

import { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { ImageModal } from './ImageModal';

interface FileAttachment {
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
}

interface MessageAttachmentsProps {
  attachments: FileAttachment[];
}

export function MessageAttachments({ attachments }: MessageAttachmentsProps) {
  const [selectedImage, setSelectedImage] = useState<{ url: string; fileName: string } | null>(null);

  if (!attachments || attachments.length === 0) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <>
      <div className="mt-2 space-y-2">
        {attachments.map((file, index) => {
          const isImage = file.mimeType.startsWith('image/');
          const isVideo = file.mimeType.startsWith('video/');

          if (isImage) {
            return (
              <div
                key={index}
                onClick={() => setSelectedImage({ url: file.url, fileName: file.fileName })}
                className="cursor-pointer"
              >
                <img
                  src={file.url}
                  alt={file.fileName}
                  className="max-w-sm max-h-64 rounded-lg hover:opacity-90 transition-opacity"
                />
              </div>
            );
          }

          if (isVideo) {
            return (
              <div key={index} className="max-w-sm">
                <video
                  src={file.url}
                  controls
                  className="w-full rounded-lg"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            );
          }

          // Other files (PDF, documents, etc.)
          const isPDF = file.mimeType === 'application/pdf';
          
          // Get file extension from format or mimeType
          const getFileExtension = () => {
            if (file.fileName.includes('.')) {
              return ''; // Already has extension
            }
            if (isPDF) return '.pdf';
            if (file.mimeType === 'application/msword') return '.doc';
            if (file.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return '.docx';
            if (file.mimeType === 'text/plain') return '.txt';
            return '';
          };
          
          const downloadFileName = file.fileName + getFileExtension();
          
          return (
            <div
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                // For PDFs and documents, download with proper extension
                const link = document.createElement('a');
                link.href = file.url;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.download = downloadFileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-400 transition-all max-w-sm cursor-pointer group"
            >
              <div className="p-2 bg-gray-100 rounded group-hover:bg-blue-100 transition-colors">
                <FileText className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">
                  {file.fileName}
                </div>
                <div className="text-xs text-gray-500">
                  {formatFileSize(file.size)} • {isPDF ? 'PDF Document' : 'Document'}
                </div>
              </div>
              <Download className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
            </div>
          );
        })}
      </div>

      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage?.url || ''}
        fileName={selectedImage?.fileName || ''}
      />
    </>
  );
}
