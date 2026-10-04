'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Calendar, 
  ArrowRight, 
  X, 
  Film,
  Volume2,
  VolumeX
} from 'lucide-react';

export default function TheatronPage() {
  const [transitioning, setTransitioning] = useState(false);
  const [isIntroDone, setIsIntroDone] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [activeView, setActiveView] = useState('hero'); // 'hero' | 'events' | 'trailer'

  const introVideoRef = useRef(null);
  const bgAudioRef = useRef(null);
  const trailerVideoRef = useRef(null);

  // 1. Direct Start: Native video autoplays immediately edge-to-edge with mild atmospheric sound
  useEffect(() => {
    const video = introVideoRef.current;
    if (video) {
      video.volume = 0.28;

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsAudioMuted(false);
          })
          .catch(() => {
            // If browser blocks unmuted audio on load, start muted immediately so video glides without delay
            video.muted = true;
            setIsAudioMuted(true);
            video.play().catch(() => {});

            // Smoothly activate mild atmospheric sound (0.28) on first user interaction anywhere
            const unlockAudio = () => {
              video.muted = false;
              video.volume = 0.28;
              setIsAudioMuted(false);
              window.removeEventListener('click', unlockAudio);
              window.removeEventListener('keydown', unlockAudio);
              window.removeEventListener('touchstart', unlockAudio);
            };

            window.addEventListener('click', unlockAudio, { once: true });
            window.addEventListener('keydown', unlockAudio, { once: true });
            window.addEventListener('touchstart', unlockAudio, { once: true });
          });
      }
    }
  }, []);

  // 2. Curtains opening transition logic (at ~7.35s when curtains have fully parted and empty dark screen is revealed)
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
    // Cut immediately after curtains open and empty dark screen is revealed (before any text appears)
    if (introVideoRef.current && introVideoRef.current.currentTime >= 7.35) {
      triggerCurtainTransition();
    }
  };

  // Toggle Audio
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
        bgAudioRef.current.play().catch(() => {});
      }
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
      introVideoRef.current.play().catch(() => {});
    }
  };

  return (
    <div className="theatron-stage-viewport">
      {/* Background Ambience Audio */}
      <audio ref={bgAudioRef} src="/assets/theatre_audio.mp3" loop />

      {/* ========================================================
          1. INTRO: NATIVE THEATRE CAMERA & CURTAINS SEQUENCE
          No watermark, no final title card, original sharp colors & dynamic range.
          ======================================================== */}
      {!isIntroDone && (
        <div className={`intro-cinema-layer ${transitioning ? 'transitioning' : ''}`}>
          <video
            ref={introVideoRef}
            className="cinema-projection-video"
            playsInline
            autoPlay
            preload="auto"
            onTimeUpdate={handleVideoTimeUpdate}
            onEnded={triggerCurtainTransition}
          >
            <source src="/assets/intro.mp4" type="video/mp4" />
          </video>

          {/* Very subtle cinematic edge vignette (15% opacity), never crushing the auditorium details */}
          <div className="cinema-subtle-overlay" />

          {/* Anamorphic Lens Flare Sweep on Curtains Opening */}
          <div className={`cinema-flash ${flashActive ? 'active' : ''}`} />

          {/* UI Controls positioned above video */}
          <div className="cinema-hud">
            {isAudioMuted && (
              <button className="hud-badge pulse-badge" onClick={toggleAudio}>
                <Volume2 size={13} />
                <span>ENABLE MILD SOUND</span>
              </button>
            )}
            <button className="hud-btn" onClick={triggerCurtainTransition}>
              <span>SKIP TO STAGE</span>
              <ArrowRight size={13} />
            </button>
            <button className="hud-btn icon-only" onClick={toggleAudio} title="Toggle Audio">
              {isAudioMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          2. MAIN THEATRICAL STAGE EXPERIENCE
          Exact 100% faithful replica of the source of truth image
          ======================================================== */}
      <div className={`theatre-scene-container ${isIntroDone ? 'visible' : 'prerender'}`}>
        <div className="theatre-stage-environment">
          <div className="theatre-stage-canvas">
            {/* The exact pristine main page stage visual */}
            <img 
              src="/assets/main_stage_exact_hd.png" 
              alt="Theatron 2026 Theatrical Stage Experience" 
              className="stage-backdrop-visual" 
            />

            {/* ========================================================
                PIXEL-PERFECT INTERACTIVE HOTSPOTS
                Mapped directly over the exact image elements
                ======================================================== */}

            {/* 1. Top Bar: THEATRON Logo (Top Left) */}
            <button 
              className="hotspot-btn hotspot-theatron-logo" 
              onClick={handleReplayIntro} 
              title="Replay Opening Sequence"
              aria-label="Replay Opening Sequence"
            />

            {/* 2. Top Bar: Navigation Links (Top Right) */}
            <button 
              className="hotspot-btn hotspot-nav hotspot-home" 
              onClick={() => setActiveView('hero')} 
              title="Home"
              aria-label="Home"
            />
            <button 
              className="hotspot-btn hotspot-nav hotspot-events" 
              onClick={() => setActiveView('events')} 
              title="Events Repertoire"
              aria-label="Events"
            />
            <button 
              className="hotspot-btn hotspot-nav hotspot-gallery" 
              onClick={() => setActiveView('events')} 
              title="Gallery"
              aria-label="Gallery"
            />
            <button 
              className="hotspot-btn hotspot-nav hotspot-contact" 
              onClick={() => setActiveView('events')} 
              title="Contact & Info"
              aria-label="Contact"
            />

            {/* 3. Hero Left: Instagram Icon Box */}
            <a 
              href="https://www.instagram.com" 
              target="_blank" 
              rel="noreferrer" 
              className="hotspot-btn hotspot-social" 
              title="Follow on Instagram"
              aria-label="Follow on Instagram"
            />

            {/* 4. Hero Left: [ EXPLORE EVENTS → ] Action Button */}
            <button 
              className="hotspot-btn hotspot-action hotspot-explore-events" 
              onClick={() => setActiveView('events')} 
              title="Explore Festival Events"
              aria-label="Explore Events"
            />

            {/* 5. Hero Left: [ ▷ WATCH TRAILER ] Action Button */}
            <button 
              className="hotspot-btn hotspot-action hotspot-watch-trailer" 
              onClick={() => setActiveView('trailer')} 
              title="Watch Official Teaser"
              aria-label="Watch Trailer"
            />

            {/* 6. Bottom Left: (N) Circular Badge */}
            <button 
              className="hotspot-btn hotspot-badge-bl" 
              onClick={handleReplayIntro} 
              title="Replay Opening Sequence"
              aria-label="Replay Intro"
            />

            {/* Subtle Golden Theatre Dust Motes rising through the red spotlight */}
            <div className="spotlight-particles">
              {[...Array(24)].map((_, i) => (
                <span
                  key={i}
                  className="dust-mote"
                  style={{
                    width: `${(i % 3) + 1.2}px`,
                    height: `${(i % 3) + 1.2}px`,
                    left: `${64 + ((i * 3.4) % 24)}%`,
                    animationDuration: `${7 + (i % 8)}s`,
                    animationDelay: `${(i * 0.35) % 5}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================
            3. FESTIVAL EVENTS REPERTOIRE (ACTS I–IV) MODAL
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
            4. CINEMATIC TRAILER PREVIEW MODAL
            ======================================================== */}
        {activeView === 'trailer' && (
          <div className="theatre-trailer-modal">
            <div className="trailer-modal-backdrop" onClick={() => setActiveView('hero')} />
            <div className="trailer-modal-window">
              <div className="trailer-header">
                <div className="trailer-title">
                  <Film size={16} color="#baa072" />
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
