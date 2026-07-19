'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Folder, Download, ArrowLeft, Loader2, ChevronRight, Home, Star, MapPin, X, Eye, Menu } from 'lucide-react';

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
  viewLink?: string;
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
  const [previewFile, setPreviewFile] = useState<DriveItem | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Deteksi ukuran layar
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Tutup sidebar otomatis kalau resize ke desktop
  useEffect(() => {
    if (!isMobile) setSidebarOpen(false);
  }, [isMobile]);

  const fetchFolderContent = (id: string = '', searchWord: string = '') => {
    setLoading(true);
    let url = '/api/drive';
    const params = new URLSearchParams();
    if (searchWord) params.append('search', searchWord);
    else if (id) params.append('folderId', id);
    if (params.toString()) url += `?${params.toString()}`;

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
      if (searchQuery.trim() !== '') fetchFolderContent('', searchQuery);
      else fetchFolderContent(currentFolderId || '');
    }, 600);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleFolderClick = (folder: DriveItem) => {
    setSearchQuery('');
    setSidebarOpen(false);
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

  const handleFileAction = (file: DriveItem) => {
    const isImage = file.mimeType.startsWith('image/');
    const isVideo = file.mimeType.startsWith('video/');
    if (isImage || isVideo) setPreviewFile(file);
    else window.open(file.webViewLink, '_blank');
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

  const resetToRoot = () => {
    setSearchQuery('');
    fetchFolderContent('');
    setFolderHistory([]);
    setSidebarOpen(false);
  };

  return (
    <div style={{ fontFamily: BODY, background: "#111", color: "#f5f5f5", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* ── MOBILE TOPBAR — hanya tampil di mobile ── */}
      {isMobile && (
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 16px", background: "#161616",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          position: "sticky", top: 0, zIndex: 50
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: RED, animation: "pulse 2s infinite" }} />
            <span style={{ fontFamily: DISPLAY, fontSize: "1.1rem", color: "#fff", letterSpacing: "0.04em" }}>
              TukangPlugin
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            style={{
              background: sidebarOpen ? "rgba(255,255,255,0.1)" : "none",
              border: "none", color: "#fff", cursor: "pointer",
              padding: "6px 8px", display: "flex", alignItems: "center",
              transition: "background 0.2s"
            }}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </header>
      )}

      {/* ── OVERLAY — klik untuk nutup sidebar di mobile ── */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 45,
            background: "rgba(0,0,0,0.65)", backdropFilter: "blur(3px)"
          }}
        />
      )}

      <div style={{ display: "flex", flex: 1, position: "relative" }}>

        {/* ── SIDEBAR ──
            Desktop: static, selalu tampil
            Mobile: fixed drawer dari kiri, muncul kalau sidebarOpen=true
        ── */}
        <aside style={{
          width: 260,
          background: "#161616",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          padding: 24,
          justifyContent: "space-between",
          flexShrink: 0,
          // Mobile: jadi drawer fixed
          ...(isMobile ? {
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            zIndex: 46,
            transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.28s ease",
            overflowY: "auto",
          } : {
            position: "static",
          })
        }}>
          <div>
            {/* Logo di dalam sidebar — desktop always show, mobile always show (karena topbar pake X button) */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40, padding: "0 8px" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: RED }} />
              <span style={{ fontFamily: DISPLAY, fontSize: "1.3rem", color: "#fff", letterSpacing: "0.04em" }}>
                TukangPlugin
              </span>
            </div>

            <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Link
                href="/"
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                  color: "rgba(255,255,255,0.45)", textDecoration: "none",
                  fontSize: "0.875rem", fontWeight: 500, transition: "color 0.15s"
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
              >
                <Home size={18} /> Home About
              </Link>

              <button
                onClick={resetToRoot}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                  width: "100%", textAlign: "left",
                  background: "rgba(198, 224, 0, 0.08)", color: LIME,
                  fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
                  border: `1px solid rgba(198, 224, 0, 0.15)`
                }}
              >
                <Folder size={18} /> Root Repository
              </button>
            </nav>
          </div>

          <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.2)", padding: "0 8px" }}>
            © 2026 · Untuk komunitas BangRiyadi Community's
          </div>
        </aside>

        {/* ── MAIN AREA ── */}
        <main style={{ flex: 1, padding: isMobile ? "20px 16px" : "32px 24px", width: "100%", minWidth: 0 }}>

          {/* CONTROL BAR */}
          <div style={{
            display: "flex", gap: 12, background: "#161616",
            padding: 14, border: "1px solid rgba(255,255,255,0.06)",
            marginBottom: 24, alignItems: "center",
            justifyContent: "space-between",
            flexDirection: isMobile ? "column" : "row",
            flexWrap: "wrap"
          }}>
            {/* Breadcrumbs */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.8rem", flexWrap: "wrap", minWidth: 0, flex: 1, width: isMobile ? "100%" : "auto" }}>
              {folderHistory.length > 0 && (
                <button
                  onClick={handleBackClick}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, background: "#222", color: "#fff",
                    padding: "6px 12px", fontSize: "0.75rem", fontWeight: 600,
                    border: "none", cursor: "pointer", whiteSpace: "nowrap"
                  }}
                >
                  <ArrowLeft size={13} /> Back
                </button>
              )}
              <span style={{ color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap" }}>root</span>
              {folderHistory.map((hist, index) => (
                <div key={index} style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                  <ChevronRight size={13} style={{ color: "rgba(255,255,255,0.15)", flexShrink: 0 }} />
                  <span style={{ color: LIME, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 90 }}>
                    {hist.name}
                  </span>
                </div>
              ))}
              {isSearchMode && (
                <>
                  <ChevronRight size={13} style={{ color: "rgba(255,255,255,0.15)", flexShrink: 0 }} />
                  <span style={{ color: RED, fontWeight: 500, whiteSpace: "nowrap" }}>Hasil Pencarian</span>
                </>
              )}
            </div>

            {/* Search */}
            <div style={{ position: "relative", width: isMobile ? "100%" : 280, flexShrink: 0 }}>
              <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }} size={14} />
              <input
                type="text"
                placeholder="Ketik nama asset..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%", background: "#1c1c1c",
                  border: "1px solid rgba(255,255,255,0.1)",
                  padding: "8px 14px 8px 36px", fontSize: "0.82rem",
                  color: "#fff", outline: "none", boxSizing: "border-box"
                }}
              />
            </div>
          </div>

          {/* LOADING */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: 16 }}>
              <Loader2 style={{ color: RED, animation: "spin 1s linear infinite" }} size={28} />
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.82rem", letterSpacing: "0.05em" }}>Syncing with Google Drive Vault...</p>
            </div>
          )}

          {/* CONTENT */}
          {!loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>

              {/* FOLDERS */}
              {subFolders.length > 0 && (
                <div>
                  <h2 style={{ fontFamily: DISPLAY, fontSize: "1rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 14 }}>
                    Sub Folders ({subFolders.length})
                  </h2>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
                    {subFolders.map((folder) => (
                      <div
                        key={folder.id}
                        onClick={() => handleFolderClick(folder)}
                        style={{
                          background: "#161616", border: "1px solid rgba(255,255,255,0.05)",
                          padding: 14, display: "flex", alignItems: "center",
                          justifyContent: "space-between", cursor: "pointer", transition: "all 0.15s"
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(198,224,0,0.3)"; e.currentTarget.style.background = "#1a1a1a"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.background = "#161616"; }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                          <div style={{ padding: 9, background: "rgba(198,224,0,0.05)", color: LIME, flexShrink: 0 }}>
                            <Folder size={17} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <h3 style={{ fontWeight: 600, color: "#fff", fontSize: "0.875rem", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {folder.name}
                            </h3>
                            <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.25)", display: "block", marginTop: 2 }}>Directory folder</span>
                          </div>
                        </div>
                        <ChevronRight size={15} style={{ color: "rgba(255,255,255,0.2)", flexShrink: 0 }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FILES */}
              {files.length > 0 && (
                <div>
                  <h2 style={{ fontFamily: DISPLAY, fontSize: "1rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 14 }}>
                    {isSearchMode ? `Hasil Pencarian Global (${files.length})` : `Files Available (${files.length})`}
                  </h2>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(260px, 1fr))", gap: 1, background: "rgba(255,255,255,0.05)" }}>
                    {files.map((file) => {
                      const stats = getItemStats(file.name);
                      const nameParts = file.name.split('.');
                      const ext = nameParts.length > 1 ? nameParts.pop()?.toUpperCase() : 'ASSET';
                      const isMedia = file.mimeType.startsWith('image/') || file.mimeType.startsWith('video/');

                      return (
                        <div
                          key={file.id}
                          style={{ background: "#111", padding: 18, display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                        >
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 10 }}>
                              <h4
                                onClick={() => handleFileAction(file)}
                                style={{
                                  fontWeight: 600, fontSize: "0.875rem", color: "#fff", margin: 0,
                                  lineHeight: 1.4, cursor: "pointer", overflow: "hidden",
                                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical"
                                }}
                              >
                                {file.name.replace(/\.[^/.]+$/, "")}
                              </h4>
                              <span style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.08em", color: RED, textTransform: "uppercase", marginTop: 2, whiteSpace: "nowrap", flexShrink: 0 }}>
                                .{ext}
                              </span>
                            </div>

                            {file.folderPath && (
                              <div style={{ display: "flex", alignItems: "center", gap: 5, color: LIME, fontSize: "0.7rem", marginBottom: 12, opacity: 0.85 }}>
                                <MapPin size={10} style={{ flexShrink: 0 }} />
                                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  Lokasi: <strong style={{ color: "#fff" }}>{file.folderPath}</strong>
                                </span>
                              </div>
                            )}
                          </div>

                          <div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,0.35)", fontSize: "0.75rem" }}>
                                <Star size={10} style={{ color: LIME, fill: LIME }} />
                                <span>{stats.rating}</span>
                                <span style={{ color: "rgba(255,255,255,0.2)" }}>({stats.downloads} unduh)</span>
                              </div>
                              <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.28)" }}>
                                {formatBytes(file.size)}
                              </span>
                            </div>

                            <div style={{ display: "flex", gap: 8 }}>
                              <button
                                onClick={() => handleFileAction(file)}
                                style={{
                                  flex: 1, background: "transparent",
                                  border: `1px solid ${isMedia ? 'rgba(198, 224, 0, 0.3)' : 'rgba(255,255,255,0.13)'}`,
                                  color: isMedia ? LIME : "#fff",
                                  fontWeight: 600, fontSize: "0.75rem", padding: "10px 8px",
                                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                  cursor: "pointer", transition: "all 0.15s"
                                }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.borderColor = isMedia ? LIME : RED;
                                  e.currentTarget.style.color = isMedia ? "#111" : RED;
                                  e.currentTarget.style.background = isMedia ? LIME : "transparent";
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.borderColor = isMedia ? "rgba(198, 224, 0, 0.3)" : "rgba(255,255,255,0.13)";
                                  e.currentTarget.style.color = isMedia ? LIME : "#fff";
                                  e.currentTarget.style.background = "transparent";
                                }}
                              >
                                {isMedia ? <><Eye size={13} /> Preview Media</> : <><Download size={13} /> Download File</>}
                              </button>

                              {isMedia && (
                                <a
                                  href={file.webViewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                                    color: "#fff", padding: "10px 12px", display: "flex", alignItems: "center",
                                    justifyContent: "center", transition: "all 0.15s", textDecoration: "none", flexShrink: 0
                                  }}
                                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
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
                <div style={{ textAlign: "center", padding: "60px 20px", border: "1px dashed rgba(255,255,255,0.08)", background: "rgba(22,22,22,0.2)" }}>
                  <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.88rem" }}>
                    Folder kosong atau data "{searchQuery}" tidak ditemukan di server Drive.
                  </p>
                </div>
              )}

            </div>
          )}
        </main>
      </div>

      {/* ── MODAL PREVIEW ── */}
      {previewFile && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.95)',
          backdropFilter: 'blur(8px)', padding: isMobile ? 12 : 20
        }}>
          <div style={{
            width: '100%', maxWidth: 960, display: 'flex',
            justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 12, gap: 12,
            flexDirection: isMobile ? "column" : "row"
          }}>
            <h3 style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: "100%" }} title={previewFile.name}>
              {previewFile.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, width: isMobile ? "100%" : "auto", justifyContent: isMobile ? "flex-end" : "flex-start" }}>
              <a
                href={previewFile.webViewLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: RED, color: '#fff', textDecoration: 'none', fontWeight: 600,
                  fontSize: '0.75rem', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                <Download size={13} /> Download (.zip)
              </a>
              <button
                onClick={() => setPreviewFile(null)}
                style={{
                  background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none',
                  padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                  gap: 4, fontSize: '0.8rem', fontWeight: 600
                }}
              >
                <X size={15} /> Tutup
              </button>
            </div>
          </div>

          <div style={{
            width: '100%', maxWidth: 960, flex: 1, maxHeight: isMobile ? "70vh" : "80vh",
            backgroundColor: '#090909', border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
          }}>
            {previewFile.mimeType.startsWith('image/') ? (
              <img src={previewFile.viewLink} alt={previewFile.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            ) : previewFile.mimeType.startsWith('video/') ? (
              <video src={previewFile.viewLink} controls autoPlay style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : null}
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lilita+One&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { transition: none !important; animation: none !important; }
        }
      `}</style>
    </div>
  );
}