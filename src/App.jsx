'use client';

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
  Sparkles 
} from 'lucide-react';

export default function TheatronPage() {
  const [transitioning, setTransitioning] = useState(false);
  const [isIntroDone, setIsIntroDone] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [activeView, setActiveView] = useState('hero'); // 'hero' | 'events' | 'trailer' | 'download'
  const [countdown, setCountdown] = useState({ days: '14', hours: '08', minutes: '45', seconds: '30' });

  const introVideoRef = useRef(null);
  const bgAudioRef = useRef(null);
  const trailerVideoRef = useRef(null);

  // 1. Live Countdown Timer to Theatron 2026
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

  // 2. DIRECT START: Video autoplays immediately on page load; mild audio (0.28) unfreezes on interaction
  useEffect(() => {
    const video = introVideoRef.current;
    if (video) {
      video.muted = true;
      video.defaultMuted = true;
      video.volume = 0.28;

      // Reliable autoplay start
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Autoplay successfully running
          })
          .catch((err) => {
            console.log("Autoplay waiting for gesture:", err);
            video.muted = true;
            video.play().catch(() => {});
          });
      }

      // Smoothly activate mild atmospheric sound (0.28) upon user's first touch/click anywhere
      const unlockAudio = () => {
        if (video) {
          if (video.paused) {
            video.play().catch(() => {});
          }
          video.muted = false;
          video.volume = 0.28;
          setIsAudioMuted(false);
        }
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      };

      window.addEventListener('click', unlockAudio);
      window.addEventListener('keydown', unlockAudio);
      window.addEventListener('touchstart', unlockAudio);

      return () => {
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      };
    }
  }, []);

  // 3. Curtains opening transition logic (at ~7.3s)
  const triggerCurtainTransition = () => {
    if (transitioning || isIntroDone) return;
    setFlashActive(true);
    setTransitioning(true);

    setTimeout(() => {
      setFlashActive(false);
    }, 450);

    setTimeout(() => {
      setIsIntroDone(true);
      if (introVideoRef.current) {
        introVideoRef.current.pause();
      }
    }, 1100);
  };

  const handleVideoTimeUpdate = () => {
    // The curtains fully open around 7.3s
    if (introVideoRef.current && introVideoRef.current.currentTime >= 7.3) {
      triggerCurtainTransition();
    }
  };

  // Replay intro video
  const handleReplayIntro = () => {
    setActiveView('hero');
    setIsIntroDone(false);
    setTransitioning(false);
    if (introVideoRef.current) {
      introVideoRef.current.currentTime = 0;
      introVideoRef.current.volume = 0.28;
      introVideoRef.current.play();
    }
  };

  // Audio Toggle
  const toggleAudio = (e) => {
    if (e) e.stopPropagation();
    const nextState = !isAudioMuted;
    setIsAudioMuted(nextState);
    if (introVideoRef.current) {
      introVideoRef.current.muted = nextState;
      if (!nextState) introVideoRef.current.volume = 0.28;
    }
    if (bgAudioRef.current) {
      bgAudioRef.current.muted = nextState;
      if (!nextState) {
        bgAudioRef.current.volume = 0.25;
        bgAudioRef.current.play().catch(err => console.log(err));
      }
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
    <div className="theatron-stage-viewport">
      {/* Background Ambience Audio */}
      <audio ref={bgAudioRef} src="/assets/theatre_audio.mp3" loop />

      {/* ========================================================
          1. INTRO: DIRECT 8K THEATRE CAMERA & CURTAINS SEQUENCE
          No gate screens. Starts playing immediately.
          ======================================================== */}
      {!isIntroDone && (
        <div className={`intro-cinema-layer ${transitioning ? 'transitioning' : ''}`}>
          <video
            ref={introVideoRef}
            className="cinema-projection-video"
            playsInline
            autoPlay
            muted
            preload="auto"
            onTimeUpdate={handleVideoTimeUpdate}
            onEnded={triggerCurtainTransition}
          >
            <source src="/assets/intro.mp4" type="video/mp4" />
          </video>

          {/* Anamorphic Lens Flare Sweep on Curtains Opening */}
          <div className={`cinema-flash ${flashActive ? 'active' : ''}`} />

          {/* Minimal Cinema HUD */}
          <div className="cinema-hud">
            <button className="hud-btn" onClick={triggerCurtainTransition}>
              <span>SKIP TO STAGE</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          2. MAIN THEATRICAL STAGE EXPERIENCE
          Zero duplicates: Uses clean backdrop without baked-in text.
          Wide cinematic scene with live typography, countdown & actions.
          ======================================================== */}
      <div className={`theatre-scene-container ${isIntroDone ? 'visible' : 'prerender'}`}>
        {/* Full-bleed Pristine Theatrical Backdrop (Pristine stage, NO baked text) */}
        <div className="theatre-stage-environment">
          <img 
            src="/assets/stage_backdrop_hd.jpg" 
            alt="Theatron 2026 Stage" 
            className="stage-backdrop-visual" 
          />
          <div className="theatre-light-cone" />
          <div className="theatre-edge-vignette" />

          {/* Golden Theatre Dust Motes */}
          <div className="spotlight-particles">
            {[...Array(26)].map((_, i) => (
              <span
                key={i}
                className="dust-mote"
                style={{
                  width: `${(i % 3) + 1.2}px`,
                  height: `${(i % 3) + 1.2}px`,
                  left: `${52 + ((i * 3.8) % 36)}%`,
                  animationDuration: `${7 + (i % 8)}s`,
                  animationDelay: `${(i * 0.35) % 5}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Minimalist Top Theatrical Bar */}
        <header className="theatre-top-bar">
          <div className="bar-left">
            <div className="theatron-badge-logo" onClick={handleReplayIntro} title="Replay Opening Sequence">
              <span>THEATRON</span>
            </div>
          </div>

          <div className="bar-center">
            <div className="theatre-collab">
              <span className="collab-immerse">IMMERSE</span>
              <span className="collab-cross">×</span>
              <span className="collab-rs">RS</span>
              <span className="collab-team">TEAM RESOLUTION</span>
            </div>
          </div>

          <nav className="bar-right">
            <button 
              className={`theatre-nav-link ${activeView === 'hero' ? 'active' : ''}`}
              onClick={() => setActiveView('hero')}
            >
              HOME
            </button>
            <button 
              className={`theatre-nav-link ${activeView === 'events' ? 'active' : ''}`}
              onClick={() => setActiveView('events')}
            >
              EVENTS
            </button>
            <button 
              className="theatre-nav-link"
              onClick={() => setActiveView('events')}
            >
              GALLERY
            </button>
            <button 
              className="theatre-nav-link"
              onClick={() => setActiveView('download')}
            >
              CONTACT
            </button>
          </nav>
        </header>


        {/* ========================================================
            HERO CONTENT: VISUAL HIERARCHY
            STAGE/PERFORMANCE (Right) → THEATRON (Left) → INFO → ACTIONS
            Zero duplicate text.
            ======================================================== */}
        {activeView === 'hero' && (
          <section className="theatre-hero-grid">
            <div className="theatre-hero-left">
              {/* THEATRON Main Branding */}
              <div className="hero-brand-block">
                <h1 className="hero-theatron-title">THEATRON</h1>
                <div className="hero-theatron-year">2026</div>
              </div>

              {/* Tagline */}
              <div className="hero-tagline-wrapper">
                <span className="tagline-brass-line" />
                <p className="hero-tagline-text">Where stories come alive.</p>
              </div>

              {/* Event Information: Countdown */}
              <div className="hero-countdown-block">
                <span className="countdown-eyebrow">YOUR SHOW BEGINS IN</span>
                <div className="theatre-countdown-display">
                  <div className="countdown-dial">
                    <span className="dial-value">{countdown.days}</span>
                    <span className="dial-label">DAYS</span>
                  </div>
                  <div className="countdown-dial">
                    <span className="dial-value">{countdown.hours}</span>
                    <span className="dial-label">HOURS</span>
                  </div>
                  <div className="countdown-dial">
                    <span className="dial-value">{countdown.minutes}</span>
                    <span className="dial-label">MINUTES</span>
                  </div>
                  <div className="countdown-dial seconds-dial">
                    <span className="dial-value">{countdown.seconds}</span>
                    <span className="dial-label">SECONDS</span>
                  </div>
                </div>
              </div>

              {/* Theatrical Action Buttons */}
              <div className="hero-action-row">
                <button 
                  className="theatre-btn theatre-btn-primary"
                  onClick={() => setActiveView('events')}
                >
                  <span>EXPLORE EVENTS</span>
                  <ArrowRight size={13} className="btn-arrow" />
                </button>
                <button 
                  className="theatre-btn theatre-btn-secondary"
                  onClick={() => setActiveView('trailer')}
                >
                  <Play size={12} fill="#c7a164" color="#c7a164" />
                  <span>WATCH TRAILER</span>
                </button>
              </div>

              {/* Curtain Status Line */}
              <div className="theatre-status-line">
                <span className="status-label">CURTAIN RISES</span>
                <span className="status-val">
                  <Calendar size={13} color="#c7a164" />
                  <span>DATES TO BE ANNOUNCED</span>
                </span>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================
            INTEGRATED THEATRICAL PLAYBILL: EVENTS VIEW
            ======================================================== */}
        {activeView === 'events' && (
          <section className="theatre-playbill-overlay">
            <div className="playbill-content-drawer">
              <div className="playbill-header">
                <div>
                  <div className="playbill-kicker">FESTIVAL REPERTOIRE</div>
                  <h2 className="playbill-title">THEATRON 2026 EVENTS</h2>
                </div>
                <button className="playbill-close-btn" onClick={() => setActiveView('hero')}>
                  <X size={18} />
                </button>
              </div>

              <div className="playbill-acts-list">
                <div className="act-row">
                  <span className="act-num">ACT I</span>
                  <div className="act-details">
                    <h3 className="act-name">THE STAGE PLAY (NATAKA)</h3>
                    <p className="act-desc">Full-scale theatrical drama. Dynamic staging, expressive dialogue, and ensemble storytelling.</p>
                  </div>
                  <div className="act-meta">
                    <span>6–15 ACTORS</span>
                    <span>20 MINS</span>
                  </div>
                </div>

                <div className="act-row">
                  <span className="act-num">ACT II</span>
                  <div className="act-details">
                    <h3 className="act-name">CINEMATICS (SHORT FILM FESTIVAL)</h3>
                    <p className="act-desc">Original narrative cinema judged on visual storytelling, direction, cinematography, and sound.</p>
                  </div>
                  <div className="act-meta">
                    <span>7–15 MINS</span>
                    <span>4K SCREENING</span>
                  </div>
                </div>

                <div className="act-row">
                  <span className="act-num">ACT III</span>
                  <div className="act-details">
                    <h3 className="act-name">MONOLOGUE CLASH</h3>
                    <p className="act-desc">One performer under the harsh spotlight. Raw emotional range, voice modulation, and stage presence.</p>
                  </div>
                  <div className="act-meta">
                    <span>SOLO STAGE</span>
                    <span>5 MINS</span>
                  </div>
                </div>

                <div className="act-row">
                  <span className="act-num">ACT IV</span>
                  <div className="act-details">
                    <h3 className="act-name">STREET THEATRE (NUKKAD NATAK)</h3>
                    <p className="act-desc">Energetic open-air social commentary with rhythmic percussion, live acoustics, and high-energy formations.</p>
                  </div>
                  <div className="act-meta">
                    <span>8–20 ACTORS</span>
                    <span>OPEN AIR</span>
                  </div>
                </div>
              </div>

              <div className="playbill-footer">
                <button className="theatre-btn theatre-btn-primary" onClick={() => setActiveView('hero')}>
                  <span>RETURN TO STAGE</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================
            CINEMA STAGE PROJECTION: TRAILER VIEW
            ======================================================== */}
        {activeView === 'trailer' && (
          <section className="theatre-projection-overlay">
            <div className="theatre-screen-frame">
              <div className="screen-header">
                <span className="screen-title">OFFICIAL CINEMATIC TRAILER (8K UHD) — THEATRON 2026</span>
                <button className="screen-close-btn" onClick={() => setActiveView('hero')}>
                  <X size={18} />
                </button>
              </div>
              <div className="screen-video-box">
                <video 
                  ref={trailerVideoRef}
                  controls 
                  autoPlay 
                  playsInline 
                  src="/assets/full_presentation_8k.mp4" 
                />
              </div>
            </div>
          </section>
        )}

        {/* ========================================================
            MEDIA & 8K DOWNLOADS VIEW
            ======================================================== */}
        {activeView === 'download' && (
          <section className="theatre-playbill-overlay">
            <div className="playbill-content-drawer">
              <div className="playbill-header">
                <div>
                  <div className="playbill-kicker">8K ULTRA HD MEDIA ASSETS</div>
                  <h2 className="playbill-title">DOWNLOAD POLISHED VIDEOS</h2>
                </div>
                <button className="playbill-close-btn" onClick={() => setActiveView('hero')}>
                  <X size={18} />
                </button>
              </div>

              <div className="playbill-acts-list">
                <a href="/assets/full_presentation_8k.mp4" download="Theatron_Complete_Animation_8K.mp4" className="act-row act-download">
                  <span className="act-num"><Download size={20} color="#c7a164" /></span>
                  <div className="act-details">
                    <h3 className="act-name">8K COMPLETE ANIMATION VIDEO (7680×4320)</h3>
                    <p className="act-desc">Full 8K UHD: Dark theatre glide → Curtains opening → Smooth zoom & reveal into Main Page with sound.</p>
                  </div>
                  <div className="act-meta">
                    <span className="btn-dl-pill">DOWNLOAD 8K MP4</span>
                  </div>
                </a>

                <a href="/assets/intro_8k.mp4" download="Theatron_Curtains_Opening_8K.mp4" className="act-row act-download">
                  <span className="act-num"><Download size={20} color="#c7a164" /></span>
                  <div className="act-details">
                    <h3 className="act-name">8K WATERMARK-FREE INTRO CUT (7680×4320)</h3>
                    <p className="act-desc">Full 8K UHD: Glides through theatre and stops as curtains open (No watermark, no old text).</p>
                  </div>
                  <div className="act-meta">
                    <span className="btn-dl-pill">DOWNLOAD 8K MP4</span>
                  </div>
                </a>
              </div>

              <div className="theatre-contact-info">
                <span>📍 CHENNAI INSTITUTE OF TECHNOLOGY</span>
                <span>✉️ THEATRON@CITCHENNAI.NET</span>
              </div>
            </div>
          </section>
        )}

        {/* Minimal Theatrical Bottom Credits */}
        <footer className="theatre-bottom-credits">
          <div className="credits-left">
            <button className="scene-replay-btn" onClick={handleReplayIntro} title="Replay Opening Sequence">
              <RotateCcw size={12} />
              <span>REPLAY INTRO</span>
            </button>
            <button className="scene-replay-btn" onClick={() => setActiveView('download')} title="8K Video Downloads">
              <Download size={12} />
              <span>8K DOWNLOADS</span>
            </button>
          </div>

          <div className="credits-right">
            <div className="credit-line-primary">A THEATRE & CINEMA EXPERIENCE</div>
            <div className="credit-line-secondary">CHENNAI INSTITUTE OF TECHNOLOGY</div>
          </div>
        </footer>
      </div>
    </div>
  );
}

