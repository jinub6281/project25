"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, Download, Trash2, Search, 
  ChevronRight, HardDrive, File, Info, Plus, Loader2
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type FileType = { name: string; size: number };

export default function Dashboard() {
  const { data: session } = useSession();
  const [files, setFiles] = useState<FileType[]>([]);
  const [search, setSearch] = useState("");
  const [confirmFile, setConfirmFile] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- 1. 관리자 권한 체크 (클라이언트 사이드) ---
  const isAdmin = useMemo(() => {
    const adminList = ["jinub6281@gmail.com", "second-jinyp2020@gmail.com"];
    return !!(session?.user?.email && adminList.includes(session.user.email));
  }, [session]);

  // --- 2. ESC 키 닫기 및 스크롤 방지 로직 ---
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && confirmFile && !isDeleting) {
        setConfirmFile(null);
      }
    };

    if (confirmFile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [confirmFile, isDeleting]);

  // --- 3. 데이터 페칭 ---
  const fetchFiles = async () => {
    try {
      const res = await fetch("/api/files");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      console.error("An error occurred while attempting to retrieve the file:", err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // --- 4. 삭제 핸들러 ---
  const handleDelete = async (filename: string) => {
    if (!isAdmin) {
      alert("You do not have the necessary permissions to perform this deletion.");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/delete?filename=${encodeURIComponent(filename)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.name !== filename));
        setConfirmFile(null);
      } else {
        const text = await res.text();
        let errorMsg = "Failed to delete the file.";
        try {
          const json = JSON.parse(text);
          errorMsg = json.error || errorMsg;
        } catch (e) {}
        alert(`에러: ${errorMsg} status: ${res.status})`);
      }
    } catch (error) {
      alert("A network connection error has occurred.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredFiles = useMemo(() => 
    files.filter(f => f.name.toLowerCase().includes(search.toLowerCase())), 
  [files, search]);

  const totalSizeInMB = (files.reduce((a, b) => a + b.size, 0) / 1024 / 1024).toFixed(2);

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10 text-[#e6edf3]">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <nav className="flex items-center gap-2 text-[13px] text-[#8b949e] mb-2 font-mono">
            <span className="hover:text-blue-400 cursor-pointer transition-colors font-semibold">QuickDrop</span>
            <ChevronRight size={14} className="opacity-50" />
            <span className="text-[#e6edf3]">Assets</span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight">Repository Drive</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e] group-focus-within:text-blue-500 transition-colors" size={15} />
            <input 
              type="text"
              placeholder="Find a file..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#0d1117] border border-[#30363d] rounded-md py-1.5 pl-9 pr-4 text-sm w-full md:w-64 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-[#484f58]"
            />
          </div>
          <Link href="/upload" className="flex items-center gap-1.5 bg-[#238636] hover:bg-[#2ea043] text-white px-4 py-1.5 rounded-md text-sm font-semibold transition-colors shadow-sm">
            <Plus size={16} />
            Upload
          </Link>
        </div>
      </header>

      {/* Stats Summary */}
      <div className="flex flex-wrap gap-5 mb-6 text-[13px] text-[#8b949e] px-1">
        <div className="flex items-center gap-2">
          <HardDrive size={16} />
          <span className="font-mono text-[#e6edf3]">{totalSizeInMB} MB</span>
          <span>Storage Used</span>
        </div>
        <div className="flex items-center gap-2 border-l border-[#30363d] pl-5">
          <File size={16} />
          <span className="font-mono text-[#e6edf3]">{files.length}</span>
          <span>Total Items</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#0d1117] border border-[#30363d] rounded-lg shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-[#161b22] border-b border-[#30363d] text-[12px] font-semibold text-[#8b949e] uppercase tracking-wider">
          <div className="col-span-8 md:col-span-9">Asset Name</div>
          <div className="col-span-4 md:col-span-3 text-right">Size</div>
        </div>

        <div className="divide-y divide-[#30363d]">
          <AnimatePresence mode="popLayout">
            {filteredFiles.map((file) => (
              <motion.div
                key={file.name}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -10 }}
                className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-[#161b22]/70 transition-colors group relative"
              >
                <div className="col-span-8 md:col-span-9 flex items-center gap-3 min-w-0">
                  <FileText className="text-[#8b949e] group-hover:text-blue-400 transition-colors" size={18} />
                  <a href={`/uploads/${file.name}`} target="_blank" className="text-[14px] font-medium text-[#4493f8] hover:underline truncate">
                    {file.name}
                  </a>
                </div>

                <div className="col-span-4 md:col-span-3 flex justify-end items-center gap-3">
                  <span className="text-[13px] font-mono text-[#8b949e] group-hover:hidden transition-all">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                  
                  <div className="hidden group-hover:flex items-center gap-1 scale-95 origin-right">
                    <a href={`/uploads/${file.name}`} download className="p-1.5 hover:bg-[#30363d] rounded-md text-[#8b949e] hover:text-[#e6edf3] transition-colors">
                      <Download size={16} />
                    </a>
                    {/* 관리자일 때만 삭제 버튼 노출 */}
                    {isAdmin && (
                      <button 
                        onClick={() => setConfirmFile(file.name)}
                        className="p-1.5 hover:bg-red-500/10 rounded-md text-[#8b949e] hover:text-[#f85149] transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredFiles.length === 0 && (
            <div className="py-24 text-center flex flex-col items-center gap-3">
              <Info size={32} className="text-[#30363d]" />
              <p className="text-[#8b949e] text-sm font-medium">No assets found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setConfirmFile(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-[2px]" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative bg-[#161b22] border border-[#30363d] rounded-xl p-8 w-full max-w-[420px] shadow-2xl"
            >
              <h3 className="text-xl font-bold mb-3 text-[#f85149] flex items-center gap-2">
                <Trash2 size={20} />
                Delete Asset?
              </h3>
              <p className="text-[#8b949e] text-[14px] mb-8 leading-relaxed">
                <span className="text-[#e6edf3] font-mono font-bold break-all">"{confirmFile}"</span> Are you sure you want to permanently delete this file?
              </p>
              <div className="flex flex-col gap-2">
                <button 
                  disabled={isDeleting}
                  onClick={() => handleDelete(confirmFile)}
                  className="w-full py-2.5 rounded-md text-sm bg-[#b62324] hover:bg-[#d03537] text-white font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? <><Loader2 size={16} className="animate-spin" /> DELETING...</> : "CONFIRM DELETE"}
                </button>
                <button 
                  disabled={isDeleting}
                  onClick={() => setConfirmFile(null)}
                  className="w-full py-2.5 rounded-md text-sm font-semibold bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] text-[#8b949e] transition-all"
                >
                  CANCEL
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}