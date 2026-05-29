import React, { useEffect, useRef, useState, useMemo } from 'react';
import styles from './PixelArtPortfolio.module.css';

/**
 * COLOR PALETTES - Customize these to match your brand
 * Each palette is an array of hex colors that will be used to render pixel art
 */
const PALETTES = {
  cyberpunk: ['#0a0e27', '#16213e', '#ff006e', '#00d9ff', '#ffbe0b'],
  forest: ['#1b3d2c', '#2d5a3d', '#4a9d6f', '#7bc94f', '#c8f7dc'],
  sunset: ['#2a1a42', '#8b3a62', '#ff6b6b', '#ffa500', '#ffe66d'],
  retro: ['#2c2137', '#764462', '#d72638', '#ff9500', '#ffd60a'],
  ocean: ['#0b3d91', '#1d5a96', '#2b9fd9', '#5dd9c1', '#a8dadc'],
};

/**
 * PRESET PATTERNS - Define different pixel grid patterns
 * These generate base patterns that will be revealed on hover
 * Pattern format: 2D array of indices into the color palette
 */
const PATTERNS = {
  profile: [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 2, 2, 1, 1, 0],
    [1, 1, 2, 2, 2, 2, 1, 1],
    [1, 2, 2, 3, 3, 2, 2, 1],
    [1, 2, 2, 3, 3, 2, 2, 1],
    [1, 1, 2, 2, 2, 2, 1, 1],
    [0, 1, 1, 4, 4, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
  ],
  star: [
    [0, 0, 1, 0, 0],
    [0, 1, 2, 1, 0],
    [1, 2, 3, 2, 1],
    [0, 1, 2, 1, 0],
    [0, 0, 1, 0, 0],
  ],
  circuit: [
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 2, 2, 2, 2, 0, 1],
    [1, 0, 2, 3, 3, 2, 0, 1],
    [0, 0, 2, 3, 3, 2, 0, 0],
    [0, 0, 2, 3, 3, 2, 0, 0],
    [1, 0, 2, 2, 2, 2, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
  ],
};

interface PixelArtPortfolioProps {
  /** Grid size (e.g., 8 creates an 8x8 grid). Default: 8 */
  gridSize?: number;
  /** Palette key from PALETTES object. Default: 'cyberpunk' */
  palette?: keyof typeof PALETTES;
  /** Pattern key from PATTERNS object. Default: 'profile' */
  pattern?: keyof typeof PATTERNS;
  /** Title or name displayed above the pixel art */
  title?: string;
  /** Description displayed below the pixel art */
  description?: string;
  /** Callback fired when pixel art is hovered */
  onHover?: (isHovering: boolean) => void;
  /** Custom className for wrapper */
  className?: string;
}

/**
 * PixelArtPortfolio - Interactive pixel art component with hover reveal
 *
 * FEATURES:
 * - Dynamic pixel grid rendering using div elements
 * - Smooth hover animation revealing pixel colors
 * - Staggered animation delays for sequential reveal effect
 * - Fully customizable palettes and patterns
 * - Responsive design with CSS Grid
 * - TypeScript for type safety
 *
 * USAGE:
 * <PixelArtPortfolio
 *   gridSize={8}
 *   palette="cyberpunk"
 *   pattern="profile"
 *   title="John Developer"
 *   description="Creative Code Artist"
 * />
 */
export const PixelArtPortfolio: React.FC<PixelArtPortfolioProps> = ({
  gridSize = 8,
  palette = 'cyberpunk',
  pattern = 'profile',
  title = 'Portfolio',
  description = 'Hover to reveal',
  onHover,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Generate pixel data: uses pattern if available, else creates random pattern
  const pixelData = useMemo(() => {
    const selectedPattern = PATTERNS[pattern] || PATTERNS.profile;
    const selectedPalette = PALETTES[palette] || PALETTES.cyberpunk;

    // Scale pattern to match gridSize using interpolation
    return scalePattern(selectedPattern, gridSize).map((row) =>
      row.map((colorIndex) => ({
        colorIndex: Math.min(colorIndex, selectedPalette.length - 1),
        color: selectedPalette[Math.min(colorIndex, selectedPalette.length - 1)],
      }))
    );
  }, [gridSize, palette, pattern]);

  // Handle hover state
  const handleMouseEnter = () => {
    setIsHovering(true);
    onHover?.(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    onHover?.(false);
  };

  // Trigger load animation on mount
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const paletteColors = PALETTES[palette];

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className || ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.content}>
        {/* Header */}
        <div className={`${styles.header} ${isLoaded ? styles.headerLoaded : ''}`}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.subtitle}>{description}</p>
        </div>

        {/* Pixel Grid */}
        <div className={`${styles.gridWrapper} ${isHovering ? styles.hovering : ''}`}>
          <div
            className={styles.pixelGrid}
            style={{
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              gridTemplateRows: `repeat(${gridSize}, 1fr)`,
            }}
          >
            {pixelData.map((row, rowIdx) =>
              row.map((pixel, colIdx) => {
                const delayIndex = rowIdx * gridSize + colIdx;
                const staggerDelay = (delayIndex * 30) / 1000; // ms to seconds

                return (
                  <div
                    key={`${rowIdx}-${colIdx}`}
                    className={`${styles.pixel} ${isHovering ? styles.pixelRevealed : ''}`}
                    style={{
                      backgroundColor: isHovering ? pixel.color : '#1a1a1a',
                      '--stagger-delay': `${staggerDelay}s`,
                    } as React.CSSProperties & { '--stagger-delay': string }}
                  />
                );
              })
            )}
          </div>

          {/* Glow effect overlay */}
          <div className={`${styles.glowOverlay} ${isHovering ? styles.glowActive : ''}`} />
        </div>

        {/* Interactive hint */}
        <div className={`${styles.hint} ${isHovering ? styles.hintHidden : ''}`}>
          Hover to reveal
        </div>
      </div>
    </div>
  );
};

/**
 * HELPER FUNCTIONS
 */

/**
 * Scale a 2D pattern array to match target grid size using nearest-neighbor interpolation
 * This allows small patterns (e.g., 5x5) to be displayed on larger grids (e.g., 32x32)
 */
function scalePattern(pattern: number[][], targetSize: number): number[][] {
  const sourceHeight = pattern.length;
  const sourceWidth = pattern[0]?.length || sourceHeight;

  const scaled: number[][] = Array(targetSize)
    .fill(null)
    .map(() => Array(targetSize).fill(0));

  for (let y = 0; y < targetSize; y++) {
    for (let x = 0; x < targetSize; x++) {
      // Map target coordinates back to source pattern
      const sourceX = Math.floor((x / targetSize) * sourceWidth);
      const sourceY = Math.floor((y / targetSize) * sourceHeight);

      scaled[y][x] = pattern[sourceY]?.[sourceX] ?? 0;
    }
  }

  return scaled;
}

/**
 * ADVANCED: Generate a random pixel pattern
 * Use this function to create procedurally generated patterns
 */
export function generateRandomPattern(
  size: number,
  paletteSize: number,
  seed?: number
): number[][] {
  const rng = seededRandom(seed ?? Math.random() * 10000);

  return Array(size)
    .fill(null)
    .map(() =>
      Array(size)
        .fill(null)
        .map(() => Math.floor(rng() * paletteSize))
    );
}

/**
 * Seeded random number generator for reproducible patterns
 */
function seededRandom(seed: number) {
  return function () {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

export default PixelArtPortfolio;
