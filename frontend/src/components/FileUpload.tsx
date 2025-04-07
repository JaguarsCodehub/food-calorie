import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onPreviewChange: (preview: string | null) => void;
}

export default function FileUpload({
  onFileSelect,
  onPreviewChange,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        onFileSelect(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          onPreviewChange(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [onFileSelect, onPreviewChange]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    multiple: false,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
  });

  return (
    <div
      {...getRootProps()}
      className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ease-in-out
        ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
        }`}
    >
      <input {...getInputProps()} />
      <div className='space-y-4'>
        <div className='flex justify-center'>
          <svg
            className={`w-12 h-12 ${
              isDragging ? 'text-indigo-500' : 'text-gray-400'
            }`}
            stroke='currentColor'
            fill='none'
            viewBox='0 0 48 48'
            aria-hidden='true'
          >
            <path
              d='M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02'
              strokeWidth={2}
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </div>
        <div className='text-gray-600'>
          <span className='font-medium text-indigo-600'>Click to upload</span>{' '}
          or drag and drop
        </div>
        <p className='text-xs text-gray-500'>PNG, JPG, JPEG up to 10MB</p>
      </div>
    </div>
  );
}
