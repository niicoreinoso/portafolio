"use client";

import { useEffect, useRef, useState } from "react";

// "Cómo encaro un problema": una línea enredada que se ordena al hacer scroll.
// En computadora es un tubo 3D (Three.js, cargado solo acá). En celular, con los efectos
// pausados o sin WebGL, queda el mismo dibujo en plano.

const STOPS = [
  { u: 0.3, label: "relevo" },
  { u: 0.5, label: "modelo" },
  { u: 0.7, label: "mido" },
  { u: 1, label: "mejoro" },
] as const;
const PROBLEM = "Hay procesos que tardan, se repiten o que nadie termina de entender.";
const ANSWER = "Me gusta ordenarlos.";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

function canUse3D() {
  if (window.innerWidth < 768 || document.documentElement.dataset.motion === "off") return false;
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

export default function Untangle() {
  const [mode, setMode] = useState<"flat" | "3d">("flat");

  // Decide el modo y lo revisa si cambia el ancho o se pausan los efectos
  useEffect(() => {
    const check = () => setMode(canUse3D() ? "3d" : "flat");
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion"] });
    window.addEventListener("resize", check);
    return () => {
      obs.disconnect();
      window.removeEventListener("resize", check);
    };
  }, []);

  return mode === "3d" ? <Tube /> : <Flat />;
}

function Tube() {
  const pinRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tagRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const capARef = useRef<HTMLParagraphElement>(null);
  const capBRef = useRef<HTMLParagraphElement>(null);
  const barRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};

    import("three").then((THREE) => {
      const pin = pinRef.current;
      const canvas = canvasRef.current;
      if (disposed || !pin || !canvas) return;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
      camera.position.set(0, 0.4, 19);
      scene.add(new THREE.AmbientLight(0xffffff, 1.6));
      const key = new THREE.DirectionalLight(0xffffff, 2.4);
      key.position.set(4, 7, 9);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xffffff, 0.9);
      rim.position.set(-6, -3, -4);
      scene.add(rim);

      const group = new THREE.Group();
      group.position.y = -0.6;
      scene.add(group);
      const tubeMat = new THREE.MeshStandardMaterial({ roughness: 0.38, metalness: 0.08 });
      const nodeMat = new THREE.MeshStandardMaterial({ roughness: 0.5 });
      const tube = new THREE.Mesh(new THREE.BufferGeometry(), tubeMat);
      group.add(tube);
      const nodes = STOPS.map((_, i) => {
        const geo = i === STOPS.length - 1 ? new THREE.TorusGeometry(0.42, 0.12, 16, 48) : new THREE.SphereGeometry(0.26, 24, 24);
        const mesh = new THREE.Mesh(geo, i === STOPS.length - 1 ? tubeMat : nodeMat);
        mesh.scale.setScalar(0);
        group.add(mesh);
        return mesh;
      });

      // Cada punto de la línea tiene una posición "enredada" y una "ordenada": el scroll interpola entre las dos
      const N = 90;
      const HALF = 7.2;
      const tangled: InstanceType<typeof THREE.Vector3>[] = [];
      const straight: InstanceType<typeof THREE.Vector3>[] = [];
      for (let i = 0; i <= N; i++) {
        const u = i / N;
        tangled.push(
          new THREE.Vector3(
            -4.6 + 9.2 * u + 2.4 * Math.sin(u * 21 + 0.4) + 0.8 * Math.sin(u * 47),
            1.9 * Math.sin(u * 15 + 1) + 1.1 * Math.cos(u * 33),
            2.2 * Math.cos(u * 12) + 0.9 * Math.sin(u * 29 + 2),
          ),
        );
        straight.push(new THREE.Vector3(-HALF + 2 * HALF * u, 0, 0));
      }

      const build = (t: number) => {
        const pts = tangled.map((a, i) => a.clone().lerp(straight[i], ease(clamp(t * 1.5 - (i / N) * 0.5))));
        tube.geometry.dispose();
        tube.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 420, 0.11, 14, false);
      };

      const applyTheme = () => {
        const css = getComputedStyle(pin);
        tubeMat.color.set(css.getPropertyValue("--accent").trim());
        nodeMat.color.set(css.getPropertyValue("--ink").trim());
        last = -1;
      };
      const themeObs = new MutationObserver(applyTheme);
      themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

      const resize = () => {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.position.z = w < 1100 ? 23 : 19;
        camera.updateProjectionMatrix();
        last = -1;
      };

      const progress = () => {
        const r = pin.getBoundingClientRect();
        return clamp(-r.top / (r.height - window.innerHeight));
      };

      let last = -1;
      let visible = false;
      let clock = 0;
      let raf = 0;
      const v = new THREE.Vector3();
      const frame = () => {
        raf = requestAnimationFrame(frame);
        if (!visible) return;
        clock += 0.016;
        const t = progress();
        if (Math.abs(t - last) > 0.0005) {
          build(t);
          last = t;
          if (titleRef.current) titleRef.current.textContent = t < 0.55 ? PROBLEM : ANSWER;
          if (capARef.current) capARef.current.style.opacity = String(1 - clamp(t * 2.5));
          if (capBRef.current) capBRef.current.style.opacity = String(clamp((t - 0.7) * 4));
          if (barRef.current) barRef.current.style.width = `${(t * 100).toFixed(1)}%`;
        }
        // Mientras está enredada, la línea "respira" un poco; al ordenarse queda quieta
        const calm = 1 - ease(clamp(t * 1.2));
        group.rotation.y = calm * (0.55 + Math.sin(clock * 0.5) * 0.08);
        group.rotation.x = calm * (0.25 + Math.cos(clock * 0.4) * 0.05);
        STOPS.forEach(({ u }, i) => {
          const s = ease(clamp((t - 0.78 - i * 0.04) * 7));
          nodes[i].position.copy(straight[Math.round(u * N)]);
          nodes[i].scale.setScalar(s);
          const tag = tagRefs.current[i];
          if (!tag) return;
          nodes[i].getWorldPosition(v).project(camera);
          tag.style.left = `${((v.x + 1) / 2) * canvas.clientWidth}px`;
          tag.style.top = `${((1 - v.y) / 2) * canvas.clientHeight - 22}px`;
          tag.style.opacity = String(s);
        });
        renderer.render(scene, camera);
      };

      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "100px" });
      io.observe(pin);
      window.addEventListener("resize", resize);
      resize();
      applyTheme();
      build(0);
      frame();

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        themeObs.disconnect();
        window.removeEventListener("resize", resize);
        tube.geometry.dispose();
        nodes.forEach((n) => n.geometry.dispose());
        tubeMat.dispose();
        nodeMat.dispose();
        renderer.dispose();
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <section ref={pinRef} id="como-trabajo" className="relative h-[320vh]" aria-label="Cómo encaro un problema">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="relative z-10 mx-auto max-w-[1080px] px-5 pt-24 sm:px-10">
          <p className="kicker">Cómo encaro un problema</p>
          <p ref={titleRef} className="mt-3 max-w-2xl text-4xl leading-[1.1] font-bold tracking-[-0.035em]" aria-live="polite">
            {PROBLEM}
          </p>
        </div>
        <canvas ref={canvasRef} className="absolute inset-0 size-full" aria-hidden />
        {STOPS.map((s, i) => (
          <span
            key={s.label}
            ref={(el) => {
              tagRefs.current[i] = el;
            }}
            className={`untangle-tag ${i === STOPS.length - 1 ? "text-accent" : "text-ink"}`}
            aria-hidden
          >
            {s.label}
          </span>
        ))}
        <p ref={capARef} className="absolute bottom-[72px] left-5 font-mono text-[13px] text-muted sm:left-10">así llegan muchos procesos</p>
        <p ref={capBRef} className="absolute right-5 bottom-[72px] font-mono text-[13px] text-muted opacity-0 sm:right-10">así me gusta dejarlos</p>
        <div className="absolute inset-x-5 bottom-10 h-0.5 rounded-full bg-line sm:inset-x-10">
          <i ref={barRef} className="block h-full w-0 rounded-full bg-accent" />
        </div>
      </div>
    </section>
  );
}

