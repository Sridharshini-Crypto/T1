import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Calendar, 
  ArrowRight, 
  RotateCcw, 
  Download, 
  X, 
  Film, 
  Sparkles, 
  Users 
} from 'lucide-react';
import './App.css';

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [isIntroDone, setIsIntroDone] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'events' | 'trailer' | 'download'
  const [countdown, setCountdown] = useState({ days: '14', hours: '08', minutes: '45', seconds: '30' });

  const introVideoRef = useRef(null);
  const bgAudioRef = useRef(null);
  const trailerVideoRef = useRef(null);

  // Live Countdown Timer
  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 18);
    targetDate.setHours(targetDate.getHours() + 6);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const diff = targetDate.getTime() - now;
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setCountdown({
          days: String(days).padStart(2, '0'),
          hours: String(hours).padStart(2, '0'),
          minutes: String(minutes).padStart(2, '0'),
          seconds: String(seconds).padStart(2, '0'),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle entering the experience
  const handleEnterExperience = () => {
    setHasEntered(true);
    if (introVideoRef.current) {
      introVideoRef.current.currentTime = 0;
      introVideoRef.current.play().catch(err => {
        console.warn('Autoplay error:', err);
      });
    }
  };

  // Curtains opening transition logic
  const triggerCurtainTransition = () => {
    if (transitioning || isIntroDone) return;
    setFlashActive(true);
    setTransitioning(true);

    setTimeout(() => {
      setFlashActive(false);
    }, 400);

    setTimeout(() => {
      setIsIntroDone(true);
      if (introVideoRef.current) {
        introVideoRef.current.pause();
      }
    }, 1200);
  };

  const handleVideoTimeUpdate = () => {
    // The curtains fully open around frame 185 (7.4s)
    if (introVideoRef.current && introVideoRef.current.currentTime >= 7.3) {
      triggerCurtainTransition();
    }
  };

  // Replay intro video
  const handleReplayIntro = () => {
    setIsIntroDone(false);
    setTransitioning(false);
    setHasEntered(true);
    if (introVideoRef.current) {
      introVideoRef.current.currentTime = 0;
      introVideoRef.current.play();
    }
  };

  // Audio Toggle
  const toggleAudio = () => {
    const nextState = !isAudioMuted;
    setIsAudioMuted(nextState);
    if (introVideoRef.current) {
      introVideoRef.current.muted = nextState;
    }
    if (bgAudioRef.current) {
      bgAudioRef.current.muted = nextState;
    }
  };

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="app-container">
      {/* Background Ambience Audio */}
      <audio ref={bgAudioRef} src="/assets/theatre_audio.mp3" loop />

      {/* ========================================================
          INTRO VIDEO & CURTAIN REVEAL EXPERIENCE
          ======================================================== */}
      {!isIntroDone && (
        <div className={`intro-container ${transitioning ? 'transitioning' : ''}`}>
          {/* Click to Enter Gate for unmuted audio & browser policy */}
          {!hasEntered && (
            <div className="enter-gate">
              <div className="gate-content">
                <div className="gate-badge">IMMERSE × RS PRESENTS</div>
                <h1 className="gate-title">THEATRON</h1>
                <p className="gate-subtitle">Where stories come alive.</p>
                <button className="btn-enter" onClick={handleEnterExperience}>
                  <Play size={16} fill="white" />
                  <span>ENTER EXPERIENCE</span>
                </button>
                <div className="audio-notice">♪ Best experienced with sound</div>
              </div>
            </div>
          )}

          {/* Cleaned Intro Video (Watermark removed, ends at curtains opening) */}
          <video
            ref={introVideoRef}
            className="intro-video"
            playsInline
            preload="auto"
            onTimeUpdate={handleVideoTimeUpdate}
            onEnded={triggerCurtainTransition}
          >
            <source src="/assets/intro.mp4" type="video/mp4" />
          </video>

          {/* Lens Flare / Curtain Transition Flash */}
          <div className={`cinema-flash ${flashActive ? 'active' : ''}`} />

          {/* Intro HUD */}
          {hasEntered && (
            <div className="intro-hud">
              <button className="btn-hud" onClick={triggerCurtainTransition}>
                <span>SKIP TO MAIN PAGE</span>
                <ArrowRight size={14} />
              </button>
              <button className="btn-hud" onClick={toggleAudio} title="Toggle Sound">
                {isAudioMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          MAIN LANDING PAGE (Matches your uploaded design)
          ======================================================== */}
      <main className="main-page">
        {/* Backdrop Visual (Cleaned stage with spotlight on red gown) */}
        <div className="stage-backdrop">
          <img 
            src="/assets/main_page_clean.jpg" 
            alt="Theatron 2026 Stage" 
            className="backdrop-img" 
          />
          <div className="stage-vignette" />
          <div className="stage-particles">
            {[...Array(24)].map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  width: `${(i % 3) + 1.5}px`,
                  height: `${(i % 3) + 1.5}px`,
                  left: `${(i * 4.2) % 100}%`,
                  animationDuration: `${8 + (i % 7)}s`,
                  animationDelay: `${(i * 0.4) % 6}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Top Navbar */}
        <header className="navbar">
          <div className="nav-left">
            <span className="badge-theatron" onClick={handleReplayIntro} title="Click to replay intro">
              THEATRON
            </span>
          </div>

          <div className="nav-center">
            <div className="collab-badge">
              <span className="text-immerse">IMMERSE</span>
              <span className="cross">×</span>
              <span className="text-rs">RS</span>
              <span className="sub-rs">TEAM RESOLUTION</span>
            </div>
          </div>

          <nav className="nav-right">
            <button className="nav-link active">HOME</button>
            <button className="nav-link" onClick={() => setActiveModal('events')}>EVENTS</button>
            <button className="nav-link" onClick={() => setActiveModal('events')}>GALLERY</button>
            <button className="nav-link" onClick={() => setActiveModal('contact')}>CONTACT</button>
          </nav>
        </header>

        {/* Left Rail Controls */}
        <aside className="left-rail">
          <button 
            className="rail-btn" 
            onClick={toggleAudio} 
            title={isAudioMuted ? "Unmute Ambience" : "Mute Ambience"}
          >
            {isAudioMuted ? <VolumeX size={15} /> : <Volume2 size={15} color="var(--text-gold)" />}
          </button>
          <button 
            className="rail-btn" 
            onClick={toggleFullscreen} 
            title="Toggle Fullscreen"
          >
            <Maximize2 size={15} />
          </button>
        </aside>

        {/* Hero Content */}
        <section className="hero-section">
          <div className="hero-left-content">
            <div className="title-block">
              <h1 className="hero-title">THEATRON</h1>
              <div className="hero-year">2026</div>
            </div>

            <div className="tagline-block">
              <span className="tagline-line" />
              <p className="hero-tagline">Where stories come alive.</p>
            </div>

            <div className="countdown-block">
              <div className="countdown-label">YOUR SHOW BEGINS IN</div>
              <div className="countdown-digits">
                <div className="digit-box">
                  <span className="number">{countdown.days}</span>
                  <span className="label">DAYS</span>
                </div>
                <div className="digit-box">
                  <span className="number">{countdown.hours}</span>
                  <span className="label">HOURS</span>
                </div>
                <div className="digit-box">
                  <span className="number">{countdown.minutes}</span>
                  <span className="label">MINUTES</span>
                </div>
                <div className="digit-box">
                  <span className="number">{countdown.seconds}</span>
                  <span className="label">SECONDS</span>
                </div>
              </div>
            </div>

            <div className="cta-actions">
              <button 
                className="btn-cta primary-cta" 
                onClick={() => setActiveModal('events')}
              >
                <span>EXPLORE EVENTS</span>
                <span className="cta-arrow">→</span>
              </button>
              <button 
                className="btn-cta secondary-cta" 
                onClick={() => setActiveModal('trailer')}
              >
                <Play size={13} fill="var(--text-gold)" color="var(--text-gold)" />
                <span>WATCH TRAILER</span>
              </button>
            </div>

            <div className="curtain-status">
              <span className="status-text">CURTAIN RISES</span>
              <span className="status-date">
                <Calendar size={13} />
                <span>DATES TO BE ANNOUNCED</span>
              </span>
            </div>
          </div>
        </section>

        {/* Bottom Footer */}
        <footer className="main-footer">
          <div className="footer-left">
            <button className="btn-replay" onClick={handleReplayIntro} title="Replay Opening Video & Curtains">
              <RotateCcw size={12} />
              <span>REPLAY INTRO</span>
            </button>
            <button className="btn-replay" onClick={() => setActiveModal('download')} title="Download Cleaned Video Files">
              <Download size={12} />
              <span>DOWNLOAD VIDEOS</span>
            </button>
          </div>

          <div className="footer-right">
            <div className="cit-credit">A THEATRE & CINEMA EXPERIENCE</div>
            <div className="cit-college">CHENNAI INSTITUTE OF TECHNOLOGY</div>
          </div>
        </footer>
      </main>

      {/* ========================================================
          MODAL: FEATURED EVENTS
          ======================================================== */}
      {activeModal === 'events' && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveModal(null)}>
              <X size={16} />
            </button>
            <div className="modal-header">
              <div className="modal-tag">THEATRON 2026 FESTIVAL</div>
              <h2 className="modal-title">FEATURED EVENTS</h2>
              <p className="modal-desc">Step into the spotlight and showcase your theatrical and cinematic prowess.</p>
            </div>
            <div className="events-grid">
              <div className="event-card">
                <div className="event-icon">🎭</div>
                <h3>The Stage Play (Nataka)</h3>
                <p>Grand theatrical drama competition. Bring complex human drama, set design, and emotional intensity to life.</p>
                <div className="event-meta">Team: 6-15 Members • Time: 20 Mins</div>
              </div>
              <div className="event-card">
                <div className="event-icon">🎬</div>
                <h3>Cinematics (Short Film)</h3>
                <p>Screening and judging of original short cinema. Direction, narrative cinematography, editing, and sound design.</p>
                <div className="event-meta">Duration: 7-15 Mins • 4K Screening</div>
              </div>
              <div className="event-card">
                <div className="event-icon">👤</div>
                <h3>Monologue Clash</h3>
                <p>One actor. One stage. Pure theatrical expression. Captivate the audience with sheer delivery and presence.</p>
                <div className="event-meta">Solo • Time: 5 Mins</div>
              </div>
              <div className="event-card">
                <div className="event-icon">🎪</div>
                <h3>Street Theatre (Nukkad)</h3>
                <p>Vibrant social satire, booming vocal chorus, and raw acoustic rhythm in the open courtyard.</p>
                <div className="event-meta">Team: 8-20 Members • High Energy</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: WATCH TRAILER
          ======================================================== */}
      {activeModal === 'trailer' && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal-box modal-video-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveModal(null)}>
              <X size={16} />
            </button>
            <div className="trailer-wrapper">
              <video 
                ref={trailerVideoRef} 
                controls 
                autoPlay 
                playsInline
                src="/assets/full_presentation.mp4"
              />
            </div>
            <div className="trailer-caption">
              <h3>THEATRON 2026 — Official Cinematic Teaser</h3>
              <p>A Theatre & Cinema Experience presented by IMMERSE × Team Resolution at Chennai Institute of Technology.</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: DOWNLOAD CLEANED VIDEOS
          ======================================================== */}
      {activeModal === 'download' && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveModal(null)}>
              <X size={16} />
            </button>
            <div className="modal-header">
              <div className="modal-tag">POLISHED MEDIA ASSETS</div>
              <h2 className="modal-title">DOWNLOAD GENERATED VIDEOS</h2>
              <p className="modal-desc">Both versions have the Gemini watermark removed frame-by-frame and rendered in 720p H.264.</p>
            </div>
            <div className="download-list">
              <a 
                href="/assets/full_presentation.mp4" 
                download="Theatron_Complete_Animation_Video.mp4" 
                className="download-item"
              >
                <div className="download-info">
                  <strong>1. Complete Animation Video (Full Presentation)</strong>
                  <span>Dark theatre glide → Curtains opening → Smooth zoom & reveal into Main Page (12.8s)</span>
                </div>
                <span className="btn-dl">DOWNLOAD MP4</span>
              </a>
              <a 
                href="/assets/intro.mp4" 
                download="Theatron_Curtains_Opening_Clean.mp4" 
                className="download-item"
              >
                <div className="download-info">
                  <strong>2. Cleaned Intro Video (Curtains Opening Cut)</strong>
                  <span>Glides through theatre and stops right as curtains part (7.8s, No watermark, No old text)</span>
                </div>
                <span className="btn-dl">DOWNLOAD MP4</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: CONTACT
          ======================================================== */}
      {activeModal === 'contact' && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveModal(null)}>
              <X size={16} />
            </button>
            <div className="modal-header">
              <div className="modal-tag">GET IN TOUCH</div>
              <h2 className="modal-title">CONNECT WITH THEATRON</h2>
              <p className="modal-desc">Organized by Team Resolution & IMMERSE at Chennai Institute of Technology.</p>
            </div>
            <div style={{ color: '#ccc', lineHeight: 1.8, fontSize: '14px' }}>
              <p>📍 <strong>Venue:</strong> Chennai Institute of Technology, Kundrathur, Chennai</p>
              <p>✉️ <strong>Email:</strong> theatron@citchennai.net</p>
              <p>🎭 <strong>Instagram:</strong> @theatron_cit | @team_resolution</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

