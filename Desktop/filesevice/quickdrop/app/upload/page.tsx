"use client";

import { useState, useRef } from "react";
import { UploadCloud, File, X, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function UploadPage() {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (targetFile: File) => {
    setFile(targetFile);
    setStatus("uploading");

    const formData = new FormData();
    formData.append("file", targetFile);

    try {
      // Simulate network delay for "cool" progress look
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) setStatus("success");
    } catch (error) {
      console.error(error);
      setStatus("idle");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleUpload(droppedFile);
  };

  const reset = () => {
    setFile(null);
    setStatus("idle");
  };

  return (
    <div className="max-w-[800px] mx-auto mt-24 px-6 text-[#e6edf3]">
      {/* Header Detail */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Upload Assets</h1>
        <p className="text-[#8b949e] font-mono text-sm uppercase tracking-widest">
          Secure Cloud Storage // v1.0
        </p>
      </div>

      <motion.div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`
          relative overflow-hidden border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300
          ${dragging ? "border-blue-500 bg-blue-500/5 scale-[1.01]" : "border-[#30363d] bg-[#0d1117]"}
          ${status !== "idle" ? "border-solid" : ""}
        `}
      >
        <AnimatePresence mode="wait">
          {status === "idle" ? (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="w-20 h-20 bg-[#161b22] border border-[#30363d] rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
                <UploadCloud size={32} className={dragging ? "text-blue-500" : "text-[#8b949e]"} />
              </div>

              <h2 className="text-xl font-bold mb-2">Push to Repository</h2>
              <p className="text-[#8b949e] mb-8 text-sm">
                Drag and drop your asset here, or <span className="text-blue-400 hover:underline cursor-pointer" onClick={() => fileInputRef.current?.click()}>browse</span>
              </p>

              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#238636] hover:bg-[#2ea043] text-white px-8 py-2.5 rounded-md text-sm font-bold transition-all shadow-sm"
              >
                Select File
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="active"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              {/* File Info Card */}
              <div className="w-full max-w-sm bg-[#161b22] border border-[#30363d] p-4 rounded-xl flex items-center gap-4 mb-8">
                <div className="p-3 bg-[#0d1117] rounded-lg text-blue-400">
                  <File size={24} />
                </div>
                <div className="text-left overflow-hidden flex-1">
                  <p className="text-sm font-bold truncate">{file?.name}</p>
                  <p className="text-xs text-[#8b949e] font-mono">
                    {(file!.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                {status === "success" && <CheckCircle2 className="text-[#3fb950]" size={20} />}
              </div>

              {/* Progress / Status Button */}
              {status === "uploading" ? (
                <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                  <div className="w-full h-1.5 bg-[#30363d] rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-blue-500"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.5 }}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#8b949e] font-mono animate-pulse">
                    <Loader2 size={14} className="animate-spin" />
                    UPLOADING_ASSET...
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-[#3fb950] font-bold text-lg flex items-center justify-center gap-2">
                    Successfully Pushed! 🚀
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button onClick={reset} className="px-5 py-2 bg-[#30363d] hover:bg-[#3c444d] rounded-md text-xs font-bold transition-colors">
                      UPLOAD ANOTHER
                    </button>
                    <Link href="/dashboard" className="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-xs font-bold transition-colors">
                      GO TO DASHBOARD
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer Info */}
      <div className="mt-12 grid grid-cols-3 gap-6 text-center border-t border-[#30363d] pt-8">
        <div>
          <p className="text-[#8b949e] text-[10px] font-bold uppercase mb-1">Max Size</p>
          <p className="text-sm font-mono text-white">50MB</p>
        </div>
        <div>
          <p className="text-[#8b949e] text-[10px] font-bold uppercase mb-1">Privacy</p>
          <p className="text-sm font-mono text-white">Encrypted</p>
        </div>
        <div>
          <p className="text-[#8b949e] text-[10px] font-bold uppercase mb-1">Type</p>
          <p className="text-sm font-mono text-white">Any Extension</p>
        </div>
      </div>
    </div>
  );
}