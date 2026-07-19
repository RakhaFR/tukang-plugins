'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
// 1. Hapus Instagram, MessageCircle, dan Users dari lucide-react
import { 
  ArrowRight, 
  LayoutGrid, 
  Cpu, 
  ShieldCheck, 
  Download, 
  Star, 
  Loader2, 
  X, 
  Eye 
} from 'lucide-react';

// 2. Tambahkan import Font Awesome di bawahnya
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faTiktok, faWhatsapp, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { faUsers } from '@fortawesome/free-solid-svg-icons';

// Import CSS AOS secara global
import 'aos/dist/aos.css';

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
  const [previewFile, setPreviewFile] = useState<PopularPlugin | null>(null);

  // Inisialisasi AOS secara dinamis di Client Side
  useEffect(() => {
    const initAOS = async () => {
      const AOS = (await import('aos')).default;
      AOS.init({
        duration: 800,     // Durasi animasi (ms)
        once: true,        // Animasi hanya berjalan sekali saat di-scroll
        easing: 'ease-out-quad',
      });
    };
    initAOS();

    // Fetch Data Stats & Plugins
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
    <div style={{ fontFamily: BODY, background: "#111", color: "#f5f5f5", minHeight: "100vh", overflowX: "hidden" }}>

      {/* ── NAV ── */}
      <nav style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 30,
        display: "flex", alignItems: "center",
        padding: "24px 40px",
        justifyContent: 'space-between'
      }}>
        <span style={{ fontFamily: DISPLAY, fontSize: "1.4rem", color: "#fff", letterSpacing: "0.04em"}}>
          XZEARTY
        </span>
        <div style={{ display: "flex", gap: 32, fontSize: "0.875rem", fontWeight: 500, color: "rgba(255,255,255,0.55)" }}>
          {(["#fitur", "#plugin", "#sosial"] as const).map((href, i) => (
            <a
              key={href}
              href={href}
              className="nav-link"
              style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }}
            >
              {["Fitur", "Plugin", "Komunitas"][i]}
            </a>
          ))}
        </div>
        <Link
          href="/plugins"
          className="btn-red-hover"
          style={{
            fontFamily: BODY, fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.05em",
            background: RED, color: "#fff", padding: "10px 22px",
            textDecoration: "none", display: "flex", alignItems: "center", gap: 6,
            transition: "all 0.2s"
          }}
        >
          <Download size={14} />
          Unduh Plugin
        </Link>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: "relative", minHeight: "120vh", display: "flex", alignItems: "center", overflow: "hidden"}}>
        <div 
          style={{ 
            position: "absolute", inset: 0, 
            backgroundImage: "url('/hero.png')", 
            backgroundSize: "cover", backgroundPosition: "center",
            transform: "scale(1.05)"
          }} 
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.85) 40%, rgba(0,0,0,0.25) 100%)" }} />

        <div style={{ position: "relative", zIndex: 10, padding: "0 40px", maxWidth: 660 }}>
          <h1 
            data-aos="fade-right" 
            data-aos-delay="100"
            style={{
              fontFamily: DISPLAY, fontSize: "clamp(4.5rem, 14vw, 10rem)", lineHeight: 1, margin: "0 0 4px", color: "#fff",
              WebkitTextStroke: "5px #C0392B", paintOrder: "stroke fill", marginTop: "5rem"
            }}
          >
            TUKANG
          </h1>

          <h1 
            data-aos="fade-right" 
            data-aos-delay="300"
            style={{
              fontFamily: DISPLAY, fontSize: "clamp(4.5rem, 14vw, 10rem)", lineHeight: 1, margin: "0 0 28px", color: "#fff",
              WebkitTextStroke: "5px #7A9600", paintOrder: "stroke fill",
            }}
          >
            <span style={{ color: LIME }}>PLUGIN</span>
          </h1>

          <p 
            data-aos="fade-up" 
            data-aos-delay="500"
            style={{ fontSize: "1rem", lineHeight: 1.75, color: "rgba(255,255,255,0.6)", maxWidth: 420, marginBottom: 36 }}
          >
            Cari, pantau, dan unduh plugin serta aset kustom berkualitas tinggi untuk kota digital kamu di{" "}
            <strong style={{ color: "#fff", fontWeight: 600 }}>TheoTown</strong>.
          </p>

          <div 
            data-aos="fade-up" 
            data-aos-delay="600"
            style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 52 }}
          >
            <Link
              href="/plugins"
              className="btn-red-hover"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8, background: RED, color: "#fff", 
                fontWeight: 700, fontSize: "0.875rem", padding: "13px 28px", textDecoration: "none", 
                letterSpacing: "0.04em", transition: "all 0.2s"
              }}
            >
              Get Started <ArrowRight size={16} />
            </Link>
            <a
              href="#fitur"
              className="btn-outline-hover"
              style={{
                display: "inline-flex", alignItems: "center", background: "transparent", color: "#fff", 
                fontWeight: 500, fontSize: "0.875rem", padding: "13px 28px", textDecoration: "none", 
                border: "1px solid rgba(255,255,255,0.25)", transition: "all 0.2s"
              }}
            >
              Pelajari Fungsi
            </a>
          </div>

          <div 
            data-aos="fade-up" 
            data-aos-delay="700"
            style={{ display: "flex", gap: 40, flexWrap: "wrap" }}
          >
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
          <p data-aos="zoom-in-right" style={{ fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.2em", color: LIME, textTransform: "uppercase", marginBottom: 10 }}>
            Fitur Unggulan
          </p>
          <h2 data-aos="fade-right" style={{ fontFamily: DISPLAY, fontSize: "clamp(2rem, 5vw, 3.8rem)", color: "#fff", margin: "0 0 56px", lineHeight: 1.1 }}>
            Kenapa Tukang Plugin?
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 1, background: "rgba(255,255,255,0.06)" }}>
            {[
              { icon: <LayoutGrid size={22} />, accent: RED, title: "Manajemen Folder", desc: "Organisasi file terstruktur dari cloud langsung ke server lokal. Rapi, tanpa ribet." },
              { icon: <ShieldCheck size={22} />, accent: LIME, title: "Bebas Error & Duplikat", desc: "Penyaringan ketat. Plugin yang lo unduh 100% aman dan bebas dari crash." },
              { icon: <Cpu size={22} />, accent: "#fff", title: "Instalasi Otomatis", desc: "Panduan praktis buat pemula maupun pro. Install selesai, langsung main." },
            ].map((f, index) => (
              <div 
                key={f.title} 
                data-aos="fade-up"
                data-aos-delay={index * 150}
                className="feature-card"
                style={{ background: "#161616", padding: "36px 32px", transition: "all 0.3s" }}
              >
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
          <p data-aos="zoom-in-right" style={{ fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.2em", color: RED, textTransform: "uppercase", marginBottom: 10 }}>
            Koleksi Live
          </p>
          <div style={{ display: "flex", alignItems: "flex-end", justifyComponet: "space-between", marginBottom: 44, flexWrap: "wrap", gap: 12, justifyContent: 'space-between' }}>
            <h2 data-aos="fade-right" style={{ fontFamily: DISPLAY, fontSize: "clamp(2rem, 5vw, 3.8rem)", color: "#fff", margin: 0, lineHeight: 1.1 }}>
              Terbaru dari Drive
            </h2>
            <Link
              href="/plugins"
              className="text-link-hover"
              style={{ fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.08em", color: RED, textDecoration: "none", display: "flex", alignItems: "center", gap: 5, transition: "color 0.2s" }}
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
              {popularPlugins.map((p, idx) => {
                const mime = p.mimeType || '';
                const isMedia = mime.startsWith('image/') || mime.startsWith('video/');

                return (
                  <div
                    key={p.id}
                    data-aos="fade-up"
                    data-aos-delay={(idx % 3) * 100}
                    className="plugin-card"
                    style={{ 
                      background: "#111", padding: "24px", display: "flex", flexDirection: "column", 
                      justifyContent: "space-between", transition: "all 0.25s" 
                    }}
                  >
                    <div>
                      <div 
                        onClick={() => handleFileAction(p)}
                        className="plugin-thumbnail"
                        style={{
                          width: "100%", aspectRatio: "16/9", background: "#1c1c1c",
                          marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center",
                          overflow: "hidden", position: "relative", border: "1px solid rgba(255,255,255,0.03)", cursor: "pointer",
                          transition: "all 0.3s"
                        }}
                      >
                        {isMedia && p.viewLink ? (
                          <img 
                            src={p.viewLink} 
                            alt={p.name} 
                            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7, transition: "opacity 0.3s" }} 
                            className="thumb-img"
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
                          {p.name}
                        </h3>
                        <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.15em", color: RED, textTransform: "uppercase", marginTop: 2, whiteSpace: "nowrap" }}>
                          .{p.cat.toLowerCase()}
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

                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => handleFileAction(p)}
                          className="plugin-btn-action"
                          style={{
                            flex: 1, background: "transparent",
                            border: `1px solid ${isMedia ? 'rgba(198, 224, 0, 0.3)' : 'rgba(255,255,255,0.13)'}`, 
                            color: isMedia ? LIME : "#fff",
                            fontFamily: BODY, fontWeight: 600, fontSize: "0.78rem",
                            letterSpacing: "0.06em", padding: "9px", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                            transition: "all 0.2s"
                          }}
                          data-ismedia={isMedia}
                        >
                          {isMedia ? <><Eye size={13} /> Preview</> : <><Download size={13} /> Download</>}
                        </button>

                        {isMedia && (
                          <a
                            href={p.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="download-icon-btn"
                            style={{
                              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                              color: "#fff", padding: "9px 12px", display: "flex", alignItems: "center", justifyContent: "center",
                              transition: "all 0.2s"
                            }}
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

      {/* ── 📱 NEW SECTION: SOCIALS & COMMUNITY ── */}
      <section id="sosial" style={{ background: "#161616", padding: "88px 40px", borderTop: "1px solid rgba(255,255,255,0.03)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <p data-aos="zoom-in-right" style={{ fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.2em", color: LIME, textTransform: "uppercase", marginBottom: 10 }}>
            Hubungi & Gabung
          </p>
          <h2 data-aos="fade-right" style={{ fontFamily: DISPLAY, fontSize: "clamp(2rem, 5vw, 3.8rem)", color: "#fff", margin: "0 0 16px", lineHeight: 1.1 }}>
            Komunitas & Sosial
          </h2>
          <p data-aos="fade-right" data-aos-delay="100" style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.45)", maxWidth: 500, marginBottom: 48, lineHeight: 1.6 }}>
            Punya request plugin, butuh bantuan instalasi, atau mau berbagi kreasi kota TheoTown lo? Yuk connect via sosial media dan grup resmi kita!
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16 }}>
            {[
              { 
                name: "Instagram", 
                icon: <FontAwesomeIcon icon={faInstagram} style={{ fontSize: 24 }} />, 
                actionLabel: "Follow @TukangPlugin", 
                href: "https://instagram.com", 
                color: "#E1306C",
                desc: "Update info plugin & sinematik kota terbaru."
              },
              { 
                name: "TikTok", 
                icon: <FontAwesomeIcon icon={faTiktok} style={{ fontSize: 24 }} />, 
                actionLabel: "Tonton Konten", 
                href: "https://tiktok.com", 
                color: "#00f2fe",
                desc: "Review mod, bangunan estetik, & tips gameplay."
              },
              { 
                name: "YouTube Channel", 
                icon: <FontAwesomeIcon icon={faYoutube} style={{ fontSize: 24 }} />, 
                actionLabel: "Subscribe Channel", 
                href: "https://www.youtube.com/@BangRiyadii", 
                color: "#FF0000", // Merah khas YouTube
                desc: "Video tutorial instalasi lengkap, review plugin, dan showcase kota."
              },
              { 
                name: "WhatsApp Admin", 
                icon: <FontAwesomeIcon icon={faWhatsapp} style={{ fontSize: 24 }} />, 
                actionLabel: "Chat Personal", 
                href: "https://wa.me/628xxxxxxxx", 
                color: "#25D366",
                desc: "Layanan support atau kirim request/file bermasalah."
              },
              { 
                name: "Grup WhatsApp", 
                icon: <FontAwesomeIcon icon={faUsers} style={{ fontSize: 22 }} />, 
                actionLabel: "Gabung Komunitas", 
                href: "https://chat.whatsapp.com/invite-code", 
                color: LIME,
                desc: "Mabar, diskusi layout kota, & share folder plugin lokal."
              }
            ].map((s, index) => (
              <a 
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                data-aos="fade-up"
                data-aos-delay={index * 100} // Efek delay AOS biar muncul bergantian secara estetik
                className="social-card"
                style={{
                  background: "#1c1c1c", border: "1px solid rgba(255,255,255,0.04)",
                  padding: "28px 24px", display: "flex", flexDirection: "column",
                  justifyContent: "space-between", textDecoration: "none", transition: "all 0.25s"
                }}
              >
                <div>
                  <div style={{ color: s.color, marginBottom: 16 }}>{s.icon}</div>
                  <h4 style={{ fontFamily: DISPLAY, fontSize: "1.2rem", color: "#fff", margin: "0 0 6px" }}>{s.name}</h4>
                  <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", margin: "0 0 20px", lineHeight: 1.5 }}>{s.desc}</p>
                </div>
                <div 
                  className="social-action-text"
                  style={{ fontSize: "0.82rem", fontWeight: 700, color: s.color, display: "flex", alignItems: "center", gap: 4, transition: "transform 0.2s" }}
                >
                  {s.actionLabel} <ArrowRight size={13} />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: RED, padding: "88px 40px", textAlign: "center" }}>
        <p style={{ fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.2em", color: "rgba(0,0,0,0.35)", textTransform: "uppercase", marginBottom: 14 }}>
          Mulai Sekarang
        </p>
        <h2 
          data-aos="zoom-in"
          style={{ fontFamily: DISPLAY, fontSize: "clamp(2rem, 6vw, 4.5rem)", color: "#fff", margin: "0 0 14px", lineHeight: 1.1 }}
        >
          Siap Bangun Kota Impian?
        </h2>
        <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.72)", marginBottom: 36, maxWidth: 420, marginLeft: "auto", marginRight: "auto", lineHeight: 1.7 }}>
          Ribuan pemain TheoTown udah pake ini. Giliran kamu sekarang.
        </p>
        <Link
          href="/plugins"
          className="btn-white-hover"
          style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "#fff", color: RED, fontWeight: 700,
            fontSize: "0.875rem", letterSpacing: "0.05em",
            padding: "15px 36px", textDecoration: "none", transition: "all 0.2s"
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
          © 2026 · Untuk komunitas BangRiyadi Community's
        </p>
      </footer>

      {/* ── MODAL FULLSCREEN PREVIEW PLAYER ── */}
      {previewFile && (
        <div 
          style={{
            position: 'fixed', inset: 0, zIndex: 999, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.92)',
            backdropFilter: 'blur(8px)', padding: 20
          }}
        >
          <div style={{ width: '100%', maxWidth: 960, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 24 }}>
            <h3 style={{ fontWeight: 600, fontSize: '1rem', color: '#fff', margin: 0 }} className="truncate flex-1">
              {previewFile.name}
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="shrink-0">
              <a 
                href={previewFile.webViewLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-red-hover"
                style={{
                  background: RED, color: '#fff', textDecoration: 'none', fontWeight: 600,
                  fontSize: '0.78rem', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s'
                }}
              >
                <Download size={14} /> Download File
              </a>
              <button 
                onClick={() => setPreviewFile(null)}
                style={{
                  background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: 8,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, transition: 'background 0.2s'
                }}
                className="btn-close-modal"
              >
                <X size={16} /> Tutup
              </button>
            </div>
          </div>

          <div style={{ width: '100%', maxWidth: 960, height: '75vh', backgroundColor: '#090909', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {previewFile.mimeType.startsWith('image/') ? (
              <img src={previewFile.viewLink} alt={previewFile.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            ) : previewFile.mimeType.startsWith('video/') ? (
              <video src={previewFile.viewLink} controls autoPlay style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : null}
          </div>
        </div>
      )}

      {/* ── 🌟 CSS INLINE HOVER STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lilita+One&family=DM+Sans:wght@400;500;600;700&display=swap');
        
        /* Nav Links */
        .nav-link:hover {
          color: #fff !important;
        }

        /* Hover Tombol Utama (Red) */
        .btn-red-hover:hover {
          background: #B71C1C !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(229, 57, 53, 0.3);
        }

        /* Hover Tombol Outline */
        .btn-outline-hover:hover {
          background: rgba(255, 255, 255, 0.08) !important;
          border-color: #fff !important;
        }

        /* Hover Tombol White CTA */
        .btn-white-hover:hover {
          background: #f0f0f0 !important;
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(255, 255, 255, 0.15);
        }

        /* Feature Cards Grid Hover */
        .feature-card:hover {
          background: #1e1e1e !important;
          transform: translateY(-4px);
        }

        /* Plugin Card Grid */
        .plugin-card:hover {
          background: #161616 !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        
        .plugin-card:hover .plugin-thumbnail {
          border-color: rgba(255, 255, 255, 0.1) !important;
        }

        .plugin-card:hover .thumb-img {
          opacity: 1 !important;
          transform: scale(1.03);
        }
        
        /* Tombol download/preview mini di kartu */
        .plugin-btn-action:hover {
          border-color: #E53935 !important;
          color: #E53935 !important;
          background: rgba(229, 57, 53, 0.05) !important;
        }
        
        .plugin-btn-action[data-ismedia="true"]:hover {
          border-color: #C6E000 !important;
          color: #111 !important;
          background: #C6E000 !important;
        }
        
        .download-icon-btn:hover {
          background: rgba(255, 255, 255, 0.15) !important;
          color: #E53935 !important;
        }

        /* Text Link Hover */
        .text-link-hover:hover {
          color: #ff5252 !important;
        }

        /* Social Cards Hover Effect */
        .social-card:hover {
          background: #252525 !important;
          border-color: rgba(255, 255, 255, 0.12) !important;
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.4);
        }

        .social-card:hover .social-action-text {
          transform: translateX(4px);
        }

        .btn-close-modal:hover {
          background: rgba(255, 255, 255, 0.25) !important;
        }
      `}</style>
    </div>
  );
}