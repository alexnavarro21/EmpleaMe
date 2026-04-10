import { useState, useRef } from "react";
import { Icon } from "@iconify/react";

export default function FileUploader({ title, accept, icon, onFileSelect }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState(null);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (file) {
      setSelectedFileName(file.name);
      if (onFileSelect) onFileSelect(file);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setSelectedFileName(null);
    if (onFileSelect) onFileSelect(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-xl transition-colors cursor-pointer ${
        dragActive 
          ? "border-[#378ADD] bg-[#E6F1FB] dark:bg-[#0F4D8A]/20" 
          : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50"
      }`}
      onClick={() => inputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {selectedFileName ? (
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 mb-1">
            <Icon icon="mdi:check-circle" width={28} />
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-[200px]">
            {selectedFileName}
          </p>
          <button
            onClick={removeFile}
            className="mt-2 text-xs text-red-500 hover:text-red-700 font-medium px-3 py-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Eliminar archivo
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-center text-gray-500 dark:text-gray-400">
          <Icon icon={icon || "mdi:cloud-upload-outline"} width={36} className="mb-1 text-gray-400 dark:text-gray-500" />
          <p className="text-sm font-medium">
            <span className="text-[#378ADD]">Haz clic para subir</span> o arrastra y suelta
          </p>
          <p className="text-xs opacity-70">{title}</p>
        </div>
      )}
    </div>
  );
}