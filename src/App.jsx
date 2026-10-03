'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Calendar, 
  ArrowRight, 
  X, 
  Instagram,
  Film
} from 'lucide-react';

export default function TheatronPage() {
  const [transitioning, setTransitioning] = useState(false);
  const [isIntroDone, setIsIntroDone] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [activeView, setActiveView] = useState('hero'); // 'hero' | 'events' | 'trailer'

  const introVideoRef = useRef(null);
  const bgAudioRef = useRef(null);
  const trailerVideoRef = useRef(null);

  // 1. Direct Start: Video autoplays muted immediately, mild audio (0.28) unfreezes on first interaction
  useEffect(() => {
    const video = introVideoRef.current;
    if (video) {
      video.muted = true;
      video.defaultMuted = true;
      video.volume = 0.28;

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.log("Autoplay waiting for user gesture:", err);
          video.muted = true;
          video.play().catch(() => {});
        });
      }

      // Smoothly activate mild atmospheric sound (0.28) on first user interaction anywhere
      const unlockAudio = () => {
        if (video) {
          if (video.paused) {
            video.play().catch(() => {});
          }
          video.muted = false;
          video.volume = 0.28;
        }
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      };

      window.addEventListener('click', unlockAudio, { once: true });
      window.addEventListener('keydown', unlockAudio, { once: true });
      window.addEventListener('touchstart', unlockAudio, { once: true });

      return () => {
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      };
    }
  }, []);

  // 2. Curtains opening transition logic (at ~7.3s)
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
      introVideoRef.current.muted = false;
      introVideoRef.current.play();
    }
  };

  return (
    <div className="theatron-stage-viewport">
      {/* Background Ambience Audio */}
      <audio ref={bgAudioRef} src="/assets/theatre_audio.mp3" loop />

      {/* ========================================================
          1. INTRO: DIRECT THEATRE CAMERA & CURTAINS SEQUENCE
          No watermark, exact native quality, no gate screens.
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
          Exact replica of the provided visual source of truth
          ======================================================== */}
      <div className={`theatre-scene-container ${isIntroDone ? 'visible' : 'prerender'}`}>
        {/* Full-bleed Pristine Stage Backdrop */}
        <div className="theatre-stage-environment">
          <img 
            src="/assets/stage_backdrop_hd.jpg" 
            alt="Theatron 2026 Stage" 
            className="stage-backdrop-visual" 
          />
        </div>

        {/* Minimalist Top Theatrical Bar */}
        <header className="theatre-top-bar">
          <div className="bar-left">
            <img 
              src="/assets/logo_theatron_red.png" 
              alt="THEATRON" 
              className="theatron-brand-logo-img" 
              onClick={handleReplayIntro} 
              title="Replay Opening Sequence" 
            />
          </div>

          <div className="bar-center">
            <img 
              src="/assets/logo_collab_exact.png" 
              alt="IMMERSE x RS TEAM RESOLUTION" 
              className="theatron-collab-logo-img" 
            />
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
              onClick={() => setActiveView('events')}
            >
              CONTACT
            </button>
          </nav>
        </header>

        {/* ========================================================
            HERO CONTENT: EXACT TYPOGRAPHY & LAYOUT
            ======================================================== */}
        {activeView === 'hero' && (
          <main className="theatre-hero-left">
            {/* THEATRON & 2026 */}
            <div className="hero-brand-block">
              <h1 className="hero-theatron-title">THEATRON</h1>
              <div className="hero-theatron-year">2026</div>
            </div>

            {/* Tagline Row: [📷] ── Where stories come alive. */}
            <div className="hero-tagline-wrapper">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer" 
                className="theatre-social-box"
                title="Follow on Instagram"
              >
                <Instagram size={13} strokeWidth={1.8} />
              </a>
              <span className="tagline-brass-line" />
              <p className="hero-tagline-text">Where stories come alive.</p>
            </div>

            {/* Event Countdown */}
            <div className="hero-countdown-block">
              <span className="countdown-eyebrow">YOUR SHOW BEGINS IN</span>
              <div className="theatre-countdown-display">
                <div className="countdown-dial">
                  <span className="dial-value">00</span>
                  <span className="dial-label">DAYS</span>
                </div>
                <div className="countdown-dial">
                  <span className="dial-value">00</span>
                  <span className="dial-label">HOURS</span>
                </div>
                <div className="countdown-dial">
                  <span className="dial-value">00</span>
                  <span className="dial-label">MINUTES</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
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
                <Play size={12} fill="currentColor" />
                <span>WATCH TRAILER</span>
              </button>
            </div>

            {/* Status line */}
            <div className="theatre-status-line">
              <span className="status-label">CURTAIN RISES</span>
              <span className="status-val">
                <Calendar size={13} />
                <span>DATES TO BE ANNOUNCED</span>
              </span>
            </div>
          </main>
        )}

        {/* Bottom Left Circular Badge */}
        <div className="theatre-bottom-left-badge" onClick={handleReplayIntro} title="Replay Opening Sequence">
          <img src="/assets/badge_bottom_left.png" alt="Badge" />
        </div>

        {/* Far Right Vertical Indicator (06 | 01) */}
        <div className="theatre-vertical-indicator">
          <span>06</span>
          <span className="vert-line" />
          <span>01</span>
        </div>

        {/* Bottom Right Minimal Credits */}
        <footer className="theatre-bottom-right-credits">
          <div className="credit-line-primary">A THEATRE & CINEMA EXPERIENCE</div>
          <div className="credit-line-secondary">CHENNAI INSTITUTE OF TECHNOLOGY</div>
        </footer>

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
                    <p className="act-desc">Pure acting prowess. One performer under the spotlight commanding the stage.</p>
                  </div>
                  <div className="act-meta">
                    <span>SOLO</span>
                    <span>5 MINS</span>
                  </div>
                </div>

                <div className="act-row">
                  <span className="act-num">ACT IV</span>
                  <div className="act-details">
                    <h3 className="act-name">STREET PLAY (NUKKAD NATAK)</h3>
                    <p className="act-desc">High-energy social theatre with rhythmic beats, vocal harmony, and public impact.</p>
                  </div>
                  <div className="act-meta">
                    <span>8–20 ACTORS</span>
                    <span>15 MINS</span>
                  </div>
                </div>
              </div>

              <div className="theatre-contact-info">
                <span>📍 CHENNAI INSTITUTE OF TECHNOLOGY</span>
                <span>✉️ THEATRON@CITCHENNAI.NET</span>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================
            CINEMATIC TRAILER PREVIEW MODAL
            ======================================================== */}
        {activeView === 'trailer' && (
          <div className="theatre-trailer-modal">
            <div className="trailer-modal-backdrop" onClick={() => setActiveView('hero')} />
            <div className="trailer-modal-window">
              <div className="trailer-header">
                <div className="trailer-title">
                  <Film size={16} color="#c7a164" />
                  <span>THEATRON 2026 OFFICIAL TEASER</span>
                </div>
                <button className="trailer-close-btn" onClick={() => setActiveView('hero')}>
                  <X size={18} />
                </button>
              </div>
              <div className="trailer-video-box">
                <video 
                  ref={trailerVideoRef}
                  className="trailer-player" 
                  controls 
                  autoPlay 
                  playsInline
                  src="/assets/theatron_exact_clean.mp4" 
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
