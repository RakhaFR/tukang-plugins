'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Folder, File, Download, ArrowLeft, Loader2, ChevronRight, Home } from 'lucide-react';

interface DriveItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  webViewLink: string;
}

export default function PluginsDashboard() {
  const [subFolders, setSubFolders] = useState<DriveItem[]>([]);
  const [files, setFiles] = useState<DriveItem[]>([]);
  const [folderHistory, setFolderHistory] = useState<{ id: string; name: string }[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch data berdasarkan folderId aktif
  const fetchFolderContent = (id: string = '') => {
    setLoading(true);
    const url = id ? `/api/drive?folderId=${id}` : '/api/drive';
    
    fetch(url)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setSubFolders(resData.data.subFolders || []);
          setFiles(resData.data.files || []);
          setCurrentFolderId(resData.data.currentFolderId);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFolderContent();
  }, []);

  // Masuk ke dalam sub-folder
  const handleFolderClick = (folder: DriveItem) => {
    setFolderHistory([...folderHistory, { id: currentFolderId, name: folder.name }]);
    fetchFolderContent(folder.id);
  };

  // Navigasi Back / Breadcrumb
  const handleBackClick = () => {
    const newHistory = [...folderHistory];
    const previousFolder = newHistory.pop();
    setFolderHistory(newHistory);
    fetchFolderContent(previousFolder ? previousFolder.id : '');
  };

  // Format ukuran file agar lebih manusiawi
  const formatBytes = (bytes?: string) => {
    if (!bytes) return '---';
    const num = parseInt(bytes, 10);
    if (num === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(num) / Math.log(k));
    return parseFloat((num / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Filter pencarian untuk folder & file sekaligus
  const filteredFolders = subFolders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#0d0f14] text-gray-200 antialiased font-sans flex">
      
      {/* Mini Sidebar Minimalis */}
      <aside className="w-64 bg-[#121620] border-r border-gray-800 hidden md:flex flex-col p-6 justify-between shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="font-bold tracking-wider text-white text-lg">TUKANG PLUGIN</span>
          </div>
          <nav className="space-y-1">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all text-sm font-medium">
              <Home size={18} /> Home About
            </Link>
            <button onClick={() => fetchFolderContent('')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sky-400 bg-sky-500/10 text-sm font-medium border border-sky-500/20">
              <Folder size={18} /> Root Repository
            </button>
          </nav>
        </div>
        <div className="text-xs text-gray-600 px-2">TheoTown Engine Core © 2026</div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        
        {/* Top Bar Action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-8 bg-[#121620] p-4 rounded-2xl border border-gray-800">
          
          {/* Breadcrumbs Navigation */}
          <div className="flex items-center gap-2 text-sm">
            {folderHistory.length > 0 && (
              <button onClick={handleBackClick} className="flex items-center gap-1.5 text-gray-400 hover:text-white bg-gray-800 px-3 py-1.5 rounded-lg mr-2 text-xs font-semibold transition-all">
                <ArrowLeft size={14} /> Back
              </button>
            )}
            <span className="text-gray-500 font-medium">root</span>
            {folderHistory.map((hist, index) => (
              <div key={index} className="flex items-center gap-2">
                <ChevronRight size={14} className="text-gray-600" />
                <span className="text-sky-400 font-medium max-w-[120px] truncate">{hist.name}</span>
              </div>
            ))}
          </div>

          {/* Clean Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search plugins or assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#181d2a] border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-sky-500/50 transition-all placeholder:text-gray-600"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="animate-spin text-sky-500" size={36} />
            <p className="text-gray-500 text-sm tracking-wide">Syncing with Google Drive Vault...</p>
          </div>
        )}

        {/* Loaded Content */}
        {!loading && (
          <div className="space-y-10">
            
            {/* SECTION 1: SUB FOLDERS */}
            {filteredFolders.length > 0 && (
              <div>
                <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4 px-1">Sub Folders ({filteredFolders.length})</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFolders.map((folder) => (
                    <div
                      key={folder.id}
                      onClick={() => handleFolderClick(folder)}
                      className="bg-[#121620] border border-gray-800/80 rounded-xl p-5 flex items-center justify-between cursor-pointer hover:border-sky-500/40 hover:bg-[#151a27] transition-all group shadow-sm"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="p-3 bg-sky-500/5 text-sky-400 rounded-xl group-hover:bg-sky-500 group-hover:text-white transition-all shrink-0">
                          <Folder size={20} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-200 group-hover:text-white text-sm md:text-base truncate">{folder.name}</h3>
                          <span className="text-xs text-gray-500 block mt-0.5">Directory folder</span>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-gray-600 group-hover:text-sky-400 transition-colors ml-2 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 2: INDIVIDUAL FILES FOR DOWNLOAD */}
            {filteredFiles.length > 0 && (
              <div>
                <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4 px-1">Files Available ({filteredFiles.length})</h2>
                <div className="bg-[#121620] border border-gray-800 rounded-xl overflow-hidden shadow-md">
                  <div className="divide-y divide-gray-800/60">
                    {filteredFiles.map((file) => (
                      <div 
                        key={file.id} 
                        className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#161c29] transition-all group"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="p-2.5 bg-red-500/5 text-red-400 rounded-lg shrink-0">
                            <File size={18} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-medium text-gray-200 group-hover:text-white text-sm truncate">{file.name}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-gray-500">{formatBytes(file.size)}</span>
                              <span className="w-1 h-1 rounded-full bg-gray-700" />
                              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                                <Download size={10} /> 340+ downloads
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* TOMBOL DOWNLOAD PER ITEM LANGSUNG */}
                        <a 
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="self-end sm:self-center flex items-center gap-2 bg-[#1c2333] hover:bg-sky-500 hover:text-white border border-gray-800 group-hover:border-transparent text-gray-300 font-semibold text-xs px-4 py-2 rounded-lg transition-all shadow-sm"
                        >
                          <Download size={14} /> Download File
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredFolders.length === 0 && filteredFiles.length === 0 && (
              <div className="text-center py-24 border border-dashed border-gray-800 rounded-2xl bg-[#121620]/30">
                <p className="text-gray-600 text-sm">Folder ini kosong atau pencarian "{searchQuery}" tidak ditemukan.</p>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}