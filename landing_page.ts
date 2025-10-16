/**
 * Landing.tsx - Plated Landing Page Component
 * 
 * This is the first page users see when they visit Plated.
 * Think of it as the "storefront window" - it needs to:
 * 1. Grab attention immediately (Hero section)
 * 2. Explain the value proposition (Features)
 * 3. Show how it works (Process)
 * 4. Convert visitors to users (CTA buttons)
 * 
 * Design Philosophy:
 * - Mobile-first (most users browse on phones)
 * - Dark theme (modern, reduces eye strain)
 * - Scroll-driven animations (engaging but not distracting)
 * - Clear hierarchy (guide the eye naturally)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * ANALOGY: Think of this component as a movie trailer
 * - First 5 seconds: Hook them (Hero)
 * - Middle: Show what makes it special (Features)
 * - End: Tell them how to get it (CTA)
 */

function Landing() {
  const navigate = useNavigate();
  
  // State for scroll-based animations
  // This tracks if sections are visible, like a motion detector
  const [isVisible, setIsVisible] = useState({
    hero: false,
    features: false,
    howItWorks: false,
    cta: false
  });

  /**
   * Intersection Observer Setup
   * ANALOGY: Like a security camera that detects when someone enters frame
   * When a section scrolls into view, we trigger animations
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Element is visible, trigger animation
            const sectionName = entry.target.getAttribute('data-section');
            if (sectionName) {
              setIsVisible(prev => ({ ...prev, [sectionName]: true }));
            }
          }
        });
      },
      { threshold: 0.1 } // Trigger when 10% of element is visible
    );

    // Observe all sections
    document.querySelectorAll('[data-section]').forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  // Navigation handlers
  const handleGetStarted = () => navigate('/login');

  return (
    <div className="landing-page">
      {/* 
        NAVIGATION BAR
        Like a restaurant's sign - always visible, shows branding
      */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-icon">🍽️</span>
            <span className="logo-text">Plated</span>
          </div>
          <button onClick={handleGetStarted} className="nav-login">
            Sign In
          </button>
        </div>
      </nav>

      {/* 
        HERO SECTION
        The "Above the Fold" content - most important!
        ANALOGY: Like a book cover - makes people decide to read or not
      */}
      <section 
        className={`hero-section ${isVisible.hero ? 'visible' : ''}`}
        data-section="hero"
      >
        <div className="hero-container">
          {/* Background decoration - adds visual interest */}
          <div className="hero-bg-decoration">
            <div className="bg-circle circle-1"></div>
            <div className="bg-circle circle-2"></div>
            <div className="bg-circle circle-3"></div>
          </div>

          <div className="hero-content">
            {/* 
              Main Headline: The Hook
              Should answer: "What is this and why should I care?"
            */}
            <h1 className="hero-title">
              Cooking Made
              <span className="hero-title-highlight"> Addictive</span>
            </h1>
            
            <p className="hero-subtitle">
              Discover viral recipes, level up your skills, and join a community 
              of food lovers turning everyday cooking into an adventure.
            </p>

            {/* 
              Primary CTA (Call-to-Action)
              ANALOGY: Like a "Push to Open" button on automatic doors
            */}
            <div className="hero-cta">
              <button onClick={handleGetStarted} className="btn-primary btn-large">
                Start Cooking Free
                <span className="btn-icon">→</span>
              </button>
              <p className="hero-subtext">
                No credit card required • 1M+ recipes • Join 500K+ home chefs
              </p>
            </div>

            {/* 
              Social Proof Badges
              ANALOGY: Like Michelin stars on a restaurant window
            */}
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">500K+</span>
                <span className="stat-label">Active Chefs</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">1M+</span>
                <span className="stat-label">Recipes</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">4.8★</span>
                <span className="stat-label">User Rating</span>
              </div>
            </div>
          </div>

          {/* 
            Hero Image/Animation Area
            Could be replaced with actual app screenshots or video
          */}
          <div className="hero-visual">
            <div className="phone-mockup">
              <div className="phone-screen">
                <div className="mock-recipe-card">
                  <div className="mock-video"></div>
                  <div className="mock-info">
                    <div className="mock-title"></div>
                    <div className="mock-stats"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 
        FEATURES SECTION
        The "Why choose us?" section
        ANALOGY: Like listing menu specialties at a restaurant
      */}
      <section 
        className={`features-section ${isVisible.features ? 'visible' : ''}`}
        data-section="features"
      >
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Why Plated is Different</h2>
            <p className="section-subtitle">
              We turned cooking from a chore into a game you'll actually want to play
            </p>
          </div>

          <div className="features-grid">
            {/* Feature 1: Discovery */}
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3 className="feature-title">TikTok for Food</h3>
              <p className="feature-description">
                Swipe through endless recipe videos. Find your next meal in 30 seconds, 
                not 30 minutes of blog posts.
              </p>
              <ul className="feature-list">
                <li>Vertical video feed</li>
                <li>Smart recommendations</li>
                <li>Save & remix recipes</li>
              </ul>
            </div>

            {/* Feature 2: Gamification */}
            <div className="feature-card feature-highlight">
              <div className="feature-icon">🎮</div>
              <h3 className="feature-title">Level Up Your Skills</h3>
              <p className="feature-description">
                Earn XP, unlock achievements, and compete in daily challenges. 
                Cooking streaks beat Duolingo streaks.
              </p>
              <ul className="feature-list">
                <li>Daily cooking challenges</li>
                <li>Achievement badges</li>
                <li>Chef leaderboards</li>
              </ul>
            </div>

            {/* Feature 3: Social */}
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3 className="feature-title">Cook Together</h3>
              <p className="feature-description">
                Join a community of home chefs. Share your creations, get feedback, 
                and make cooking a social sport.
              </p>
              <ul className="feature-list">
                <li>Recipe battles</li>
                <li>Live cooking sessions</li>
                <li>Community groups</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 
        HOW IT WORKS SECTION
        The "User Journey" explanation
        ANALOGY: Like assembly instructions - simple, numbered steps
      */}
      <section 
        className={`how-it-works-section ${isVisible.howItWorks ? 'visible' : ''}`}
        data-section="howItWorks"
      >
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Get Started in 3 Steps</h2>
            <p className="section-subtitle">
              From signup to your first viral recipe in under 5 minutes
            </p>
          </div>

          <div className="steps-container">
            {/* Step 1 */}
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3 className="step-title">Sign Up with Google</h3>
                <p className="step-description">
                  One click and you're in. No lengthy forms, no email verification dance.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3 className="step-title">Set Your Preferences</h3>
                <p className="step-description">
                  Tell us what you like. Our AI learns your taste and recommends recipes you'll love.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3 className="step-title">Start Cooking & Sharing</h3>
                <p className="step-description">
                  Browse recipes, cook along with videos, share your results, and level up!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 
        FINAL CTA SECTION
        The "Last chance to convert" section
        ANALOGY: Like a waiter asking "Ready to order?"
      */}
      <section 
        className={`cta-section ${isVisible.cta ? 'visible' : ''}`}
        data-section="cta"
      >
        <div className="cta-container">
          <h2 className="cta-title">Ready to Transform Your Cooking?</h2>
          <p className="cta-subtitle">
            Join 500,000+ home chefs who made cooking their favorite hobby
          </p>
          <button onClick={handleGetStarted} className="btn-primary btn-large">
            Get Started Free
            <span className="btn-icon">→</span>
          </button>
          <p className="cta-note">Free forever • No credit card needed</p>
        </div>
      </section>

      {/* 
        FOOTER
        Standard website footer with links and legal stuff
      */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <span className="footer-logo">🍽️ Plated</span>
            <p className="footer-tagline">Making cooking addictive</p>
          </div>
          <div className="footer-links">
            <a href="#about">About</a>
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="footer-copyright">
            © 2025 Plated. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;