'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Folder, File, Download, ArrowLeft, Loader2, ChevronRight, Home, Star, MapPin, X, Eye } from 'lucide-react';

const DISPLAY = "'Lilita One', cursive";
const BODY = "'DM Sans', sans-serif";
const RED = "#E53935";
const LIME = "#C6E000";

interface DriveItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  webViewLink: string;
  viewLink?: string; // Menyimpan link khusus streaming internal dari backend
  folderPath?: string;
}

export default function PluginsDashboard() {
  const [subFolders, setSubFolders] = useState<DriveItem[]>([]);
  const [files, setFiles] = useState<DriveItem[]>([]);
  const [folderHistory, setFolderHistory] = useState<{ id: string; name: string }[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSearchMode, setIsSearchMode] = useState(false);
  
  // State untuk mengontrol Preview Modal Fullscreen
  const [previewFile, setPreviewFile] = useState<DriveItem | null>(null);

  const fetchFolderContent = (id: string = '', searchWord: string = '') => {
    setLoading(true);
    let url = '/api/drive';
    const params = new URLSearchParams();

    if (searchWord) {
      params.append('search', searchWord);
    } else if (id) {
      params.append('folderId', id);
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    fetch(url)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setSubFolders(resData.data.subFolders || []);
          setFiles(resData.data.files || []);
          setCurrentFolderId(resData.data.currentFolderId);
          setIsSearchMode(resData.data.isSearchMode || false);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim() !== '') {
        fetchFolderContent('', searchQuery);
      } else {
        fetchFolderContent(currentFolderId || '');
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleFolderClick = (folder: DriveItem) => {
    setSearchQuery('');
    setFolderHistory([...folderHistory, { id: currentFolderId, name: folder.name }]);
    fetchFolderContent(folder.id);
  };

  const handleBackClick = () => {
    setSearchQuery('');
    const newHistory = [...folderHistory];
    const previousFolder = newHistory.pop();
    setFolderHistory(newHistory);
    fetchFolderContent(previousFolder ? previousFolder.id : '');
  };

  // Logika ketika user memicu aksi pada card file
  const handleFileAction = (file: DriveItem) => {
    const isImage = file.mimeType.startsWith('image/');
    const isVideo = file.mimeType.startsWith('video/');

    if (isImage || isVideo) {
      // Jika tipe media, pancing modal fullscreen muncul
      setPreviewFile(file);
    } else {
      // Jika file mentah biasa (.zip, .json, dsb), langsung download instan
      window.open(file.webViewLink, '_blank');
    }
  };

  const formatBytes = (bytes?: string) => {
    if (!bytes) return 'Under 1 KB';
    const num = parseInt(bytes, 10);
    if (num === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(num) / Math.log(k));
    return parseFloat((num / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getItemStats = (name: string) => {
    const weight = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const downloads = Math.floor((weight % 60) + 5);
    const rating = (4.2 + ((weight % 8) * 0.1)).toFixed(1);
    return { downloads, rating };
  };

  return (
    <div style={{ fontFamily: BODY, background: "#111", color: "#f5f5f5", minHeight: "100vh", display: "flex" }}>
      
      {/* ── SIDEBAR MINIMALIS ── */}
      <aside style={{
        width: 260, background: "#161616", borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex", flexDirection: "column", padding: 24, justifyContent: "space-between"
      }} className="hidden md:flex shrink-0">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40, padding: "0 8px" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: RED }} className="animate-pulse" />
            <span style={{ fontFamily: DISPLAY, fontSize: "1.3rem", color: "#fff", letterSpacing: "0.04em" }}>
              TukangPlugin
            </span>
          </div>
          
          <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Link href="/" style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
              color: "rgba(255,255,255,0.45)", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500,
              transition: "all 0.15s"
            }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.45)"}>
              <Home size={18} /> Home About
            </Link>
            
            <button 
              onClick={() => { setSearchQuery(''); fetchFolderContent(''); setFolderHistory([]); }}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", width: "100%", textAlign: "left",
                background: "rgba(198, 224, 0, 0.08)", color: LIME, fontSize: "0.875rem", fontWeight: 600,
                border: `1px solid rgba(198, 224, 0, 0.15)`
              }}
            >
              <Folder size={18} /> Root Repository
            </button>
          </nav>
        </div>
        <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.2)", padding: "0 8px" }}>
          TheoTown Engine Core © 2026
        </div>
      </aside>

      {/* ── AREA UTAMA ── */}
      <main style={{ flex: 1, padding: "40px 24px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
        
        {/* TOP BAR / CONTROL BAR */}
        <div style={{
          display: "flex", flexDirection: "column", gap: 16, background: "#161616",
          padding: 16, border: "1px solid rgba(255,255,255,0.06)", marginBottom: 32,
          justifyContent: "space-between", alignItems: "stretch"
        }} className="sm:flex-row sm:items-center">
          
          {/* Breadcrumbs Navigation */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem" }}>
            {folderHistory.length > 0 && (
              <button 
                onClick={handleBackClick} 
                style={{
                  display: "flex", alignItems: "center", gap: 6, background: "#222", color: "#fff",
                  padding: "6px 12px", fontSize: "0.75rem", fontWeight: 600, border: "none", cursor: "pointer"
                }}
              >
                <ArrowLeft size={13} /> Back
              </button>
            )}
            <span style={{ color: "rgba(255,255,255,0.3)" }}>root</span>
            {folderHistory.map((hist, index) => (
              <div key={index} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ChevronRight size={13} style={{ color: "rgba(255,255,255,0.15)" }} />
                <span style={{ color: LIME, fontWeight: 500, maxWidth: 110 }} className="truncate">{hist.name}</span>
              </div>
            ))}
            {isSearchMode && (
              <>
                <ChevronRight size={13} style={{ color: "rgba(255,255,255,0.15)" }} />
                <span style={{ color: RED, fontWeight: 500 }}>Hasil Pencarian Global</span>
              </>
            )}
          </div>

          {/* Kolom Input Search */}
          <div style={{ position: "relative" }} className="w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
            <input
              type="text"
              placeholder="Ketik nama asset (ex: irumi)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%", background: "#1c1c1c", border: "1px solid rgba(255,255,255,0.1)",
                padding: "8px 16px 8px 40px", fontSize: "0.85rem", color: "#fff", outline: "none"
              }}
              className="focus:border-red-500/50 transition-all placeholder:text-gray-600"
            />
          </div>
        </div>

        {/* LOADING ENGINE */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 0", gap: 16 }}>
            <Loader2 className="animate-spin" style={{ color: RED }} size={32} />
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem", letterSpacing: "0.05em" }}>Syncing with Google Drive Vault...</p>
          </div>
        )}

        {/* DOKUMEN LOADED */}
        {!loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            
            {/* SUB SECTION: DIREKTORI FOLDER */}
            {subFolders.length > 0 && (
              <div>
                <h2 style={{ fontFamily: DISPLAY, fontSize: "1.1rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 16 }}>
                  Sub Folders ({subFolders.length})
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                  {subFolders.map((folder) => (
                    <div
                      key={folder.id}
                      onClick={() => handleFolderClick(folder)}
                      style={{
                        background: "#161616", border: "1px solid rgba(255,255,255,0.05)",
                        padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between",
                        cursor: "pointer", transition: "all 0.15s"
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(198,224,0,0.3)"; e.currentTarget.style.background = "#1a1a1a"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.background = "#161616"; }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                        <div style={{ padding: 10, background: "rgba(198,224,0,0.05)", color: LIME }} className="shrink-0">
                          <Folder size={18} />
                        </div>
                        <div className="min-w-0">
                          <h3 style={{ fontWeight: 600, color: "#fff", fontSize: "0.9rem", margin: 0 }} className="truncate">{folder.name}</h3>
                          <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.25)", display: "block", marginTop: 2 }}>Directory folder</span>
                        </div>
                      </div>
                      <ChevronRight size={16} style={{ color: "rgba(255,255,255,0.2)" }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MAIN SECTION: BERKAS FILE PLUGIN */}
            {files.length > 0 && (
              <div>
                <h2 style={{ fontFamily: DISPLAY, fontSize: "1.1rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 16 }}>
                  {isSearchMode ? `Hasil Pencarian Global (${files.length})` : `Files Available (${files.length})`}
                </h2>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 1, background: "rgba(255,255,255,0.05)" }}>
                  {files.map((file) => {
                    const stats = getItemStats(file.name);
                    const nameParts = file.name.split('.');
                    const ext = nameParts.length > 1 ? nameParts.pop()?.toUpperCase() : 'ASSET';
                    
                    const isMedia = file.mimeType.startsWith('image/') || file.mimeType.startsWith('video/');

                    return (
                      <div
                        key={file.id}
                        style={{ background: "#111", padding: 20, display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                      >
                        <div>
                          {/* Nama File & Ekstensi */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 12 }}>
                            <h4 
                              onClick={() => handleFileAction(file)}
                              style={{ fontWeight: 600, fontSize: "0.9rem", color: "#fff", margin: 0, lineHeight: 1.4, cursor: "pointer" }} 
                              className="line-clamp-2 hover:underline hover:text-red-400 transition-colors"
                            >
                              {file.name.replace(/\.[^/.]+$/, "")}
                            </h4>
                            <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", color: RED, textTransform: "uppercase", marginTop: 2 }}>
                              .{ext}
                            </span>
                          </div>

                          {/* Parameter Path Lokasi Folder */}
                          {file.folderPath && (
                            <div style={{ display: "flex", alignItems: "center", gap: 5, color: LIME, fontSize: "0.72rem", marginBottom: 12, opacity: 0.85 }}>
                              <MapPin size={11} />
                              <span>Lokasi: <strong style={{ color: "#fff" }}>{file.folderPath}</strong></span>
                            </div>
                          )}
                        </div>

                        {/* Baris Meta Jarak Kanan-Kiri */}
                        <div>
                          <div style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.35)", fontSize: "0.78rem" }}>
                              <Star size={11} style={{ color: LIME, fill: LIME }} /> 
                              <span>{stats.rating}</span>
                              <span style={{ color: "rgba(255,255,255,0.2)" }}>({stats.downloads} unduh)</span>
                            </div>
                            
                            <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.28)", display: "block" }}>
                              {formatBytes(file.size)}
                            </span>
                          </div>

                          {/* Action Button */}
                          <div style={{ display: "flex", gap: 8 }}>
                            <button 
                              onClick={() => handleFileAction(file)}
                              style={{
                                flex: 1, background: "transparent",
                                border: `1px solid ${isMedia ? 'rgba(198, 224, 0, 0.3)' : 'rgba(255,255,255,0.13)'}`, 
                                color: isMedia ? LIME : "#fff",
                                fontWeight: 600, fontSize: "0.78rem", padding: "9px",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                cursor: "pointer", transition: "all 0.15s"
                              }}
                              onMouseEnter={e => { 
                                e.currentTarget.style.borderColor = isMedia ? LIME : RED; 
                                e.currentTarget.style.color = isMedia ? "#111" : RED;
                                e.currentTarget.style.background = isMedia ? LIME : 'transparent';
                              }}
                              onMouseLeave={e => { 
                                e.currentTarget.style.borderColor = isMedia ? 'rgba(198, 224, 0, 0.3)' : "rgba(255,255,255,0.13)"; 
                                e.currentTarget.style.color = isMedia ? LIME : "#fff"; 
                                e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              {isMedia ? (
                                <>
                                  <Eye size={13} /> Preview Media
                                </>
                              ) : (
                                <>
                                  <Download size={13} /> Download File
                                </>
                              )}
                            </button>
                            
                            {/* Tombol Unduh Tambahan untuk File Media */}
                            {isMedia && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                                  color: "#fff", padding: "9px 12px", display: "flex", alignItems: "center", justifyContent: "center",
                                  transition: "all 0.15s"
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                                title="Download Langsung"
                              >
                                <Download size={13} />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* EMPTY STATE */}
            {subFolders.length === 0 && files.length === 0 && (
              <div style={{ textAlign: "center", padding: "80px 0", border: "1px dashed rgba(255,255,255,0.08)", background: "rgba(22,22,22,0.2)" }}>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.88rem" }}>
                  Folder kosong atau data "{searchQuery}" tidak dapat ditemukan di server Drive.
                </p>
              </div>
            )}

          </div>
        )}

      </main>

      {/* ── 🖥️ MODAL FULLSCREEN PREVIEW PLAYER ── */}
      {previewFile && (
        <div 
          style={{
            position: 'fixed', inset: 0, zIndex: 999, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.92)',
            backdropFilter: 'blur(8px)', padding: 20
          }}
        >
          {/* Header Kontrol Modal */}
          <div style={{ width: '100%', maxWidth: 960, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap:24 }}>
            <h3 style={{ fontWeight: 600, fontSize: '1rem', color: '#fff', margin: 0, maxWidth: '60%', }} className="truncate flex-1" title={previewFile.name}>
              {previewFile.name}
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Tombol Ambil File Fisik */}
              <a 
                href={previewFile.webViewLink} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  background: RED, color: '#fff', textDecoration: 'none', fontWeight: 600,
                  fontSize: '0.78rem', padding: '8px 16px', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                <Download size={14} /> Download (.zip)
              </a>
              {/* Close Button */}
              <button 
                onClick={() => setPreviewFile(null)}
                style={{
                  background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: 8,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                <X size={16} /> Tutup
              </button>
            </div>
          </div>

          {/* Wrapper Media Box Frame */}
          <div 
            style={{
              width: '100%', maxWidth: 960, height: '75vh', backgroundColor: '#090909',
              border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', overflow: 'hidden', position: 'relative'
            }}
          >
            {previewFile.mimeType.startsWith('image/') ? (
              // 🖼️ Renderer Gambar Fullscreen
              <img 
                src={previewFile.viewLink} 
                alt={previewFile.name}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            ) : previewFile.mimeType.startsWith('video/') ? (
              // 🎬 Player Video Terintegrasi (Bisa Di-play/Streaming)
              <video 
                src={previewFile.viewLink}
                controls
                autoPlay
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : null}
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lilita+One&family=DM+Sans:wght@400;500;600;700&display=swap');
      `}</style>
    </div>
  );
}