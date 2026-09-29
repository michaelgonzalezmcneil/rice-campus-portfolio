"use client";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu } from "lucide-react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const onScroll = () => setScrolled(scrollY > 32); onScroll(); addEventListener("scroll", onScroll); return () => removeEventListener("scroll", onScroll); }, []);
  return <header className={`nav ${scrolled ? "nav--solid" : ""}`}>
    <a className="wordmark" href="#top" aria-label="RiceWalk home"><span>R</span>RiceWalk</a>
    <nav aria-label="Main navigation"><a href="#explore">Explore</a><a href="#process">How it works</a><a href="#campus">Campus</a><a href="/portfolio">Portfolio</a></nav>
    <a className="nav-cta" href="/campus">Explore Rice <ArrowUpRight size={15} /></a><a className="menu" href="/campus" aria-label="Explore Rice campus game"><ArrowUpRight /></a>
  </header>;
}
