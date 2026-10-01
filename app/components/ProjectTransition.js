'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import PixelTransition from './reactbits/PixelTransition';

const ProjectTransitionContext = createContext(null);
const transitionVariants = ['scatter', 'checker', 'iris', 'cascade'];

export function ProjectTransitionProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [destination, setDestination] = useState(null);
  const [active, setActive] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [variant, setVariant] = useState('scatter');
  const previousVariant = useRef(null);
  const destinationPath = destination?.split(/[?#]/)[0] || null;
  const readyToReveal = Boolean(active && navigating && destinationPath === pathname);

  const openProject = useCallback((href) => {
    if (active) return;
    const choices = transitionVariants.filter((item) => item !== previousVariant.current);
    const nextVariant = choices[Math.floor(Math.random() * choices.length)];
    previousVariant.current = nextVariant;
    setVariant(nextVariant);
    setDestination(href);
    setNavigating(false);
    router.prefetch(href);
    setActive(true);
  }, [active, router]);

  const changePage = useCallback(() => {
    if (!destination) return;
    setNavigating(true);
    router.push(destination);
  }, [destination, router]);

  useEffect(() => {
    if (!active || !navigating || !destination) return undefined;
    if (readyToReveal) return undefined;

    const hardNavigationFallback = window.setTimeout(() => {
      window.location.assign(destination);
    }, 6000);
    return () => window.clearTimeout(hardNavigationFallback);
  }, [active, destination, navigating, readyToReveal]);

  const finishTransition = useCallback(() => {
    setActive(false);
    setNavigating(false);
    setDestination(null);
  }, []);

  return (
    <ProjectTransitionContext.Provider value={openProject}>
      {children}
      <PixelTransition
        active={active}
        reveal={readyToReveal}
        variant={variant}
        columns={14}
        rows={9}
        onMidpoint={changePage}
        onComplete={finishTransition}
      />
    </ProjectTransitionContext.Provider>
  );
}

export function ProjectTransitionLink({ href, onClick, onFocus, onPointerDown, onPointerEnter, prefetch = true, children, ...props }) {
  const openProject = useContext(ProjectTransitionContext);
  const router = useRouter();

  const warmProjectRoute = () => router.prefetch(href);

  const handleClick = (event) => {
    onClick?.(event);
    if (
      event.defaultPrevented
      || event.button !== 0
      || event.metaKey
      || event.ctrlKey
      || event.shiftKey
      || event.altKey
      || props.target === '_blank'
      || !openProject
    ) return;

    event.preventDefault();
    openProject(href);
  };

  return (
    <Link
      href={href}
      prefetch={prefetch}
      onClick={handleClick}
      onFocus={(event) => { onFocus?.(event); warmProjectRoute(); }}
      onPointerDown={(event) => { onPointerDown?.(event); warmProjectRoute(); }}
      onPointerEnter={(event) => { onPointerEnter?.(event); warmProjectRoute(); }}
      {...props}
    >
      {children}
    </Link>
  );
}
