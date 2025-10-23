'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, FileText, Image } from 'lucide-react'
import { useLanguage } from '@/lib/language'

interface FileUploadProps {
  onFileSelect: (file: File | null, url?: string) => void
  acceptedTypes?: string[]
  maxSize?: number // in MB
  className?: string
}

export function FileUpload({ 
  onFileSelect, 
  acceptedTypes = ['.jpg', '.jpeg', '.png', '.pdf'],
  maxSize = 10,
  className = ''
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { language, t } = useLanguage()

  // Dil bazlı içerik
  const content = {
    tr: {
      dragText: 'Nakış tasarımınızı buraya sürükleyin veya',
      selectFile: 'Dosya Seç',
      uploading: 'Yükleniyor...',
      uploadingFile: 'Dosya yükleniyor...',
      supportedFormats: 'Desteklenen formatlar:',
      maxSize: 'Max',
      fileTypeError: 'Sadece',
      fileTypeErrorEnd: 'formatları kabul edilir.',
      fileSizeError: 'Dosya boyutu',
      fileSizeErrorEnd: 'MB\'dan küçük olmalıdır.',
      uploadError: 'Dosya yükleme sırasında bir hata oluştu. Lütfen tekrar deneyin.'
    },
    en: {
      dragText: 'Drag your embroidery design here or',
      selectFile: 'Select File',
      uploading: 'Uploading...',
      uploadingFile: 'Uploading file...',
      supportedFormats: 'Supported formats:',
      maxSize: 'Max',
      fileTypeError: 'Only',
      fileTypeErrorEnd: 'formats are accepted.',
      fileSizeError: 'File size must be smaller than',
      fileSizeErrorEnd: 'MB.',
      uploadError: 'An error occurred while uploading the file. Please try again.'
    }
  }

  const t_content = content[language]

  const handleFileSelect = async (file: File) => {
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!acceptedTypes.includes(fileExtension)) {
      alert(`${t_content.fileTypeError} ${acceptedTypes.join(', ')} ${t_content.fileTypeErrorEnd}`)
      return
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`${t_content.fileSizeError} ${maxSize}${t_content.fileSizeErrorEnd}`)
      return
    }

    setSelectedFile(file)
    setIsUploading(true)

    try {
      // Upload file to server
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Upload API error:', result)
        throw new Error(result.error || 'Upload failed')
      }

      console.log('Upload successful, URL:', result.url)
      setUploadedUrl(result.url)
      onFileSelect(file, result.url)
    } catch (error) {
      console.error('Upload error:', error)
      alert(t_content.uploadError)
      setSelectedFile(null)
      onFileSelect(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setUploadedUrl('')
    onFileSelect(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png'].includes(extension || '')) {
      return <Image className="w-8 h-8 text-blue-500" />
    }
    return <FileText className="w-8 h-8 text-red-500" />
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-300 hover:border-gray-400'
          } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm text-gray-600 mb-2">
            {isUploading ? t_content.uploadingFile : t_content.dragText}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer"
            disabled={isUploading}
          >
            {isUploading ? t_content.uploading : t_content.selectFile}
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            {t_content.supportedFormats} {acceptedTypes.join(', ')} ({t_content.maxSize} {maxSize}MB)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleFileInputChange}
            className="hidden"
            disabled={isUploading}
          />
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getFileIcon(selectedFile.name)}
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
