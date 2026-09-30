'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PixelTransition from './reactbits/PixelTransition';

const ProjectTransitionContext = createContext(null);

export function ProjectTransitionProvider({ children }) {
  const router = useRouter();
  const [destination, setDestination] = useState(null);
  const [active, setActive] = useState(false);

  const openProject = useCallback((href) => {
    if (active) return;
    setDestination(href);
    setActive(true);
  }, [active]);

  const changePage = useCallback(() => {
    if (destination) router.push(destination);
  }, [destination, router]);

  const finishTransition = useCallback(() => {
    setActive(false);
    setDestination(null);
  }, []);

  return (
    <ProjectTransitionContext.Provider value={openProject}>
      {children}
      <PixelTransition
        active={active}
        columns={14}
        rows={9}
        onMidpoint={changePage}
        onComplete={finishTransition}
      />
    </ProjectTransitionContext.Provider>
  );
}

export function ProjectTransitionLink({ href, onClick, children, ...props }) {
  const openProject = useContext(ProjectTransitionContext);

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

  return <Link href={href} onClick={handleClick} {...props}>{children}</Link>;
}
