import { useEffect } from "react";

/**
 * Lightweight IntersectionObserver hook for viewport entrance animations.
 * Automatically adds 'is-visible' to elements with '.reveal-on-scroll'.
 * Respects 'prefers-reduced-motion: reduce'.
 */
export function useScrollReveal(dependency?: unknown) {
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      document.querySelectorAll(".scroll-section, .reveal-on-scroll").forEach((el) => {
        el.classList.add("is-visible");
      });
      return;
    }

    // Immediately show if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      document.querySelectorAll(".scroll-section, .reveal-on-scroll").forEach((el) => {
        el.classList.add("is-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -30px 0px",
      }
    );

    // Short timeout to allow DOM mounting
    const timer = setTimeout(() => {
      const elements = document.querySelectorAll(".scroll-section:not(.is-visible), .reveal-on-scroll:not(.is-visible)");
      elements.forEach((el) => observer.observe(el));
    }, 40);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [dependency]);
}
