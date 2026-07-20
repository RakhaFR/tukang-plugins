'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  LayoutGrid, 
  Cpu, 
  ShieldCheck, 
  Download, 
  Star, 
  Loader2, 
  X, 
  Eye,
  Play
} from 'lucide-react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faTiktok, faWhatsapp, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { faUsers } from '@fortawesome/free-solid-svg-icons';

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
  const [pageReady, setPageReady] = useState(false);
  const [stats, setStats] = useState({ totalPlugins: 0, totalCategories: 0, totalDownloads: 0, visits: 0 });
  const [popularPlugins, setPopularPlugins] = useState<PopularPlugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState<PopularPlugin | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // State counter animasi
  const [displayPlugins, setDisplayPlugins] = useState(0);
  const [displayDownloads, setDisplayDownloads] = useState(0);
  const [displayVisits, setDisplayVisits] = useState(0);

  // State rating modal
  const [showRateModal, setShowRateModal] = useState(false);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [hoveredStar, setHoveredStar] = useState<number>(0);

  // Fungsi animasi counter dari 0 ke target
  const animateCount = (target: number, setter: (v: number) => void, duration = 1500) => {
    if (target === 0) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setter(target);
        clearInterval(timer);
      } else {
        setter(start);
      }
    }, 16);
  };

  useEffect(() => {
    const initAOS = async () => {
      const AOS = (await import('aos')).default;
      AOS.init({ duration: 800, once: true, easing: 'ease-out-quad' });
    };

    // Preload hero image dulu sebelum tampilkan halaman
    const img = new Image();
    img.src = '/hero.png';
    img.onload = () => setPageReady(true);
    img.onerror = () => setPageReady(true);

    initAOS();
    fetch('/api/drive/visit', { method: 'POST' }).catch(() => {});
    fetch('/api/drive/stats')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setStats(resData.stats);
          setPopularPlugins(resData.popularPlugins);
          animateCount(resData.stats.totalPlugins, setDisplayPlugins);
          animateCount(resData.stats.totalDownloads, setDisplayDownloads);
          animateCount(resData.stats.visits, setDisplayVisits);
        }
      })
      .catch((err) => console.error('Gagal memuat statistik landing:', err))
      .finally(() => setLoading(false));
  }, []);

  const trackDownload = async (file: PopularPlugin) => {
    try {
      await fetch('/api/drive/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fileId: file.id,
          fileName: file.name,
          fileCat: file.cat
        })
      });
      console.log(`✅ Download tracked untuk: ${file.name}`);
    } catch (err) {
      console.error("Gagal tracking download root:", err);
    }
  };

  // Preview saja — tidak track download, tidak nambah counter
  const handlePreviewAction = (file: PopularPlugin) => {
    const mime = file.mimeType || '';
    const isImage = mime.startsWith('image/');
    const isVideo = mime.startsWith('video/');
    if (isImage || isVideo) {
      setPreviewFile(file);
    }
  };

  // Download — track + nambah counter + munculin rating
  const handleDownloadAction = async (file: PopularPlugin) => {
    setPopularPlugins((prev) =>
      prev.map((p) =>
        p.id === file.id ? { ...p, dl: String(parseInt(p.dl || '0') + 1) } : p
      )
    );
    await trackDownload(file);
    const hasRated = localStorage.getItem(`rated_${file.id}`);
    if (!hasRated) {
      setTimeout(() => {
        setActiveFileId(file.id);
        setShowRateModal(true);
      }, 1500);
    }

const fileName = file.name;
const downloadUrl = `/api/drive/download?id=${file.id}&name=${encodeURIComponent(fileName)}`;

try {
  const response = await fetch(downloadUrl);
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(blobUrl);
} catch (err) {
  console.error("Download gagal:", err);
  window.open(`https://drive.google.com/uc?export=download&id=${file.id}`, '_blank');
}
  };

  const handleSendRating = async (starRating: number) => {
    if (!activeFileId) return;
    try {
      await fetch('/api/drive/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: activeFileId, stars: starRating })
      });
      localStorage.setItem(`rated_${activeFileId}`, 'true');
    } catch (err) {
      console.error("Gagal mengirim rating:", err);
    } finally {
      setShowRateModal(false);
      setActiveFileId(null);
      setHoveredStar(0);
    }
  };

  return (
    <div style={{ fontFamily: BODY, background: "#111", color: "#f5f5f5", minHeight: "100vh", overflowX: "hidden" }}>
      {/* ── LOADING SCREEN ── */}
      {!pageReady && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: '#111',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 20,
          animation: 'fadeOut 0.4s ease forwards',
          animationDelay: pageReady ? '0s' : '999s'
        }}>
          <span style={{ fontFamily: DISPLAY, fontSize: '2rem', color: '#fff', letterSpacing: '0.04em' }}>
            Tukang<span style={{ color: '#C6E000' }}>Plugin</span>
          </span>
          <div style={{ width: 180, height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%', background: '#E53935',
              animation: 'loadBar 1.2s ease-in-out forwards'
            }} />
          </div>
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Memuat aset...
          </span>
        </div>
      )}

      {/* ── NAV ── */}
      <nav className="nav-bar" style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", alignItems: "center",
        padding: "18px 40px",
        justifyContent: 'space-between',
        background: "rgba(17,17,17,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)"
      }}>
        <span style={{ fontFamily: DISPLAY, fontSize: "1.4rem", color: "#fff", letterSpacing: "0.04em" }}>
          TukangPlugin
        </span>

        <div className="nav-links-desktop" style={{ display: "flex", gap: 32, fontSize: "0.875rem", fontWeight: 500, color: "rgba(255,255,255,0.55)" }}>
          {(["#fitur", "#plugin", "#sosial"] as const).map((href, i) => (
            <a key={href} href={href} className="nav-link" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }}>
              {["Fitur", "Plugin", "Komunitas"][i]}
            </a>
          ))}
        </div>

        <Link
          href="/plugins"
          className="btn-red-hover nav-cta-desktop"
          style={{
            fontFamily: BODY, fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.05em",
            background: RED, color: "#fff", padding: "10px 22px",
            textDecoration: "none", display: "flex", alignItems: "center", gap: 6,
            transition: "all 0.2s"
          }}
        >
          <Download size={14} /> Unduh Plugin
        </Link>

        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ display: "none", background: "none", border: "none", cursor: "pointer", flexDirection: "column", gap: 5, padding: 6 }}
          aria-label="Toggle menu"
        >
          <span className={`ham-line ${menuOpen ? 'ham-open-1' : ''}`} />
          <span className={`ham-line ${menuOpen ? 'ham-open-2' : ''}`} />
          <span className={`ham-line ${menuOpen ? 'ham-open-3' : ''}`} />
        </button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="mobile-menu" style={{
          position: "fixed", top: 61, left: 0, right: 0, zIndex: 49,
          background: "#161616", borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex", flexDirection: "column", padding: "16px 24px 20px", gap: 4
        }}>
          {(["#fitur", "#plugin", "#sosial"] as const).map((href, i) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)} style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: "1rem", fontWeight: 500, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {["Fitur", "Plugin", "Komunitas"][i]}
            </a>
          ))}
          <Link href="/plugins" onClick={() => setMenuOpen(false)} style={{ marginTop: 12, background: RED, color: "#fff", fontWeight: 700, fontSize: "0.875rem", padding: "12px 20px", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Download size={14} /> Unduh Plugin
          </Link>
        </div>
      )}

      {/* ── HERO ── */}
      <section style={{ position: "relative", minHeight: "100svh", display: "flex", alignItems: "center", overflow: "hidden", paddingTop: 61 }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/hero.png')", backgroundSize: "cover", backgroundPosition: "center", transform: "scale(1.05)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.88) 45%, rgba(0,0,0,0.2) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(17,17,17,0.7) 0%, transparent 50%)" }} />

        <div className="hero-content" style={{ position: "relative", zIndex: 10, padding: "60px 40px 80px", maxWidth: 700, width: "100%" }}>
          <h1 data-aos="fade-right" data-aos-delay="100" className="hero-title" style={{ fontFamily: DISPLAY, fontSize: "clamp(3.5rem, 14vw, 10rem)", lineHeight: 1, margin: "0 0 4px", color: "#fff", WebkitTextStroke: "4px #C0392B", paintOrder: "stroke fill" }}>
            TUKANG
          </h1>
          <h1 data-aos="fade-right" data-aos-delay="300" className="hero-title" style={{ fontFamily: DISPLAY, fontSize: "clamp(3.5rem, 14vw, 10rem)", lineHeight: 1, margin: "0 0 24px", color: "#fff", WebkitTextStroke: "4px #7A9600", paintOrder: "stroke fill" }}>
            <span style={{ color: LIME }}>PLUGIN</span>
          </h1>

          <p data-aos="fade-up" data-aos-delay="500" className="hero-desc" style={{ fontSize: "0.95rem", lineHeight: 1.75, color: "rgba(255,255,255,0.65)", maxWidth: 420, marginBottom: 32 }}>
            Cari, pantau, dan unduh plugin serta aset kustom berkualitas tinggi untuk kota digital kamu di{" "}
            <strong style={{ color: "#fff", fontWeight: 600 }}>TheoTown</strong>.
          </p>

          <div data-aos="fade-up" data-aos-delay="600" className="hero-buttons" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 44 }}>
            <Link href="/plugins" className="btn-red-hover" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: RED, color: "#fff", fontWeight: 700, fontSize: "0.875rem", padding: "13px 28px", textDecoration: "none", letterSpacing: "0.04em", transition: "all 0.2s" }}>
              Get Started <ArrowRight size={16} />
            </Link>
            <a href="#fitur" className="btn-outline-hover" style={{ display: "inline-flex", alignItems: "center", background: "transparent", color: "#fff", fontWeight: 500, fontSize: "0.875rem", padding: "13px 28px", textDecoration: "none", border: "1px solid rgba(255,255,255,0.25)", transition: "all 0.2s" }}>
              Pelajari Fungsi
            </a>
          </div>

          {/* ── HERO STATS dengan counter animasi ── */}
          <div data-aos="fade-up" data-aos-delay="700" className="hero-stats" style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            {[
              { v: loading ? "..." : `${displayPlugins.toLocaleString()}+`, l: "File Plugin", c: RED },
              { v: loading ? "..." : `${displayDownloads.toLocaleString()}+`, l: "Total Download", c: LIME },
              { v: loading ? "..." : `${displayVisits.toLocaleString()}+`, l: "Pengunjung", c: "#fff" },
            ].map(s => (
              <div key={s.l}>
                <div style={{ fontFamily: DISPLAY, fontSize: "clamp(1.8rem, 6vw, 2.5rem)", color: s.c, lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontSize: "0.68rem", fontWeight: 600, color: "rgba(255,255,255,0.38)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="fitur" style={{ background: "#161616", padding: "72px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <p data-aos="zoom-in-right" style={{ fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.2em", color: LIME, textTransform: "uppercase", marginBottom: 10 }}>Fitur Unggulan</p>
          <h2 data-aos="fade-right" style={{ fontFamily: DISPLAY, fontSize: "clamp(1.8rem, 5vw, 3.8rem)", color: "#fff", margin: "0 0 48px", lineHeight: 1.1 }}>Kenapa Tukang Plugin?</h2>
          <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 1, background: "rgba(255,255,255,0.06)" }}>
            {[
              { icon: <LayoutGrid size={22} />, accent: RED, title: "Manajemen Folder", desc: "Organisasi file terstruktur dari cloud langsung ke server lokal. Rapi, tanpa ribet." },
              { icon: <ShieldCheck size={22} />, accent: LIME, title: "Bebas Error & Duplikat", desc: "Penyaringan ketat. Plugin yang lo unduh 100% aman dan bebas dari crash." },
              { icon: <Cpu size={22} />, accent: "#fff", title: "Instalasi Otomatis", desc: "Panduan praktis buat pemula maupun pro. Install selesai, langsung main." },
            ].map((f, index) => (
              <div key={f.title} data-aos="fade-up" data-aos-delay={index * 150} className="feature-card" style={{ background: "#161616", padding: "32px 28px", transition: "all 0.3s" }}>
                <div style={{ color: f.accent, marginBottom: 18 }}>{f.icon}</div>
                <h3 style={{ fontFamily: DISPLAY, fontSize: "1.4rem", color: "#fff", margin: "0 0 10px", lineHeight: 1.1 }}>{f.title}</h3>
                <p style={{ fontSize: "0.88rem", lineHeight: 1.7, color: "rgba(255,255,255,0.45)", margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLUGINS ── */}
      <section id="plugin" style={{ background: "#111", padding: "72px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <p data-aos="zoom-in-right" style={{ fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.2em", color: RED, textTransform: "uppercase", marginBottom: 10 }}>Koleksi Live</p>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 36, flexWrap: "wrap", gap: 12 }}>
            <h2 data-aos="fade-right" style={{ fontFamily: DISPLAY, fontSize: "clamp(1.8rem, 5vw, 3.8rem)", color: "#fff", margin: 0, lineHeight: 1.1 }}>Terbaru dari Drive</h2>
            <Link href="/plugins" className="text-link-hover" style={{ fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.08em", color: RED, textDecoration: "none", display: "flex", alignItems: "center", gap: 5, transition: "color 0.2s" }}>
              LIHAT SEMUA <ArrowRight size={13} />
            </Link>
          </div>

          {loading && (
            <div style={{ display: "flex", justifyContent: "center", padding: "40px 0", color: "rgba(255,255,255,0.4)" }}>
              <Loader2 style={{ animation: "spin 1s linear infinite" }} size={24} />
            </div>
          )}

          {!loading && (
            <div className="plugins-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 1, background: "rgba(255,255,255,0.05)" }}>
              {popularPlugins.map((p, idx) => {
                const mime = p.mimeType || '';
                const isMedia = mime.startsWith('image/') || mime.startsWith('video/');
                const isImage = mime.startsWith('image/');
                const isVideo = mime.startsWith('video/');
                return (
                  <div key={`${p.id}-${p.dl}`} data-aos="fade-up" data-aos-delay={(idx % 3) * 100} className="plugin-card" style={{ background: "#111", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", transition: "all 0.25s" }}>
                    <div>
                      {/* Thumbnail — hanya preview, tidak track download */}
                      <div onClick={() => handlePreviewAction(p)} className="plugin-thumbnail" style={{ width: "100%", aspectRatio: "16/9", background: "#1c1c1c", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative", border: "1px solid rgba(255,255,255,0.03)", cursor: isMedia ? "pointer" : "default", transition: "all 0.3s" }}>
                        {isImage && p.viewLink ? (
                          <img
                            src={p.viewLink}
                            alt={p.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7, transition: "opacity 0.3s" }}
                            className="thumb-img"
                          />
                        ) : isVideo ? (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                            <Play size={28} style={{ color: LIME, opacity: 0.7 }} />
                            <span style={{ fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.14em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>
                              Video Preview
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.14em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>
                            {p.cat} FILE
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6, gap: 8 }}>
                        {/* Nama file — hanya preview, tidak track download */}
                        <h3 onClick={() => handlePreviewAction(p)} style={{ fontWeight: 600, fontSize: "0.9rem", color: "#fff", margin: 0, lineHeight: 1.3, cursor: isMedia ? "pointer" : "default" }}>{p.name}</h3>
                        <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.15em", color: RED, textTransform: "uppercase", marginTop: 2, whiteSpace: "nowrap" }}>.{p.cat.toLowerCase()}</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.35)", fontSize: "0.75rem" }}>
                          <Star size={11} style={{ color: LIME, fill: LIME }} />
                          <span>{p.rating}</span>
                          <span style={{ color: "rgba(255,255,255,0.2)" }}>({p.dl} unduh)</span>
                        </div>
                        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.28)" }}>{p.rawSize}</span>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {/* Tombol utama: Preview untuk media, Download untuk file biasa */}
                        <button
                          onClick={() => isMedia ? handlePreviewAction(p) : handleDownloadAction(p)}
                          className="plugin-btn-action"
                          style={{ flex: 1, background: "transparent", border: `1px solid ${isMedia ? 'rgba(198, 224, 0, 0.3)' : 'rgba(255,255,255,0.13)'}`, color: isMedia ? LIME : "#fff", fontFamily: BODY, fontWeight: 600, fontSize: "0.78rem", letterSpacing: "0.06em", padding: "9px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.2s" }}
                          data-ismedia={isMedia}
                        >
                          {isImage ? <><Eye size={13} /> Preview</> : isVideo ? <><Play size={13} /> Preview</> : <><Download size={13} /> Download</>}
                        </button>
                        {/* Tombol download ikon — khusus media (foto & video) */}
                        {isMedia && (
                          <button
                            onClick={() => handleDownloadAction(p)}
                            className="download-icon-btn"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "9px 12px", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", cursor: "pointer" }}
                            title="Download Langsung"
                          >
                            <Download size={13} />
                          </button>
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

      {/* ── SOCIALS ── */}
      <section id="sosial" style={{ background: "#161616", padding: "72px 24px", borderTop: "1px solid rgba(255,255,255,0.03)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <p data-aos="zoom-in-right" style={{ fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.2em", color: LIME, textTransform: "uppercase", marginBottom: 10 }}>Hubungi & Gabung</p>
          <h2 data-aos="fade-right" style={{ fontFamily: DISPLAY, fontSize: "clamp(1.8rem, 5vw, 3.8rem)", color: "#fff", margin: "0 0 12px", lineHeight: 1.1 }}>Komunitas & Sosial</h2>
          <p data-aos="fade-right" data-aos-delay="100" style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.45)", maxWidth: 500, marginBottom: 44, lineHeight: 1.6 }}>
            Punya request plugin, butuh bantuan instalasi, atau mau berbagi kreasi kota TheoTown lo? Yuk connect via sosial media dan grup resmi kita!
          </p>
          <div className="socials-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {[
              { name: "Instagram", icon: <FontAwesomeIcon icon={faInstagram} style={{ fontSize: 24 }} />, actionLabel: "Follow @TukangPlugin", href: "https://instagram.com", color: "#E1306C", desc: "Update info plugin & sinematik kota terbaru." },
              { name: "TikTok", icon: <FontAwesomeIcon icon={faTiktok} style={{ fontSize: 24 }} />, actionLabel: "Tonton Konten", href: "https://tiktok.com", color: "#00f2fe", desc: "Review mod, bangunan estetik, & tips gameplay." },
              { name: "YouTube Channel", icon: <FontAwesomeIcon icon={faYoutube} style={{ fontSize: 24 }} />, actionLabel: "Subscribe Channel", href: "https://www.youtube.com/@BangRiyadii", color: "#FF0000", desc: "Video tutorial instalasi lengkap, review plugin, dan showcase kota." },
              { name: "WhatsApp Admin", icon: <FontAwesomeIcon icon={faWhatsapp} style={{ fontSize: 24 }} />, actionLabel: "Chat Personal", href: "https://wa.me/628xxxxxxxx", color: "#25D366", desc: "Layanan support atau kirim request/file bermasalah." },
              { name: "Grup WhatsApp", icon: <FontAwesomeIcon icon={faUsers} style={{ fontSize: 22 }} />, actionLabel: "Gabung Komunitas", href: "https://chat.whatsapp.com/invite-code", color: LIME, desc: "Mabar, diskusi layout kota, & share folder plugin lokal." }
            ].map((s, index) => (
              <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" data-aos="fade-up" data-aos-delay={index * 100} className="social-card" style={{ background: "#1c1c1c", border: "1px solid rgba(255,255,255,0.04)", padding: "24px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between", textDecoration: "none", transition: "all 0.25s" }}>
                <div>
                  <div style={{ color: s.color, marginBottom: 14 }}>{s.icon}</div>
                  <h4 style={{ fontFamily: DISPLAY, fontSize: "1.15rem", color: "#fff", margin: "0 0 6px" }}>{s.name}</h4>
                  <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", margin: "0 0 16px", lineHeight: 1.5 }}>{s.desc}</p>
                </div>
                <div className="social-action-text" style={{ fontSize: "0.82rem", fontWeight: 700, color: s.color, display: "flex", alignItems: "center", gap: 4, transition: "transform 0.2s" }}>
                  {s.actionLabel} <ArrowRight size={13} />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: RED, padding: "72px 24px", textAlign: "center" }}>
        <p style={{ fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.2em", color: "rgba(0,0,0,0.35)", textTransform: "uppercase", marginBottom: 14 }}>Mulai Sekarang</p>
        <h2 data-aos="zoom-in" style={{ fontFamily: DISPLAY, fontSize: "clamp(1.8rem, 6vw, 4.5rem)", color: "#fff", margin: "0 0 14px", lineHeight: 1.1 }}>Siap Bangun Kota Impian?</h2>
        <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.72)", marginBottom: 36, maxWidth: 420, marginLeft: "auto", marginRight: "auto", lineHeight: 1.7 }}>
          Ribuan pemain TheoTown udah pake ini. Giliran kamu sekarang.
        </p>
        <Link href="/plugins" className="btn-white-hover" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#fff", color: RED, fontWeight: 700, fontSize: "0.875rem", letterSpacing: "0.05em", padding: "15px 36px", textDecoration: "none", transition: "all 0.2s" }}>
          <Download size={16} /> Dashboard Download
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer-bar" style={{ background: "#0d0d0d", padding: "24px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <span style={{ fontFamily: DISPLAY, fontSize: "1.1rem", color: "#fff", letterSpacing: "0.04em" }}>TukangPlugin</span>
        <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.28)", margin: 0 }}>© 2026 · Untuk komunitas BangRiyadi Community's</p>
      </footer>

      {/* ── MODAL PREVIEW ── */}
      {previewFile && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(8px)', padding: 16 }}>
          <div className="modal-header" style={{ width: '100%', maxWidth: 960, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 16 }}>
            <h3 style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{previewFile.name}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              {/* Tombol Download di modal — track + rating */}
              <button
                onClick={() => handleDownloadAction(previewFile)}
                className="btn-red-hover"
                style={{ background: RED, color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.75rem', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s', cursor: 'pointer' }}
              >
                <Download size={13} /> Download
              </button>
              <button onClick={() => setPreviewFile(null)} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, transition: 'background 0.2s', fontSize: '0.8rem', fontWeight: 600 }} className="btn-close-modal">
                <X size={15} /> Tutup
              </button>
            </div>
          </div>
          <div style={{ width: '100%', maxWidth: 960, flex: 1, maxHeight: '80vh', backgroundColor: '#090909', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {previewFile.mimeType.startsWith('image/') ? (
              <img src={previewFile.viewLink} alt={previewFile.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            ) : previewFile.mimeType.startsWith('video/') ? (
              <video src={previewFile.viewLink} controls autoPlay style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : null}
          </div>
        </div>
      )}

      {/* ── RATING MODAL ── */}
      {showRateModal && activeFileId && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800/80 p-6 sm:p-8 text-center shadow-2xl scale-up-center" style={{ fontFamily: BODY }}>
            <button onClick={() => { setShowRateModal(false); setActiveFileId(null); }} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-slate-800">
              <X size={18} />
            </button>
            <div className="text-3xl sm:text-4xl mb-3">⭐</div>
            <h3 style={{ fontFamily: DISPLAY }} className="text-xl sm:text-2xl text-white tracking-wide mb-2">Bantu Rating Dong!</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6 px-2">
              Gimana kualitas plugin barusan? Satu klik bintang lo sangat berharga buat kemajuan orang lain yang ingin download.
            </p>
            <div className="flex justify-center items-center gap-2 sm:gap-3 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onMouseEnter={() => setHoveredStar(star)} onMouseLeave={() => setHoveredStar(0)} onClick={() => handleSendRating(star)}
                  className="text-3xl sm:text-4xl transition-all duration-150 transform hover:scale-125 focus:outline-none"
                  style={{ color: star <= (hoveredStar || 0) ? '#FFC107' : 'rgba(255,255,255,0.15)', textShadow: star <= (hoveredStar || 0) ? '0 0 12px rgba(255,193,7,0.4)' : 'none' }}>
                  ★
                </button>
              ))}
            </div>
            <button onClick={() => { setShowRateModal(false); setActiveFileId(null); }} className="text-xs text-slate-500 hover:text-slate-400 underline transition-colors focus:outline-none">
              Nanti aja, makasih
            </button>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lilita+One&family=DM+Sans:wght@400;500;600;700&display=swap');
        .animate-fade-in { animation: fadeIn 0.25s ease-out forwards; }
        .scale-up-center { animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .ham-line { display: block; width: 22px; height: 2px; background: #fff; transition: all 0.3s; transform-origin: center; }
        .ham-open-1 { transform: translateY(7px) rotate(45deg); }
        .ham-open-2 { opacity: 0; }
        .ham-open-3 { transform: translateY(-7px) rotate(-45deg); }
        .nav-link:hover { color: #fff !important; }
        .btn-red-hover:hover { background: #B71C1C !important; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(229,57,53,0.3); }
        .btn-outline-hover:hover { background: rgba(255,255,255,0.08) !important; border-color: #fff !important; }
        .btn-white-hover:hover { background: #f0f0f0 !important; transform: translateY(-3px); box-shadow: 0 8px 24px rgba(255,255,255,0.15); }
        .btn-close-modal:hover { background: rgba(255,255,255,0.25) !important; }
        .feature-card:hover { background: #1e1e1e !important; transform: translateY(-4px); }
        .plugin-card:hover { background: #161616 !important; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .plugin-card:hover .plugin-thumbnail { border-color: rgba(255,255,255,0.1) !important; }
        .plugin-card:hover .thumb-img { opacity: 1 !important; transform: scale(1.03); }
        .plugin-btn-action:hover { border-color: #E53935 !important; color: #E53935 !important; background: rgba(229,57,53,0.05) !important; }
        .plugin-btn-action[data-ismedia="true"]:hover { border-color: #C6E000 !important; color: #111 !important; background: #C6E000 !important; }
        .download-icon-btn:hover { background: rgba(255,255,255,0.15) !important; color: #E53935 !important; }
        .text-link-hover:hover { color: #ff5252 !important; }
        .social-card:hover { background: #252525 !important; border-color: rgba(255,255,255,0.04) !important; transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.4); }
        .social-card:hover .social-action-text { transform: translateX(4px); }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes loadBar {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; pointer-events: none; }
        }
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .nav-cta-desktop { display: none !important; }
          .hamburger { display: flex !important; }
          .hero-content { padding: 80px 24px 60px !important; }
          .hero-buttons { flex-direction: column !important; }
          .hero-buttons a, .hero-buttons a + a { width: 100%; justify-content: center; }
          .hero-stats { gap: 24px !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .plugins-grid { grid-template-columns: 1fr 1fr !important; }
          .socials-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .plugins-grid { grid-template-columns: 1fr !important; }
          .socials-grid { grid-template-columns: 1fr !important; }
          .hero-stats { flex-direction: row; flex-wrap: wrap; gap: 20px !important; }
          .modal-header { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
          .modal-header > div { width: 100%; justify-content: flex-end; }
          .footer-bar { flex-direction: column; text-align: center; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { transition: none !important; animation: none !important; }
          [data-aos] { opacity: 1 !important; transform: none !important; }
        }
      `}</style>
    </div>
  );
}