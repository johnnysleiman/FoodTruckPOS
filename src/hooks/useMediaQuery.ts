// ============================================
// MEDIA QUERY HOOK
// Custom hook for responsive breakpoint detection
// ============================================

import { useState, useEffect } from 'react';

/**
 * Custom hook to detect media query matches
 * @param query - CSS media query string (e.g., '(max-width: 768px)')
 * @returns boolean indicating if media query matches
 */
export function useMediaQuery(query: string): boolean {
  const getMatches = () => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  };

  const [matches, setMatches] = useState(getMatches);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    if (media.addEventListener) {
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    } else {
      media.addListener(listener);
      return () => media.removeListener(listener);
    }
  }, [query]);

  return matches;
}

export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1279px)');
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1280px)');
}

export function useIsLandscape(): boolean {
  return useMediaQuery('(orientation: landscape)');
}

export function useIsPortrait(): boolean {
  return useMediaQuery('(orientation: portrait)');
}

export function useBreakpoint() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  const isLandscape = useIsLandscape();
  const isPortrait = useIsPortrait();

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLandscape,
    isPortrait,
    isMobileOrTablet: isMobile || isTablet,
    isTabletLandscape: isTablet && isLandscape,
    useHamburgerMenu: isMobile || (isTablet && isPortrait),
  };
}
