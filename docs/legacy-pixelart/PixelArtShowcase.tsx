import React, { useState } from 'react';
import { PixelArtPortfolio, generateRandomPattern } from './PixelArtPortfolio';
import styles from './PixelArtShowcase.module.css';

/**
 * PixelArtShowcase
 *
 * Complete example page demonstrating:
 * - Multiple palette variations
 * - Different pattern presets
 * - Grid size customization
 * - Interactive controls
 * - Responsive layout
 *
 * To use this in your portfolio:
 * 1. Copy PixelArtPortfolio.tsx and PixelArtPortfolio.module.css to your components folder
 * 2. Import and customize the PixelArtPortfolio component
 * 3. Adjust palettes, patterns, and grid sizes to match your brand
 */

export const PixelArtShowcase: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const showcaseItems = [
    {
      id: 'profile-cyberpunk',
      title: 'John Developer',
      description: 'Creative Code Artist',
      gridSize: 8,
      palette: 'cyberpunk' as const,
      pattern: 'profile' as const,
    },
    {
      id: 'circuit-forest',
      title: 'Project Alpha',
      description: 'Machine Learning Engineer',
      gridSize: 8,
      palette: 'forest' as const,
      pattern: 'circuit' as const,
    },
    {
      id: 'star-sunset',
      title: 'Creative Studios',
      description: 'Design & Development',
      gridSize: 8,
      palette: 'sunset' as const,
      pattern: 'star' as const,
    },
    {
      id: 'profile-ocean',
      title: 'Tech Innovator',
      description: 'Full Stack Developer',
      gridSize: 8,
      palette: 'ocean' as const,
      pattern: 'profile' as const,
    },
    {
      id: 'circuit-retro',
      title: 'Retro Gaming',
      description: 'Game Developer',
      gridSize: 8,
      palette: 'retro' as const,
      pattern: 'circuit' as const,
    },
  ];

  return (
    <div className={styles.showcase}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1 className={styles.mainTitle}>Pixel Art Portfolio</h1>
        <p className={styles.heroDescription}>
          Interactive pixel art components with hover reveal effects
        </p>
      </section>

      {/* Grid Showcase */}
      <section className={styles.gallerySection}>
        <h2 className={styles.sectionTitle}>Component Variations</h2>
        <div className={styles.gallery}>
          {showcaseItems.map((item, index) => (
            <div
              key={item.id}
              className={styles.galleryItem}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <PixelArtPortfolio
                gridSize={item.gridSize}
                palette={item.palette}
                pattern={item.pattern}
                title={item.title}
                description={item.description}
                onHover={(isHovering) => {
                  if (isHovering) setHoveredIndex(index);
                }}
              />
              <div className={styles.itemMeta}>
                <code>{item.palette}</code>
                <code>{item.pattern}</code>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Documentation */}
      <section className={styles.docSection}>
        <h2 className={styles.sectionTitle}>Getting Started</h2>
        <div className={styles.docContent}>
          <div className={styles.docCard}>
            <h3>Installation</h3>
            <pre className={styles.code}>{`// 1. Copy files to your project
src/components/
  ├── PixelArtPortfolio.tsx
  └── PixelArtPortfolio.module.css

// 2. Install dependency (if not present)
npm install react

// 3. Import in your component
import { PixelArtPortfolio } from './components/PixelArtPortfolio';`}</pre>
          </div>

          <div className={styles.docCard}>
            <h3>Basic Usage</h3>
            <pre className={styles.code}>{`<PixelArtPortfolio
  gridSize={8}
  palette="cyberpunk"
  pattern="profile"
  title="Your Name"
  description="Your Title"
/>`}</pre>
          </div>

          <div className={styles.docCard}>
            <h3>Props</h3>
            <pre className={styles.code}>{`interface PixelArtPortfolioProps {
  gridSize?: number;           // Grid dimensions (default: 8)
  palette?: string;             // 'cyberpunk' | 'forest' | 'sunset' | 'retro' | 'ocean'
  pattern?: string;             // 'profile' | 'circuit' | 'star'
  title?: string;              // Displayed above pixel art
  description?: string;         // Subtitle text
  onHover?: (isHovering: boolean) => void;
  className?: string;
}`}</pre>
          </div>

          <div className={styles.docCard}>
            <h3>Customization</h3>
            <pre className={styles.code}>{`// 1. Add custom palettes in PixelArtPortfolio.tsx
const PALETTES = {
  myCustomPalette: ['#1a1a2e', '#16213e', '#0f3460', '#e94560'],
  ...
};

// 2. Create custom patterns
const PATTERNS = {
  myPattern: [
    [0, 1, 0],
    [1, 2, 1],
    [0, 1, 0],
  ],
  ...
};

// 3. Use in component
<PixelArtPortfolio
  palette="myCustomPalette"
  pattern="myPattern"
/>`}</pre>
          </div>

          <div className={styles.docCard}>
            <h3>Procedural Generation</h3>
            <pre className={styles.code}>{`import { generateRandomPattern } from './PixelArtPortfolio';

// Generate random 16x16 pattern with 4-color palette
const randomPattern = generateRandomPattern(16, 4, 12345);

// Use with custom pattern prop or store in PATTERNS
// (Requires modifying component to accept custom patterns)`}</pre>
          </div>
        </div>
      </section>

      {/* Palettes Reference */}
      <section className={styles.paletteSection}>
        <h2 className={styles.sectionTitle}>Available Palettes</h2>
        <div className={styles.paletteGrid}>
          {[
            { name: 'Cyberpunk', colors: ['#0a0e27', '#16213e', '#ff006e', '#00d9ff', '#ffbe0b'] },
            { name: 'Forest', colors: ['#1b3d2c', '#2d5a3d', '#4a9d6f', '#7bc94f', '#c8f7dc'] },
            { name: 'Sunset', colors: ['#2a1a42', '#8b3a62', '#ff6b6b', '#ffa500', '#ffe66d'] },
            { name: 'Retro', colors: ['#2c2137', '#764462', '#d72638', '#ff9500', '#ffd60a'] },
            { name: 'Ocean', colors: ['#0b3d91', '#1d5a96', '#2b9fd9', '#5dd9c1', '#a8dadc'] },
          ].map((palette) => (
            <div key={palette.name} className={styles.paletteCard}>
              <h4>{palette.name}</h4>
              <div className={styles.colorSwatches}>
                {palette.colors.map((color) => (
                  <div
                    key={color}
                    className={styles.swatch}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <code className={styles.colorCode}>{palette.colors.join(', ')}</code>
            </div>
          ))}
        </div>
      </section>

      {/* Patterns Reference */}
      <section className={styles.patternSection}>
        <h2 className={styles.sectionTitle}>Available Patterns</h2>
        <div className={styles.patternList}>
          <div className={styles.patternCard}>
            <h4>Profile</h4>
            <p>Square-based portrait pattern, ideal for profile pictures or avatars</p>
            <code>pattern="profile"</code>
          </div>
          <div className={styles.patternCard}>
            <h4>Star</h4>
            <p>5-point star pattern, compact and distinctive</p>
            <code>pattern="star"</code>
          </div>
          <div className={styles.patternCard}>
            <h4>Circuit</h4>
            <p>Electronic circuit-inspired pattern with borders</p>
            <code>pattern="circuit"</code>
          </div>
        </div>
      </section>

      {/* Integration Tips */}
      <section className={styles.tipsSection}>
        <h2 className={styles.sectionTitle}>Integration Tips</h2>
        <ul className={styles.tipsList}>
          <li>
            <strong>Responsive Layout:</strong> The component uses CSS variables and scales
            automatically for mobile devices (140px-300px width).
          </li>
          <li>
            <strong>Font Installation:</strong> The component uses 'Orbitron' font family. Add to
            your HTML head or import from Google Fonts:
            <code>&lt;link href="...googleapis.com/css?family=Orbitron:700" rel="stylesheet"&gt;</code>
          </li>
          <li>
            <strong>CSS Modules:</strong> Component uses CSS Modules by default. If using global
            styles, convert imports to match your setup.
          </li>
          <li>
            <strong>Performance:</strong> Component uses useMemo and useRef for optimal rendering.
            Safe to render multiple instances.
          </li>
          <li>
            <strong>Accessibility:</strong> Includes focus states and respects prefers-reduced-motion.
            Fully keyboard accessible.
          </li>
          <li>
            <strong>Custom Animations:</strong> Modify CSS variables in .module.css to adjust
            timing and easing of hover effects.
          </li>
        </ul>
      </section>
    </div>
  );
};

export default PixelArtShowcase;
