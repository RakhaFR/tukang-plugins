'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, LayoutGrid, Cpu, ShieldCheck, Download, Star, Loader2, X, Eye } from 'lucide-react';

const DISPLAY = "'Lilita One', cursive";
const BODY = "'DM Sans', sans-serif";
const RED = "#E53935";
const LIME = "#C6E000";

interface PopularPlugin {
  id: string;
  name: string;
  cat: string;
  rating: string;
  dl: string;
  rawSize: string;
  webViewLink: string;
  mimeType: string;
  viewLink?: string;
}

export default function LandingPage() {
  const [stats, setStats] = useState({ totalPlugins: 0, totalCategories: 0 });
  const [popularPlugins, setPopularPlugins] = useState<PopularPlugin[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk mengontrol Preview Modal Fullscreen
  const [previewFile, setPreviewFile] = useState<PopularPlugin | null>(null);

  useEffect(() => {
    fetch('/api/drive/stats')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setStats(resData.stats);
          setPopularPlugins(resData.popularPlugins);
        }
      })
      .catch((err) => console.error('Gagal memuat statistik landing:', err))
      .finally(() => setLoading(false));
  }, []);

  // 📥 SISTEM AKSI: Mengikuti logika eksak dari /plugin Dashboard
const handleFileAction = (file: PopularPlugin) => {
  const mime = file.mimeType || '';
  const isImage = mime.startsWith('image/');
  const isVideo = mime.startsWith('video/');

  if (isImage || isVideo) {
    setPreviewFile({ ...file });
  } else {
    window.open(file.webViewLink, '_blank');
  }
};

  return (
    <div style={{ fontFamily: BODY, background: "#111", color: "#f5f5f5", minHeight: "100vh" }}>

      {/* ── NAV ── */}
      <nav style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 30,
        display: "flex", alignItems: "center", justifyBetween: "space-between",
        padding: "24px 40px",
        justifyContent: 'space-between'
      }}>
        <span style={{ fontFamily: DISPLAY, fontSize: "1.4rem", color: "#fff", letterSpacing: "0.04em"}}>
          TukangPlugin
        </span>
        <div style={{ display: "flex", gap: 32, fontSize: "0.875rem", fontWeight: 500, color: "rgba(255,255,255,0.55)" }}>
          {(["#fitur", "#plugin"] as const).map((href, i) => (
            <a
              key={href}
              href={href}
              style={{ color: "inherit", textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
            >
              {["Fitur", "Plugin"][i]}
            </a>
          ))}
        </div>
        <Link
          href="/plugins"
          style={{
            fontFamily: BODY, fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.05em",
            background: RED, color: "#fff", padding: "10px 22px",
            textDecoration: "none", display: "flex", alignItems: "center", gap: 6,
          }}
        >
          <Download size={14} />
          Unduh Plugin
        </Link>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: "relative", minHeight: "120vh", display: "flex", alignItems: "center", overflow: "hidden"}}>
        <Image
          src="/hero.png"
          alt="TheoTown"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.85) 40%, rgba(0,0,0,0.25) 100%)" }} />

        <div style={{ position: "relative", zIndex: 10, padding: "0 40px", maxWidth: 660 }}>
          <h1 style={{
            fontFamily: DISPLAY,
            fontSize: "clamp(4.5rem, 14vw, 10rem)",
            lineHeight: 1,
            margin: "0 0 4px",
            color: "#fff",
            WebkitTextStroke: "5px #C0392B",
            paintOrder: "stroke fill",
            marginTop: "5rem"
          }}>
            TUKANG
          </h1>

          <h1 style={{
            fontFamily: DISPLAY,
            fontSize: "clamp(4.5rem, 14vw, 10rem)",
            lineHeight: 1,
            margin: "0 0 28px",
            color: "#fff",
            WebkitTextStroke: "5px #7A9600",
            paintOrder: "stroke fill",
          }}>
            <span style={{ color: LIME }}>PLUGIN</span>
          </h1>

          <p style={{
            fontSize: "1rem", lineHeight: 1.75, color: "rgba(255,255,255,0.6)",
            maxWidth: 420, marginBottom: 36,
          }}>
            Cari, pantau, dan unduh plugin serta aset kustom berkualitas tinggi untuk kota digital kamu di{" "}
            <strong style={{ color: "#fff", fontWeight: 600 }}>TheoTown</strong>.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 52 }}>
            <Link
              href="/plugins"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: RED, color: "#fff", fontWeight: 700,
                fontSize: "0.875rem", padding: "13px 28px",
                textDecoration: "none", letterSpacing: "0.04em",
              }}
            >
              Get Started <ArrowRight size={16} />
            </Link>
            <a
              href="#fitur"
              style={{
                display: "inline-flex", alignItems: "center",
                background: "transparent", color: "#fff", fontWeight: 500,
                fontSize: "0.875rem", padding: "13px 28px",
                textDecoration: "none", border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              Pelajari Fungsi
            </a>
          </div>

          <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
            {[
              { v: loading ? "..." : stats.totalPlugins === 0 ? "150+" : `${stats.totalPlugins}+`, l: "File Plugin", c: RED },
              { v: loading ? "..." : `${stats.totalCategories}`, l: "Kategori Folder", c: LIME },
              { v: "100%", l: "Aman Dijalankan", c: "#fff" },
            ].map(s => (
              <div key={s.l}>
                <div style={{ fontFamily: DISPLAY, fontSize: "2.5rem", color: s.c, lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "rgba(255,255,255,0.38)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="fitur" style={{ background: "#161616", padding: "88px 40px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <p style={{ fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.2em", color: LIME, textTransform: "uppercase", marginBottom: 10 }}>
            Fitur Unggulan
          </p>
          <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(2rem, 5vw, 3.8rem)", color: "#fff", margin: "0 0 56px", lineHeight: 1.1 }}>
            Kenapa Tukang Plugin?
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 1, background: "rgba(255,255,255,0.06)" }}>
            {[
              { icon: <LayoutGrid size={22} />, accent: RED, title: "Manajemen Folder", desc: "Organisasi file terstruktur dari cloud langsung ke server lokal. Rapi, tanpa ribet." },
              { icon: <ShieldCheck size={22} />, accent: LIME, title: "Bebas Error & Duplikat", desc: "Penyaringan ketat. Plugin yang lo unduh 100% aman dan bebas dari crash." },
              { icon: <Cpu size={22} />, accent: "#fff", title: "Instalasi Otomatis", desc: "Panduan praktis buat pemula maupun pro. Install selesai, langsung main." },
            ].map(f => (
              <div key={f.title} style={{ background: "#161616", padding: "36px 32px" }}>
                <div style={{ color: f.accent, marginBottom: 18 }}>{f.icon}</div>
                <h3 style={{ fontFamily: DISPLAY, fontSize: "1.5rem", color: "#fff", margin: "0 0 10px", lineHeight: 1.1 }}>{f.title}</h3>
                <p style={{ fontSize: "0.88rem", lineHeight: 1.7, color: "rgba(255,255,255,0.45)", margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REAL FETCHED PLUGINS ── */}
      <section id="plugin" style={{ background: "#111", padding: "88px 40px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <p style={{ fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.2em", color: RED, textTransform: "uppercase", marginBottom: 10 }}>
            Koleksi Live
          </p>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 44, flexWrap: "wrap", gap: 12 }}>
            <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(2rem, 5vw, 3.8rem)", color: "#fff", margin: 0, lineHeight: 1.1 }}>
              Terbaru dari Drive
            </h2>
            <Link
              href="/plugins"
              style={{ fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.08em", color: RED, textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}
            >
              LIHAT SEMUA <ArrowRight size={13} />
            </Link>
          </div>

          {loading && (
            <div style={{ display: "flex", justifyContent: "center", padding: "40px 0", color: "rgba(255,255,255,0.4)" }}>
              <Loader2 className="animate-spin" size={24} />
            </div>
          )}

          {!loading && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 1, background: "rgba(255,255,255,0.05)" }}>
              {popularPlugins.map(p => {
                const mime = p.mimeType || '';
                const isMedia = p.mimeType.startsWith('image/') || p.mimeType.startsWith('video/');

                return (
                  <div
                    key={p.id}
                    style={{ background: "#111", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between", transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#1a1a1a")}
                    onMouseLeave={e => (e.currentTarget.style.background = "#111")}
                  >
                    <div>
                      <div 
                        onClick={() => handleFileAction(p)}
                        style={{
                          width: "100%", aspectRatio: "16/9", background: "#1c1c1c",
                          marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center",
                          overflow: "hidden", position: "relative", border: "1px solid rgba(255,255,255,0.03)", cursor: "pointer"
                        }}
                      >
                        {isMedia && p.viewLink ? (
                          <img 
                            src={p.viewLink} 
                            alt={p.name} 
                            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }} 
                          />
                        ) : (
                          <span style={{ fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.14em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>
                            {p.cat} FILE
                          </span>
                        )}
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6, gap: 8 }}>
                        <h3 
                          onClick={() => handleFileAction(p)}
                          style={{ fontWeight: 600, fontSize: "0.9rem", color: "#fff", margin: 0, lineHeight: 1.3, cursor: "pointer" }}
                          className="line-clamp-2 hover:underline hover:text-red-400 transition-colors"
                        >
                          {p.name.replace(/\.[^/.]+$/, "")}
                        </h3>
                        <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.15em", color: RED, textTransform: "uppercase", marginTop: 2, whiteSpace: "nowrap" }}>
                          .{p.cat}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.35)", fontSize: "0.78rem" }}>
                          <Star size={11} style={{ color: LIME, fill: LIME }} /> 
                          <span>{p.rating}</span>
                          <span style={{ color: "rgba(255,255,255,0.2)" }}>({p.dl} unduh)</span>
                        </div>
                        
                        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.28)", display: "block" }}>
                          {p.rawSize}
                        </span>
                      </div>

                      {/* 🛠️ STRATEGI TOMBOL: Mengadopsi struktur flex gap 8 dari /plugin */}
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => handleFileAction(p)}
                          style={{
                            flex: 1, background: "transparent",
                            border: `1px solid ${isMedia ? 'rgba(198, 224, 0, 0.3)' : 'rgba(255,255,255,0.13)'}`, 
                            color: isMedia ? LIME : "#fff",
                            fontFamily: BODY, fontWeight: 600, fontSize: "0.78rem",
                            letterSpacing: "0.06em", padding: "9px", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                            textDecoration: "none", transition: "all 0.15s"
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

                        {/* 📥 TOMBOL UNDUH TAMBAHAN: Mengadopsi elemen <a> target="_blank" murni dari /plugin */}
                        {isMedia && (
                          <a
                            href={p.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                              color: "#fff", padding: "9px 12px", display: "flex", alignItems: "center", justifyContent: "center",
                              transition: "all 0.15s", cursor: "pointer"
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
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: RED, padding: "88px 40px", textAlign: "center" }}>
        <p style={{ fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.2em", color: "rgba(0,0,0,0.35)", textTransform: "uppercase", marginBottom: 14 }}>
          Mulai Sekarang
        </p>
        <h2 style={{
          fontFamily: DISPLAY,
          fontSize: "clamp(2rem, 6vw, 4.5rem)",
          color: "#fff",
          margin: "0 0 14px",
          lineHeight: 1.1,
        }}>
          Siap Bangun Kota Impian?
        </h2>
        <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.72)", marginBottom: 36, maxWidth: 420, marginLeft: "auto", marginRight: "auto", lineHeight: 1.7 }}>
          Ribuan pemain TheoTown udah pake ini. Giliran kamu sekarang.
        </p>
        <Link
          href="/plugins"
          style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "#fff", color: RED, fontWeight: 700,
            fontSize: "0.875rem", letterSpacing: "0.05em",
            padding: "15px 36px", textDecoration: "none",
          }}
        >
          <Download size={16} /> Dashboard Download
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        background: "#0d0d0d", padding: "28px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10,
      }}>
        <span style={{ fontFamily: DISPLAY, fontSize: "1.1rem", color: "#fff", letterSpacing: "0.04em" }}>TukangPlugin</span>
        <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.28)", margin: 0 }}>
          © 2026 · Untuk komunitas TheoTown Indonesia
        </p>
      </footer>

      {/* ── 🖥️ MODAL FULLSCREEN PREVIEW PLAYER ── */}
      {previewFile && (
        <div 
          style={{
            position: 'fixed', inset: 0, zIndex: 999, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.92)',
            backdropFilter: 'blur(8px)', padding: 20
          }}
        >
          <div style={{ width: '100%', maxWidth: 960, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 24 }}>
            <h3 
              style={{ fontWeight: 600, fontSize: '1rem', color: '#fff', margin: 0 }} 
              className="truncate flex-1"
              title={previewFile.name}
            >
              {previewFile.name}
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="shrink-0">
              {/* 📥 Menyesuaikan string download (.zip) seperti di /plugin */}
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

          <div 
            style={{
              width: '100%', maxWidth: 960, height: '75vh', backgroundColor: '#090909',
              border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', overflow: 'hidden', position: 'relative'
            }}
          >
            {previewFile.mimeType.startsWith('image/') ? (
              <img 
                src={previewFile.viewLink} 
                alt={previewFile.name}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            ) : previewFile.mimeType.startsWith('video/') ? (
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