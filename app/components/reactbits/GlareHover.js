'use client';

import './GlareHover.css';

// Adapted from React Bits: GlareHover (CSS variant).
export default function GlareHover({
  children,
  background = '#111111',
  borderRadius = '0px',
  borderColor = 'transparent',
  glareColor = '#ffffff',
  glareOpacity = 0.16,
  glareAngle = -35,
  glareSize = 210,
  transitionDuration = 700,
  className = '',
  style = {},
}) {
  const hex = glareColor.replace('#', '');
  const validHex = /^[0-9A-Fa-f]{6}$/.test(hex);
  const rgba = validHex
    ? `rgba(${parseInt(hex.slice(0, 2), 16)}, ${parseInt(hex.slice(2, 4), 16)}, ${parseInt(hex.slice(4, 6), 16)}, ${glareOpacity})`
    : glareColor;
  const variables = {
    '--gh-bg': background,
    '--gh-br': borderRadius,
    '--gh-angle': `${glareAngle}deg`,
    '--gh-duration': `${transitionDuration}ms`,
    '--gh-size': `${glareSize}%`,
    '--gh-rgba': rgba,
    '--gh-border': borderColor,
  };

  return <div className={`glare-hover ${className}`} style={{ ...variables, ...style }}>{children}</div>;
}
