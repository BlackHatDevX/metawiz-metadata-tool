'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
}

export function FileUploader({ onFileSelect }: FileUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200
        ${isDragActive 
          ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
          : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'}`}
    >
      <input {...getInputProps()} />
      <div className="space-y-4">
        <div className="flex justify-center">
          <svg 
            className={`w-16 h-16 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
            />
          </svg>
        </div>
        <div className="space-y-2">
          <p className="text-xl font-medium text-gray-700">
            {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
          </p>
          <p className="text-sm text-gray-500">
            or click to browse files
          </p>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Supported formats: Images (PNG, JPG, GIF), PDF, DOC, DOCX
        </p>
      </div>
    </div>
  );
} 