const TANGLE =
  "M10 120 C40 40, 90 200, 120 110 S170 20, 150 90 S60 190, 130 170 S260 30, 210 110 S120 150, 190 60 S320 170, 280 130 S220 40, 300 70 S400 190, 360 120 S330 60, 420 110 C450 126, 470 112, 500 112 H1000";

function Flat() {
  // Se observa solo: puede montarse después de que Effects ya registró los .reveal de la página
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && el.classList.add("is-visible"), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="como-trabajo" className="mx-auto max-w-[1080px] px-5 py-20 sm:px-10 sm:py-28">
      <div ref={ref} className="reveal">
        <p className="kicker">Cómo encaro un problema</p>
        <p className="mt-3 max-w-2xl text-xl leading-snug font-semibold tracking-[-0.02em] text-muted sm:text-2xl">{PROBLEM}</p>
        <p className="mt-1 text-4xl font-bold tracking-[-0.04em] sm:text-5xl">{ANSWER}</p>

        {/* Pantallas medianas y grandes: la línea horizontal */}
        <svg className="draw flat-line mt-12 hidden w-full text-ink sm:block" viewBox="0 0 1040 220" aria-hidden>
          <path className="l" pathLength={1} d={TANGLE} />
          {[610, 720, 830].map((x, k) => (
            <g key={x} className="n" style={{ "--k": k } as React.CSSProperties}>
              <circle cx={x} cy="112" r="9" style={{ fill: "var(--bg)" }} />
              <text x={x} y="86" textAnchor="middle" fontSize="17" fontWeight="600">
                {STOPS[k].label}
              </text>
            </g>
          ))}
          <g className="n" style={{ "--k": 3 } as React.CSSProperties}>
            <circle className="e" cx="1010" cy="112" r="13" strokeWidth="3" style={{ fill: "var(--bg)" }} />
            <text className="e" x="1010" y="80" textAnchor="middle" fontSize="17" fontWeight="600">
              mejoro
            </text>
          </g>
          <text className="m" x="200" y="214" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12">
            así llegan muchos procesos
          </text>
          <text className="m" x="760" y="160" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12">
            así me gusta dejarlos
          </text>
        </svg>

        {/* Celular: un enredo chico arriba y los pasos en vertical */}
        <div className="mt-10 sm:hidden">
          <svg className="draw flat-line h-24 w-full text-ink" viewBox="0 0 500 200" preserveAspectRatio="xMinYMid meet" aria-hidden>
            <path className="l" pathLength={1} d={TANGLE.replace(" H1000", " H500")} />
          </svg>
          <ol className="mt-4 border-l-2 border-accent pl-6">
            {STOPS.map((s, k) => (
              <li key={s.label} className={`relative py-3 text-xl font-semibold ${k === STOPS.length - 1 ? "text-accent" : ""}`}>
                <span className="absolute top-1/2 -left-[33px] size-4 -translate-y-1/2 rounded-full border-2 border-accent bg-bg" />
                {s.label}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
