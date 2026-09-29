"use client";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export function Hero() {
  const [videoFailed, setVideoFailed] = useState(false);
  return <section className="hero" id="top">
    {!videoFailed && <video autoPlay muted loop playsInline preload="metadata" poster="/images/hero-fallback.jpg" onError={() => setVideoFailed(true)}><source src="/videos/hero.mp4" type="video/mp4" /></video>}
    <div className="hero-fallback" aria-hidden="true"><div className="arches" /><div className="walkway" /></div><div className="hero-shade" />
    <motion.div className="hero-copy" initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .9, ease: [.2,.8,.2,1] }}>
      <p className="eyebrow light">Your first day, before move-in day</p><h1>Experience life at Rice<br/>before you get here.</h1>
      <p className="hero-sub">Choose a residential college and explore the walks, places, and everyday moments that make Rice feel like home.</p>
      <div className="hero-actions"><a className="button button--light" href="/campus">Explore Rice <ArrowUpRight size={18}/></a><a className="text-link light" href="/portfolio">Michael’s portfolio <ArrowUpRight size={16}/></a></div>
    </motion.div><p className="hero-caption">AI campus exploration · Houston, Texas</p>
  </section>;
}
