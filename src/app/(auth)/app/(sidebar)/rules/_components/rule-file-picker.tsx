'use client';

import React, { useRef } from 'react';
import { FileUp, X, Trash2 } from 'lucide-react';
import { formatBytes, getFileVisualInfo } from '@/app/(auth)/app/(sidebar)/documents/_utils/doc-helpers';

interface RuleFilePickerProps {
  files: File[];
  existingFileName?: string;
  isRequired?: boolean;
  error?: string | null;
  onChange: (files: File[]) => void;
}

export const RuleFilePicker: React.FC<RuleFilePickerProps> = ({
  files,
  existingFileName,
  isRequired,
  error,
  onChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files || []);
    if (dropped.length > 0) {
      const existingKeys = new Set(files.map((f) => `${f.name}-${f.size}`));
      const uniqueNew = dropped.filter((f) => !existingKeys.has(`${f.name}-${f.size}`));
      onChange([...files, ...uniqueNew]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length > 0) {
      const existingKeys = new Set(files.map((f) => `${f.name}-${f.size}`));
      const uniqueNew = selected.filter((f) => !existingKeys.has(`${f.name}-${f.size}`));
      onChange([...files, ...uniqueNew]);
    }
    e.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    onChange(updated);
  };

  const totalBytes = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div>
      <label className="text-xs font-semibold text-gray-700 select-none block mb-1.5">
        Tệp văn bản (PDF, DOCX, XLSX...) {isRequired && <span className="text-rose-500">*</span>}
        <span className="text-[11px] font-normal text-slate-400 ml-2">
          (Giữ <kbd className="px-1 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-[10px] text-slate-700">Ctrl</kbd> để chọn nhiều tệp)
        </span>
      </label>

      {/* Input hỗ trợ multiple để người dùng giữ phím Ctrl chọn nhiều file */}
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleInputChange}
      />

      {files.length === 0 ? (
        /* Chưa chọn file */
        <div
          id="rule-file-dropzone"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer bg-slate-50/50 hover:bg-slate-50 flex flex-col items-center gap-1.5 transition-colors ${
            error ? 'border-red-400' : 'border-slate-300 hover:border-primary/60'
          }`}
        >
          <FileUp size={22} className="text-primary" />
          <p className="text-xs font-semibold text-slate-700">
            Nhấp để chọn tệp (hoặc giữ <kbd className="font-mono text-slate-600 bg-slate-200 px-1 py-0.5 rounded text-[10px]">Ctrl</kbd> chọn nhiều tệp)
          </p>
          {existingFileName ? (
            <p className="text-[11px] text-slate-400">Hiện tại: {existingFileName} (chọn tệp mới để thay thế)</p>
          ) : (
            <p className="text-[11px] text-slate-400">Kéo thả 1 hoặc nhiều tệp văn bản vào đây</p>
          )}
        </div>
      ) : files.length === 1 ? (
        /* Chọn 1 file */
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">{getFileVisualInfo(files[0].name).icon}</div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-800 truncate text-xs">{files[0].name}</p>
              <p className="text-[10px] text-slate-400">{formatBytes(files[0].size)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs text-primary hover:underline cursor-pointer font-medium"
            >
              + Chọn thêm tệp
            </button>
            <button
              type="button"
              onClick={() => onChange([])}
              className="p-1 rounded-full text-slate-400 hover:text-rose-500 hover:bg-slate-200/60 cursor-pointer"
              title="Hủy chọn"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        /* Giữ Ctrl chọn nhiều file */
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-slate-50 border border-primary/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-semibold text-slate-800 text-xs">
                Đã chọn {files.length} tệp tin
              </span>
              <span className="text-[11px] text-slate-400">({formatBytes(totalBytes)})</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-xs text-primary hover:underline cursor-pointer font-medium"
              >
                Chọn thêm
              </button>
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs text-rose-500 hover:underline cursor-pointer"
              >
                Xóa tất cả
              </button>
            </div>
          </div>

          {/* Danh sách tệp cuộn gọn gàng */}
          <div className="max-h-32 overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-100 bg-white">
            {files.map((f, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="shrink-0">{getFileVisualInfo(f.name).icon}</div>
                  <div className="truncate">
                    <p className="font-medium text-slate-800 truncate text-xs">{f.name}</p>
                    <p className="text-[10px] text-slate-400">{formatBytes(f.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(idx)}
                  className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                  title="Xóa tệp này"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <span className="text-xs text-red-500 mt-1 block">{error}</span>}
    </div>
  );
};
