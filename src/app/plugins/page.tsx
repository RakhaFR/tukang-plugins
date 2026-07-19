'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Folder, Download, ArrowLeft, Loader2, ChevronRight, Home, Star, MapPin, X, Eye, Menu } from 'lucide-react';
import { Lilita_One, DM_Sans } from 'next/font/google';

const lilitaOne = Lilita_One({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const RED = "#E53935";
const LIME = "#C6E000";

interface DriveItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  webViewLink: string; 
  viewLink: string;    
  folderPath?: string;
  dl: number;          
  rating: string;      
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
  const [mounted, setMounted] = useState(false);

  // ── STATE UNTUK POP-UP RATING ──
  const [ratingFile, setRatingFile] = useState<DriveItem | null>(null);
  const [selectedStars, setSelectedStars] = useState<number>(5);
  const [submittingRating, setSubmittingRating] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      .catch((err) => console.error("Error fetching repository data:", err))
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
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const handleFileAction = async (file: DriveItem) => {
    // 1. Jalankan tracking download ke server
    try {
      await fetch('/api/drive/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: file.id })
      });
    } catch (err) {
      console.error("Gagal tracking download plugins:", err);
    }

    // 2. Buka file atau set preview media
    const isImage = file.mimeType.startsWith('image/');
    const isVideo = file.mimeType.startsWith('video/');
    
    if (isImage || isVideo) {
      setPreviewFile(file);
    } else {
      window.open(file.webViewLink, '_blank');
    }

    // 3. SEGERA MUNCULKAN POP-UP RATING SECARA OTOMATIS
    setRatingFile(file); 
  };

  const handleSendRating = async (stars: number) => {
    if (!ratingFile) return;
    setSubmittingRating(true);
    try {
      const response = await fetch('/api/drive/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: ratingFile.id, stars: stars })
      });
      const resData = await response.json();
      if (resData.success) {
        fetchFolderContent(currentFolderId || '');
        setRatingFile(null);
      } else {
        alert("Gagal menyimpan rating.");
      }
    } catch (err) {
      console.error("Error submitting rating:", err);
    } finally {
      setSubmittingRating(false);
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

  const resetToRoot = () => {
    setSearchQuery('');
    fetchFolderContent('');
    setFolderHistory([]);
    setSidebarOpen(false);
  };

  return (
    <div className={dmSans.className} style={{ background: "#111", color: "#f5f5f5", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* MOBILE TOPBAR */}
      {isMobile && (
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 16px", background: "#161616",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          position: "sticky", top: 0, zIndex: 50
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: RED }} />
            <span className={lilitaOne.className} style={{ fontSize: "1.1rem", color: "#fff", letterSpacing: "0.04em" }}>
              TukangPlugin
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            style={{ background: sidebarOpen ? "rgba(255,255,255,0.1)" : "none", border: "none", color: "#fff", cursor: "pointer", padding: "6px 8px" }}
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </header>
      )}

      {/* OVERLAY SIDEBAR MOBILE */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 45, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(3px)" }} />
      )}

      <div style={{ display: "flex", flex: 1, position: "relative" }}>

        {/* SIDEBAR */}
        <aside style={{
          width: 260, background: "#161616", borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex", flexDirection: "column", padding: 24, justifyContent: "space-between", flexShrink: 0,
          ...(isMobile ? { position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 46, transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.28s ease", overflowY: "auto" } : { position: "static" })
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40, padding: "0 8px" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: RED }} />
              <span className={lilitaOne.className} style={{ fontSize: "1.3rem", color: "#fff", letterSpacing: "0.04em" }}>
                TukangPlugin
              </span>
            </div>

            <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Link href="/" onClick={() => setSidebarOpen(false)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", color: "rgba(255,255,255,0.45)", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}>
                <Home size={18} /> Home About
              </Link>
              <button onClick={resetToRoot} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", width: "100%", textAlign: "left", background: "rgba(198, 224, 0, 0.08)", color: LIME, fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", border: `1px solid rgba(198, 224, 0, 0.15)` }}>
                <Folder size={18} /> Root Repository
              </button>
            </nav>
          </div>
          <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.2)", padding: "0 8px" }}>
            © 2026 · Untuk komunitas BangRiyadi Community's
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main style={{ flex: 1, padding: isMobile ? "20px 16px" : "32px 24px", width: "100%", minWidth: 0 }}>
          
          {/* CONTROL BAR */}
          <div style={{ display: "flex", gap: 12, background: "#161616", padding: 14, border: "1px solid rgba(255,255,255,0.06)", marginBottom: 24, alignItems: "center", justifyContent: "space-between", flexDirection: isMobile ? "column" : "row" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.8rem", flexWrap: "wrap", minWidth: 0, flex: 1, width: isMobile ? "100%" : "auto" }}>
              {folderHistory.length > 0 && (
                <button onClick={handleBackClick} style={{ display: "flex", alignItems: "center", gap: 6, background: "#222", color: "#fff", padding: "6px 12px", fontSize: "0.75rem", fontWeight: 600, border: "none", cursor: "pointer" }}>
                  <ArrowLeft size={13} /> Back
                </button>
              )}
              <span style={{ color: "rgba(255,255,255,0.3)" }}>root</span>
              {folderHistory.map((hist, index) => (
                <div key={index} style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                  <ChevronRight size={13} style={{ color: "rgba(255,255,255,0.15)", flexShrink: 0 }} />
                  <span style={{ color: LIME, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 90 }}>{hist.name}</span>
                </div>
              ))}
            </div>

            <div style={{ position: "relative", width: isMobile ? "100%" : 280, flexShrink: 0 }}>
              <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }} size={14} />
              <input type="text" placeholder="Ketik nama asset..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: "100%", background: "#1c1c1c", border: "1px solid rgba(255,255,255,0.1)", padding: "8px 14px 8px 36px", fontSize: "0.82rem", color: "#fff", outline: "none" }} />
            </div>
          </div>

          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: 16 }}>
              <Loader2 
                style={{ 
                  color: RED, 
                  WebkitAnimation: "spin 1s linear infinite",
                  animation: "spin 1s linear infinite" 
                }} 
                size={28} 
              />              
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.82rem" }}>Syncing with Google Drive Vault...</p>
            </div>
          )}

          {!loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
              
              {/* SUBFOLDERS */}
              {subFolders.length > 0 && (
                <div>
                  <h2 className={lilitaOne.className} style={{ fontSize: "1rem", color: "rgba(255,255,255,0.4)", marginBottom: 14 }}>Sub Folders ({subFolders.length})</h2>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
                    {subFolders.map((folder) => (
                      <div key={folder.id} onClick={() => handleFolderClick(folder)} style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.05)", padding: 14, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                          <div style={{ padding: 9, background: "rgba(198,224,0,0.05)", color: LIME }}><Folder size={17} /></div>
                          <div style={{ minWidth: 0 }}><h3 style={{ fontWeight: 600, color: "#fff", fontSize: "0.875rem", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{folder.name}</h3></div>
                        </div>
                        <ChevronRight size={15} style={{ color: "rgba(255,255,255,0.2)" }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FILES VIEW */}
              {files.length > 0 && (
                <div>
                  <h2 className={lilitaOne.className} style={{ fontSize: "1rem", color: "rgba(255,255,255,0.4)", marginBottom: 14 }}>Files Available ({files.length})</h2>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(260px, 1fr))", gap: 1, background: "rgba(255,255,255,0.05)" }}>
                    {files.map((file) => {
                      const nameParts = file.name.split('.');
                      const ext = nameParts.length > 1 ? nameParts.pop()?.toUpperCase() : 'ASSET';
                      const isMedia = file.mimeType.startsWith('image/') || file.mimeType.startsWith('video/');

                      return (
                        <div key={file.id} style={{ background: "#111", padding: 18, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 10 }}>
                              <h4 onClick={() => handleFileAction(file)} style={{ fontWeight: 600, fontSize: "0.875rem", color: "#fff", margin: 0, cursor: "pointer" }}>{file.name.replace(/\.[^/.]+$/, "")}</h4>
                              <span style={{ fontSize: "0.62rem", fontWeight: 700, color: RED }}>.{ext}</span>
                            </div>
                            {file.folderPath && (
                              <div style={{ display: "flex", alignItems: "center", gap: 5, color: LIME, fontSize: "0.7rem", marginBottom: 12 }}>
                                <MapPin size={10} /> <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Lokasi: <strong style={{ color: "#fff" }}>{file.folderPath}</strong></span>
                              </div>
                            )}
                          </div>

                          <div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,0.35)", fontSize: "0.75rem" }}>
                                <Star size={10} style={{ color: LIME, fill: LIME }} />
                                <span>{file.rating}</span>
                                <span>({file.dl} unduh)</span>
                              </div>
                              <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.28)" }}>{formatBytes(file.size)}</span>
                            </div>

                            {/* HANYA SATU TOMBOL UTAMA - SEPERTI LANDING PAGE */}
                            <div style={{ display: "flex", gap: 8 }}>
                              <button onClick={() => handleFileAction(file)} style={{ flex: 1, background: "transparent", border: `1px solid ${isMedia ? 'rgba(198, 224, 0, 0.3)' : 'rgba(255,255,255,0.13)'}`, color: isMedia ? LIME : "#fff", fontWeight: 600, fontSize: "0.75rem", padding: "10px 8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                                {isMedia ? <><Eye size={13} /> Preview Media</> : <><Download size={13} /> Download File</>}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── 🆕 POPUP ANONYMOUS RATING MODAL (STYLE LANDING PAGE) ── */}
      {mounted && ratingFile && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', padding: 16 }}>
          <div 
            style={{ 
              position: 'relative', width: '100%', maxWidth: 360, borderRadius: 16, backgroundColor: '#0f172a', 
              border: '1px solid rgba(51, 65, 85, 0.8)', padding: 28, textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' 
            }}
          >
            {/* Tombol X (Close) Pojok Kanan Atas */}
            <button 
              onClick={() => setRatingFile(null)}
              disabled={submittingRating}
              style={{ position: 'absolute', top: 16, right: 16, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 8 }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#cbd5e1'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
            >
              <X size={18} />
            </button>

            {/* Konten Efek */}
            <div style={{ fontSize: '2.5rem', marginBottom: 12, display: 'inline-block' }}>⭐</div>
            
            <h3 className={lilitaOne.className} style={{ fontSize: '1.35rem', color: '#fff', trackingWide: '0.02em', margin: '0 0 8px 0' }}>
              Bantu Rating Dong!
            </h3>
            
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 24px 0', padding: '0 8px' }}>
              Gimana kualitas plugin barusan? Satu klik bintang lo sangat berharga buat kemajuan orang lain yang ingin download.
            </p>
            
            {/* Interaksi Bintang Dinamis (Sekali Klik Langsung Kirim) */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  disabled={submittingRating}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => handleSendRating(star)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '2.3rem', padding: 0,
                    transition: 'transform 0.15s ease',
                    color: star <= (hoveredStar || 0) ? '#FFC107' : 'rgba(255,255,255,0.15)',
                    textShadow: star <= (hoveredStar || 0) ? '0 0 12px rgba(255,193,7,0.4)' : 'none'
                  }}
                  onPointerOver={(e) => e.currentTarget.style.transform = 'scale(1.25)'}
                  onPointerOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  ★
                </button>
              ))}
            </div>

            {/* Tombol Skip */}
            <button 
              onClick={() => setRatingFile(null)}
              disabled={submittingRating}
              style={{ fontSize: '0.75rem', color: '#64748b', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#94a3b8'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
            >
              Nanti aja, makasih
            </button>
          </div>
        </div>
      )}

      {/* MEDIA PREVIEW LIGHTBOX MODAL */}
      {previewFile && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(8px)', padding: 20 }}>
          <div style={{ width: '100%', maxWidth: 960, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff', margin: 0 }}>{previewFile.name}</h3>
            <button onClick={() => setPreviewFile(null)} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '8px 12px', cursor: 'pointer' }}>Tutup</button>
          </div>
          <div style={{ width: '100%', maxWidth: 960, flex: 1, backgroundColor: '#090909', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {previewFile.mimeType.startsWith('image/') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewFile.viewLink} alt={previewFile.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            ) : <video src={previewFile.viewLink} controls autoPlay style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
          </div>
        </div>
      )}
    </div>
  );
}