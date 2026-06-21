import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
// @ts-ignore
import SplashCursor from '../components/SplashCursor';
// @ts-ignore
import GooeyNav from '../components/GooeyNav';
// @ts-ignore
import SoftAurora from '../components/SoftAurora';

gsap.registerPlugin(ScrollTrigger);

const palettes = [
  { name: 'Cyberpunk', id: 'cyberpunk', color: '#ff003c', color2: '#00f0ff' },
  { name: 'Neon Acid', id: 'neon-acid', color: '#ccff00', color2: '#ff00ff' },
  { name: 'Deep Void', id: 'void', color: '#66fcf1', color2: '#0000ff' },
  { name: 'Synthwave', id: 'synthwave', color: '#ff71ce', color2: '#05d9e8' },
  { name: 'Bubblegum', id: 'bubblegum', color: '#ff479d', color2: '#00e5ff' },
  { name: 'Crimson', id: 'crimson', color: '#cc0000', color2: '#ffaa00' },
  { name: 'Emerald', id: 'emerald', color: '#00ff88', color2: '#00cc6a' },
  { name: 'Solar', id: 'solar', color: '#ffcc00', color2: '#ff6600' },
  { name: 'Arctic', id: 'arctic', color: '#ffffff', color2: '#33ccff' },
  { name: 'Royal', id: 'royal', color: '#ffcc00', color2: '#9933ff' },
  { name: 'Poison', id: 'poison', color: '#ff3333', color2: '#99ff33' },
  { name: 'Ocean', id: 'ocean', color: '#00cc99', color2: '#005c80' },
  { name: 'Autumn', id: 'autumn', color: '#cc3300', color2: '#ff9933' },
  { name: 'Lavender', id: 'lavender', color: '#ff99cc', color2: '#cc99ff' },
  { name: 'Monochrome', id: 'monochrome', color: '#ffffff', color2: '#404040' },
  { name: 'Matrix', id: 'matrix', color: '#00ff00', color2: '#00cc00' }
];

