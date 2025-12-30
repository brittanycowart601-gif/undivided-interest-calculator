import { useEffect, useState } from 'react';

/**
 * Reusable Modal wrapper component
 * Design: Modern, clean with subtle animations
 */
export function Modal({ isOpen, onClose, title, children, maxWidth = '520px' }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Trigger animation after mount
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  // Icon component for close button
  const IconClose = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );

  return (
    <div
      className="no-print"
      style={{
        position: 'fixed',
        inset: 0,
        background: isAnimating ? 'rgba(15, 23, 42, 0.6)' : 'rgba(15, 23, 42, 0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '24px',
        overflow: 'auto',
        backdropFilter: isAnimating ? 'blur(8px)' : 'blur(0px)',
        WebkitBackdropFilter: isAnimating ? 'blur(8px)' : 'blur(0px)',
        transition: 'background 0.2s ease, backdrop-filter 0.2s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={{
        background: 'var(--white)',
        maxWidth,
        width: '100%',
        borderRadius: 'var(--radius-lg)',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-xl)',
        transform: isAnimating ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(12px)',
        opacity: isAnimating ? 1 : 0,
        transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease',
      }}>
        {/* Header */}
        <div style={{
          padding: 'var(--space-5) var(--space-6)',
          borderBottom: '1px solid var(--slate-100)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
          background: 'var(--white)',
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '1.125rem',
            fontWeight: '600',
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'var(--slate-100)',
              border: 'none',
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-tertiary)',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--slate-200)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--slate-100)';
              e.currentTarget.style.color = 'var(--text-tertiary)';
            }}
          >
            <IconClose />
          </button>
        </div>

        {/* Body */}
        <div style={{
          padding: 'var(--space-6)',
          overflowY: 'auto',
          flex: 1,
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}