export function Landing() {
  const container = useRef<HTMLDivElement>(null);
  
  const [currentTheme, setCurrentTheme] = useState('cyberpunk');
  const [currentMode, setCurrentMode] = useState<'dark'|'light'>('dark');
  const [currentName, setCurrentName] = useState('Cyberpunk');
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const navItems = [
    { label: 'Platform', href: '#hero' },
    { label: 'Capabilities', href: '#horiz-outer' },
    { label: 'Architecture', href: '#footer' },
  ];

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.documentElement.setAttribute('data-mode', currentMode);
  }, [currentTheme, currentMode]);

  // Cursor tracking
  useEffect(() => {
    const handleMouseMove = (_e: MouseEvent) => {
      // legacy cursor pos tracking removed
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const toggleMode = () => {
    setCurrentMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useGSAP(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    if (reduceMotion) return;

    // Hero entrance
    gsap.set('.tilt-word', { yPercent: 130, scale: 1.35, opacity: 0 });
    gsap.to('.tilt-word', { yPercent: 0, scale: 1, opacity: 1, duration: 1.05, stagger: 0.065, ease: 'power4.out', delay: 0.1 });
    gsap.from('.eyebrow', { opacity: 0, y: 14, duration: 0.7, delay: 0.05 });
    gsap.from('.hero-sub', { opacity: 0, y: 18, duration: 0.75, delay: 0.65 });
    gsap.from('.hero-cta-row', { opacity: 0, y: 18, duration: 0.75, delay: 0.8 });

    // Hero scroll transition
    ScrollTrigger.create({
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.2,
      onUpdate(self) {
        const p = self.progress;
        gsap.set('#hero .stage-inner', {
          scale: 1 - p * 0.08,
          opacity: 1 - p * 1.1,
          y: p * -40
        });
      }
    });

    ScrollTrigger.create({
      trigger: '#hero',
      start: '60% top',
      end: 'bottom -10%',
      scrub: 0.9,
      onUpdate(self) {
        const p = self.progress;
        gsap.set('#hero', { clipPath: `inset(0 0 ${p * 100}% 0 round 0px)` });
      }
    });

    // Horizontal Scroll System
    const horizOuter = document.getElementById('horiz-outer');
    const track = document.getElementById('horiz-track');
    const panels = gsap.utils.toArray('.h-panel') as HTMLElement[];
    const N = panels.length;
    
    if (horizOuter && track) {
      let currentPanel = 0;
      let autoPlayTimer: gsap.core.Tween | null = null;
      let isWheeling = false;
      
      updateDots(0);

      const goToPanel = (idx: number) => {
        if (idx < 0) idx = N - 1;
        if (idx >= N) idx = 0;
        currentPanel = idx;
        
        gsap.to(track, {
          x: -currentPanel * window.innerWidth,
          duration: 1.2,
          ease: 'power4.inOut'
        });
        
        updateDots(currentPanel);

        if (currentPanel === 2) {
          panels[2].querySelectorAll('.stat-num[data-count]').forEach(countUp);
        }

        if (autoPlayTimer) autoPlayTimer.kill();
        autoPlayTimer = gsap.delayedCall(15, () => goToPanel(currentPanel + 1));
      };

      autoPlayTimer = gsap.delayedCall(15, () => goToPanel(currentPanel + 1));

      const prevBtn = document.querySelector('.h-nav.prev');
      const nextBtn = document.querySelector('.h-nav.next');
      const onPrev = () => goToPanel(currentPanel - 1);
      const onNext = () => goToPanel(currentPanel + 1);
      
      prevBtn?.addEventListener('click', onPrev);
      nextBtn?.addEventListener('click', onNext);

      // Trackpad/Mouse manual swipe and scroll trap
      const handleWheel = (e: WheelEvent) => {
        e.preventDefault(); // Trap all scrolling within this section
        if (isWheeling) return;
        isWheeling = true;
        
        let dir = 0;
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          dir = e.deltaX > 0 ? 1 : -1;
        } else {
          dir = e.deltaY > 0 ? 1 : -1;
        }
        
        goToPanel(currentPanel + dir);
        // Clean up inline styles left over from old GSAP animations just in case
        gsap.set('.from-right', { clearProps: 'all' });
        
        setTimeout(() => { isWheeling = false; }, 1200);
      };
      horizOuter.addEventListener('wheel', handleWheel, { passive: false });

      // Clean up inline styles immediately on load so elements are visible
      gsap.set('.from-right', { clearProps: 'all' });

      // Dots clicking
      const dots = document.querySelectorAll('.h-dot');
      const dotListeners: ((e: Event) => void)[] = [];
      dots.forEach((dot, i) => {
        const listener = () => goToPanel(i);
        dotListeners.push(listener);
        dot.addEventListener('click', listener);
      });

      return () => {
        if (autoPlayTimer) autoPlayTimer.kill();
        prevBtn?.removeEventListener('click', onPrev);
        nextBtn?.removeEventListener('click', onNext);
        horizOuter.removeEventListener('wheel', handleWheel);
        dots.forEach((dot, i) => dot.removeEventListener('click', dotListeners[i]));
      };
    }

    function updateDots(idx: number) {
      document.querySelectorAll('.h-dot').forEach((d, i) => {
        d.classList.toggle('active', i === idx);
      });
    }

    function countUp(el: any) {
      const target = parseInt(el.dataset.count);
      if (isNaN(target)) return;
      gsap.fromTo(el, { textContent: 0 }, {
        textContent: target,
        duration: 1.4, ease: 'power3.out', snap: { textContent: 1 },
        onUpdate() { el.textContent = Math.round(Number(el.textContent)); }
      });
    }

    // Footer Animations
    ScrollTrigger.create({
      trigger: '#footer',
      start: 'top 85%',
      onEnter() {
        gsap.from('.foot-title', { y: 50, opacity: 0, duration: 0.9, ease: 'power3.out' });
        gsap.from('.foot-links .foot-col', { y: 30, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out', delay: 0.2 });
        gsap.from('.foot-bottom', { y: 20, opacity: 0, duration: 0.6, delay: 0.5 });
        gsap.from('.foot-ticker-wrap', { scaleX: 0, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.1, transformOrigin: 'left' });
        gsap.from('#loginBtn3', { scale: 0.8, opacity: 0, duration: 0.6, ease: 'back.out(2)', delay: 0.3 });
      }
    });

  }, { scope: container });

  const handleRevealEnter = (_text: string) => {
    // legacy cursor code removed
  };
  const handleRevealLeave = () => {
    // legacy cursor code removed
  };
  
  const scrollToPanel = (offset: number) => {
    const track = document.getElementById('horiz-outer');
    if(!track) return;
    // Basic approximate scrolling
    window.scrollBy({ top: offset * window.innerHeight, behavior: 'smooth' });
  }

  const currentPalette = palettes.find(p => p.id === currentTheme) || palettes[0];
  const currentHex = currentPalette.color;
  const currentHex2 = currentPalette.color2;

  return (
    <div ref={container} className="relative">
      <SplashCursor COLOR={currentHex} RAINBOW_MODE={false} />

      <div id="trans-overlay">
        <div id="trans-bg"></div>
        <div id="trans-logo">VAULT<em style={{fontStyle:'italic', opacity:0.7}}>OS</em></div>
      </div>

      <header className="topbar">
        <div className="wrap topbar-row">
          <a className="brand" href="#hero"><span className="led"></span>VAULT<span>OS</span></a>
          
          <div className="nav-center hidden-mobile">
            <GooeyNav
              items={navItems}
              particleCount={15}
              particleDistances={[80, 10]}
              particleR={100}
              initialActiveIndex={0}
              animationTime={600}
              timeVariance={300}
              colors={[1, 2, 3, 4, 1, 2]}
            />
          </div>

          <div className="theme-controls">
            <div className="color-picker-wrap" id="colorPickerWrap" onClick={() => setColorPickerOpen(!colorPickerOpen)}>
              <button className="color-picker-btn" title="Color scheme">
                <span className="btn-swatch-ring"></span>
              </button>
              <div className={`color-dropdown ${colorPickerOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
                <span className="color-dropdown-label">Choose accent</span>
                <div className="swatch-grid">
                  {palettes.map((p) => (
                    <div 
                      key={p.id}
                      className={`swatch ${currentTheme === p.id ? 'active' : ''}`}
                      style={{ background: p.color }}
                      title={p.name}
                      onClick={() => { setCurrentTheme(p.id); setCurrentName(p.name); }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <button className="mode-toggle" onClick={toggleMode} title="Toggle light / dark">
              <svg viewBox="0 0 24 24">
                {currentMode === 'dark' ? (
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" fill="none" strokeWidth="1.6"/>
                ) : (
                  <>
                    <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" stroke="currentColor" fill="none" strokeWidth="1.6"/>
                    <circle cx="12" cy="12" r="4.2" stroke="currentColor" fill="none" strokeWidth="1.6"/>
                  </>
                )}
              </svg>
            </button>
            <Link to="/app" className="login-btn">Login</Link>
          </div>
        </div>
      </header>

      <div className="blob" id="blob"></div>

      <div id="main-scroll">
        <section className="v-section" id="hero">
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.7 }}>
            <SoftAurora 
              color1={currentHex} 
              color2={currentHex2} 
              brightness={0.4}
              speed={0.5}
              bandSpread={0.8}
              enableMouseInteraction={true}
            />
          </div>
          <div className="wrap stage-inner">
            <div className="eyebrow">PRIVATE KNOWLEDGE INFRASTRUCTURE</div>
            <h1 className="hero-h1">
              <span className="tilt-word" 
                onMouseEnter={() => handleRevealEnter('🔒 whitelist only')} 
                onMouseLeave={handleRevealLeave}>Your</span>
              <span className="tilt-word">knowledge.</span><br/>
              <span className="tilt-word"
                onMouseEnter={() => handleRevealEnter('🔐 four access tiers')} 
                onMouseLeave={handleRevealLeave}>Locked,</span>
              <span className="tilt-word"
                onMouseEnter={() => handleRevealEnter('🗂️ spaces & folders')} 
                onMouseLeave={handleRevealLeave}>organized,</span>
              <span className="tilt-word"><em
                onMouseEnter={() => handleRevealEnter('📈 reading analytics')} 
                onMouseLeave={handleRevealLeave}>alive.</em></span>
            </h1>
            <p className="hero-sub">Vault OS is the private workspace where your notes, research, and documentation live behind real access control — roles, whitelists, and a full audit trail. Not just a login screen.</p>
            <div className="hero-cta-row">
              <Link to="/app" className="login-btn">Start reading</Link>
              <button className="btn-ghost" id="exploreBtn" onClick={() => window.scrollTo({top: window.innerHeight, behavior: 'smooth'})}>Explore features ↓</button>
            </div>
          </div>
        </section>

        <div id="horiz-outer">
          <button className="h-nav prev" onClick={() => scrollToPanel(-1)}><svg viewBox="0 0 24 24"><polyline points="15,18 9,12 15,6"/></svg></button>
          <button className="h-nav next" onClick={() => scrollToPanel(1)}><svg viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg></button>

          <div className="marquee-bar top">
            <div className="foot-ticker">
              <span>VAULT<em> OS</em></span><span>•</span>
              <span>PRIVATE KNOWLEDGE</span><span>•</span>
              <span>ROLES &amp; ACCESS</span><span>•</span>
              <span>SPACED REPETITION</span><span>•</span>
              <span>AUDIT TRAIL</span><span>•</span>
              <span>LIVE THEMES</span><span>•</span>
              <span>MASTERY TRACKING</span><span>•</span>
              <span>STREAK ENGINE</span><span>•</span>
              <span>VAULT<em> OS</em></span><span>•</span>
              <span>PRIVATE KNOWLEDGE</span><span>•</span>
              <span>ROLES &amp; ACCESS</span><span>•</span>
              <span>SPACED REPETITION</span><span>•</span>
              <span>AUDIT TRAIL</span><span>•</span>
              <span>LIVE THEMES</span><span>•</span>
              <span>MASTERY TRACKING</span><span>•</span>
              <span>STREAK ENGINE</span><span>•</span>
            </div>
          </div>

          <div id="horiz-track">
            {/* PANEL 1 */}
            <div className="h-panel">
              <div className="wrap h-content">
                <div className="h-panel-eyebrow from-right">What's inside</div>
                <h2 className="h-panel-title from-right">Six systems.<br/><em>One vault.</em></h2>
                <p className="h-panel-body from-right">Every layer of Vault OS was designed with one constraint: nothing leaks. From the role engine to the audit trail, access is a first principle — not a bolt-on.</p>
                <div className="feat-grid">
                  <div className="feat-card wide from-right" onMouseEnter={() => handleRevealEnter('4 roles: God Admin → Viewer')} onMouseLeave={handleRevealLeave}>
                    <span className="feat-num mono">01</span>
                    <div className="feat-icon"><svg viewBox="0 0 24 24"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"/></svg></div>
                    <div className="feat-name">Roles & access<span className="dup">Roles & access</span></div>
                    <p>God Admin, Admin, Editor, Viewer — a fixed boundary for every action.</p>
                  </div>
                  <div className="feat-card from-right">
                    <span className="feat-num mono">02</span>
                    <div className="feat-icon"><svg viewBox="0 0 24 24"><path d="M4 4h7v7H4zM13 13h7v7h-7zM11 7h6M7 11v6"/></svg></div>
                    <div className="feat-name">Nested spaces<span className="dup">Nested spaces</span></div>
                    <p>Space → Folder → Topic → Document, nested as deep as you need.</p>
                  </div>
                  <div className="feat-card from-right">
                    <span className="feat-num mono">03</span>
                    <div className="feat-icon"><svg viewBox="0 0 24 24"><path d="M4 19h16M6 17l1-4 10-10 3 3-10 10-4 1z"/></svg></div>
                    <div className="feat-name">Markdown editor<span className="dup">Markdown editor</span></div>
                    <p>Split view, live preview, autosave on every keystroke that matters.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* PANEL 2 */}
            <div className="h-panel">
              <div className="wrap h-content">
                <div className="h-panel-eyebrow from-right">More capabilities</div>
                <h2 className="h-panel-title from-right">Everything a <em>serious reader</em><br/>actually needs.</h2>
                <div className="feat-grid" style={{marginTop: 36}}>
                  <div className="feat-card from-right">
                    <span className="feat-num mono">04</span>
                    <div className="feat-icon"><svg viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 7h6M9 11h6M9 15h4"/></svg></div>
                    <div className="feat-name">Audit trail<span className="dup">Audit trail</span></div>
                    <p>Login, edit, delete, permission change — timestamped and attributable.</p>
                  </div>
                  <div className="feat-card from-right">
                    <span className="feat-num mono">05</span>
                    <div className="feat-icon"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg></div>
                    <div className="feat-name">Instant search<span className="dup">Instant search</span></div>
                    <p>Across spaces, folders, topics, documents, and tags — as you type.</p>
                  </div>
                  <div className="feat-card from-right">
                    <span className="feat-num mono">06</span>
                    <div className="feat-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 000 18z" fill="currentColor" stroke="none" opacity=".4"/></svg></div>
                    <div className="feat-name">Live themes<span className="dup">Live themes</span></div>
                    <p>15 color palettes, each tuned for light and dark. Switch live from the toolbar above.</p>
                  </div>
                  <div className="feat-card from-right">
                    <span className="feat-num mono">07</span>
                    <div className="feat-icon"><svg viewBox="0 0 24 24"><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/></svg></div>
                    <div className="feat-name">Revision scheduler<span className="dup">Revision scheduler</span></div>
                    <p>SM-2 spaced repetition built into every document. Never forget what you read.</p>
                  </div>
                  <div className="feat-card from-right">
                    <span className="feat-num mono">08</span>
                    <div className="feat-icon"><svg viewBox="0 0 24 24"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg></div>
                    <div className="feat-name">Mastery tracking<span className="dup">Mastery tracking</span></div>
                    <p>Mark confidence levels. Vault surfaces what to revisit so your knowledge compounds.</p>
                  </div>
                  <div className="feat-card from-right">
                    <span className="feat-num mono">09</span>
                    <div className="feat-icon"><svg viewBox="0 0 24 24"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg></div>
                    <div className="feat-name">Streak tracking<span className="dup">Streak tracking</span></div>
                    <p>Daily reading streaks with heatmaps. Consistency visualized, momentum rewarded.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* PANEL 3 */}
            <div className="h-panel">
              <div className="wrap h-content">
                <div className="h-panel-eyebrow from-right">By the numbers</div>
                <h2 className="h-panel-title from-right">Built for depth,<br/><em>not breadth.</em></h2>
                <p className="h-panel-body from-right">Vault OS is deliberately private. There's no public feed, no follower count, no engagement metric. Just you, your knowledge, and the systems that protect it.</p>
                <div className="stats-row">
                  <div className="stat from-right">
                    <div className="stat-num" data-count="15">0</div>
                    <div className="stat-label">Color schemes</div>
                  </div>
                  <div className="stat from-right">
                    <div className="stat-num" data-count="4">0</div>
                    <div className="stat-label">Access roles</div>
                  </div>
                  <div className="stat from-right">
                    <div className="stat-num" data-count="∞">∞</div>
                    <div className="stat-label">Nesting depth</div>
                  </div>
                  <div className="stat from-right">
                    <div className="stat-num" data-count="100">0</div>
                    <div className="stat-label">% Audit coverage</div>
                  </div>
                </div>
              </div>
            </div>

            {/* PANEL 4 */}
            <div className="h-panel">
              <div className="wrap h-content">
                <div className="h-panel-eyebrow from-right">Design philosophy</div>
                <h2 className="h-panel-title from-right">Why Vault OS<br/>feels <em>different.</em></h2>
                <div className="phil-list">
                  <div className="phil-item from-right">
                    <span className="phil-n">01</span>
                    <div className="phil-text">
                      <h4>Access is not a feature — it's the foundation</h4>
                      <p>Most tools bolt on permissions late. We built the role engine first, then the product around it.</p>
                    </div>
                  </div>
                  <div className="phil-item from-right">
                    <span className="phil-n">02</span>
                    <div className="phil-text">
                      <h4>Reading is a practice, not a transaction</h4>
                      <p>Streaks, mastery scores, and revision schedules exist because knowledge compounds when you return to it.</p>
                    </div>
                  </div>
                  <div className="phil-item from-right">
                    <span className="phil-n">03</span>
                    <div className="phil-text">
                      <h4>One reader at the center</h4>
                      <p>No public profile. No feed. No notifications. Vault is optimized for the depth of one person's thinking.</p>
                    </div>
                  </div>
                  <div className="phil-item from-right">
                    <span className="phil-n">04</span>
                    <div className="phil-text">
                      <h4>Everything is auditable, nothing is opaque</h4>
                      <p>Every action — read, edit, permission change — is timestamped. You always know what happened and who did it.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="marquee-bar bottom">
            <div className="foot-ticker" style={{ animationDirection: 'reverse' }}>
              <span>VAULT<em> OS</em></span><span>•</span>
              <span>PRIVATE KNOWLEDGE</span><span>•</span>
              <span>ROLES &amp; ACCESS</span><span>•</span>
              <span>SPACED REPETITION</span><span>•</span>
              <span>AUDIT TRAIL</span><span>•</span>
              <span>LIVE THEMES</span><span>•</span>
              <span>MASTERY TRACKING</span><span>•</span>
              <span>STREAK ENGINE</span><span>•</span>
              <span>VAULT<em> OS</em></span><span>•</span>
              <span>PRIVATE KNOWLEDGE</span><span>•</span>
              <span>ROLES &amp; ACCESS</span><span>•</span>
              <span>SPACED REPETITION</span><span>•</span>
              <span>AUDIT TRAIL</span><span>•</span>
              <span>LIVE THEMES</span><span>•</span>
              <span>MASTERY TRACKING</span><span>•</span>
              <span>STREAK ENGINE</span><span>•</span>
            </div>
          </div>

          <div className="h-progress" id="hProgress">
            <div className="h-dot active"></div>
            <div className="h-dot"></div>
            <div className="h-dot"></div>
            <div className="h-dot"></div>
          </div>
        </div>

        <footer id="footer">
          <div className="footer-bg-grid"></div>
          <div className="footer-glow"></div>
          <div className="wrap foot-inner">
            <div className="foot-top">
              <h3 className="foot-title">Your second brain<br/>deserves <em>a lock.</em></h3>
              <Link to="/app" className="login-btn" id="loginBtn3" style={{fontSize: 14, padding: '14px 32px'}}>Get access</Link>
            </div>

            <div className="foot-ticker-wrap">
              <div className="foot-ticker">
                <span>VAULT<em> OS</em></span><span>•</span>
                <span>PRIVATE KNOWLEDGE</span><span>•</span>
                <span>ROLES &amp; ACCESS</span><span>•</span>
                <span>SPACED REPETITION</span><span>•</span>
                <span>AUDIT TRAIL</span><span>•</span>
                <span>LIVE THEMES</span><span>•</span>
                <span>MASTERY TRACKING</span><span>•</span>
                <span>STREAK ENGINE</span><span>•</span>
                <span>VAULT<em> OS</em></span><span>•</span>
                <span>PRIVATE KNOWLEDGE</span><span>•</span>
                <span>ROLES &amp; ACCESS</span><span>•</span>
                <span>SPACED REPETITION</span><span>•</span>
                <span>AUDIT TRAIL</span><span>•</span>
                <span>LIVE THEMES</span><span>•</span>
                <span>MASTERY TRACKING</span><span>•</span>
                <span>STREAK ENGINE</span><span>•</span>
              </div>
            </div>

            <div className="foot-links">
              <div className="foot-col"><h4>Product</h4>
                <a className="shuffle" href="#">Spaces</a>
                <a className="shuffle" href="#">Editor</a>
                <a className="shuffle" href="#">Search</a>
                <a className="shuffle" href="#">Themes</a>
              </div>
              <div className="foot-col"><h4>Learning</h4>
                <a className="shuffle" href="#">Mastery scores</a>
                <a className="shuffle" href="#">Revision scheduler</a>
                <a className="shuffle" href="#">Streak tracking</a>
              </div>
              <div className="foot-col"><h4>Access</h4>
                <a className="shuffle" href="#">Roles</a>
                <a className="shuffle" href="#">Whitelist</a>
                <a className="shuffle" href="#">Audit logs</a>
              </div>
              <div className="foot-col"><h4>System</h4>
                <a className="shuffle" href="#">Status</a>
                <a className="shuffle" href="#">Changelog</a>
                <a className="shuffle" href="#">Roadmap</a>
              </div>
            </div>

            <div className="foot-bottom">
              <span>© 2026 VAULT OS — BUILT FOR ONE READER: YOU.</span>
              <div className="status-pill"><i></i><span id="themeName">{currentName.toUpperCase()} / {currentMode.toUpperCase()}</span></div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
