import React, { useEffect, useRef } from "react";

interface LeafSprout {
  type: "pair" | "single";
  stemLength: number;
  baseAngle: number;
  leafLength: number;
  leafWidth: number;
  variant: "light" | "forest";
}

interface GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  phase: number;
  swaySpeed: number;
  sprout: LeafSprout | null;
}

// Elegant organic floating leaf SVG icon for background drift accents
const SmallLeaf: React.FC<{
  className?: string;
  style?: React.CSSProperties;
}> = ({ className = "", style }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    style={style}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20.88 3.12a2.89 2.89 0 0 0-2.05-.85C13.2 2.27 7.15 6.31 4.54 11.87A13.88 13.88 0 0 0 3 17.5c0 .34.03.68.08 1.02a1 1 0 0 0 1.15.86c.34-.05.68-.08 1.02-.08 1.95 0 3.86-.53 5.54-1.54 5.56-2.61 9.6-8.66 9.6-14.29a2.89 2.89 0 0 0-.85-2.05zM5.3 16.7c.3-1.63.95-3.18 1.9-4.55l6.35 6.35c-1.37.95-2.92 1.6-4.55 1.9-.34-.03-.68-.08-1.02-.15.07-.34.12-.68.15-1.02zm8.7-2.1l-5.6-5.6c2.08-2.67 5.12-4.57 8.56-5.26-.69 3.44-2.59 6.48-5.26 8.56z" />
  </svg>
);

export const AmbientBackground: React.FC = React.memo(() => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext("2d");
    } catch {
      return;
    }
    if (!ctx) return;

    let animationFrameId: number | null = null;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const setupCanvasDimensions = () => {
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    setupCanvasDimensions();

    const isMobile = width < 768;
    const nodeCount = isMobile ? 18 : 34;
    const maxDistance = isMobile ? 130 : 175;
    const maxDist2 = maxDistance * maxDistance;

    // Initialize moving dynamic nodes with velocity and botanical sprout configurations
    const nodes: GraphNode[] = [];
    for (let i = 0; i < nodeCount; i++) {
      let sprout: LeafSprout | null = null;

      if (i % 3 === 0) {
        // Paired sprout (2 leaves in V-shape at stem tip, like reference image)
        sprout = {
          type: "pair",
          stemLength: 16 + Math.random() * 8,
          baseAngle: -Math.PI / 2 + (Math.random() * 1.4 - 0.7), // Upwards oriented
          leafLength: 15 + Math.random() * 4,
          leafWidth: 6.5 + Math.random() * 1.8,
          variant: "light",
        };
      } else if (i % 3 === 1) {
        // Single hanging/angled leaf with midrib
        sprout = {
          type: "single",
          stemLength: 8 + Math.random() * 6,
          baseAngle: Math.PI / 2 + (Math.random() * 1.2 - 0.6), // Downwards/hanging
          leafLength: 16 + Math.random() * 4,
          leafWidth: 7.0 + Math.random() * 1.8,
          variant: i % 2 === 0 ? "forest" : "light",
        };
      }

      // Gentle drift speed (0.15 - 0.32 px per frame)
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.16 + Math.random() * 0.16;

      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 0.8 + 3.0,
        phase: Math.random() * Math.PI * 2,
        swaySpeed: 0.0012 + Math.random() * 0.0014,
        sprout,
      });
    }

    // Draw an organic almond/pointed leaf matching reference image with center vein
    const drawBotanicalLeaf = (
      context: CanvasRenderingContext2D,
      x: number,
      y: number,
      leafAngle: number,
      length: number,
      leafW: number,
      alpha: number,
      variant: "light" | "forest" = "light",
    ) => {
      if (alpha <= 0.02) return;
      context.save();
      context.translate(x, y);
      context.rotate(leafAngle);

      // 1. Almond / pointed oval silhouette
      context.beginPath();
      context.moveTo(0, 0);
      context.quadraticCurveTo(length * 0.44, -leafW * 0.58, length, 0);
      context.quadraticCurveTo(length * 0.44, leafW * 0.58, 0, 0);
      context.closePath();

      // Soft sage/forest leaf fill
      if (variant === "light") {
        context.fillStyle = `rgba(141, 185, 158, ${Math.min(alpha * 0.94, 0.96)})`;
      } else {
        context.fillStyle = `rgba(66, 102, 77, ${Math.min(alpha * 0.96, 0.98)})`;
      }
      context.fill();

      // Outer rim stroke
      if (variant === "light") {
        context.strokeStyle = `rgba(172, 212, 188, ${Math.min(alpha * 0.88, 0.94)})`;
      } else {
        context.strokeStyle = `rgba(88, 130, 102, ${Math.min(alpha * 0.9, 0.96)})`;
      }
      context.lineWidth = 0.85;
      context.stroke();

      // 2. Crisp center midrib vein (pale mint / ivory vein)
      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(length * 0.88, 0);
      context.strokeStyle =
        variant === "light"
          ? `rgba(230, 248, 238, ${Math.min(alpha * 0.98, 1.0)})`
          : `rgba(152, 186, 166, ${Math.min(alpha * 0.95, 0.98)})`;
      context.lineWidth = 1.05;
      context.stroke();

      context.restore();
    };

    // Render single frame of moving graph and botanical leaves
    const renderFrame = (timestamp: number) => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      const margin = 50;

      // 1. Update node positions with gentle floating drift and organic oscillation
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.x +=
          node.vx + Math.sin(timestamp * node.swaySpeed + node.phase) * 0.08;
        node.y +=
          node.vy + Math.cos(timestamp * node.swaySpeed + node.phase) * 0.08;

        // Smooth screen boundary wrap
        if (node.x < -margin) node.x = width + margin;
        else if (node.x > width + margin) node.x = -margin;

        if (node.y < -margin) node.y = height + margin;
        else if (node.y > height + margin) node.y = -margin;
      }

      // 2. Draw connecting edges (with multi-strand organic vine look like reference image)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist2 = dx * dx + dy * dy;

          if (dist2 < maxDist2) {
            const dist = Math.sqrt(dist2);
            const ratio = 1 - dist / maxDistance;
            const alpha = Math.min(ratio * 0.75, 0.65);

            // Primary connecting edge line (soft sage/forest)
            ctx.beginPath();
            ctx.strokeStyle = `rgba(62, 108, 85, ${alpha})`;
            ctx.lineWidth = 1.1;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();

            // Organic bundle strand (parallel fiber line when close)
            if (ratio > 0.28) {
              const nx = (-dy / dist) * 1.2;
              const ny = (dx / dist) * 1.2;
              ctx.beginPath();
              ctx.strokeStyle = `rgba(62, 108, 85, ${alpha * 0.42})`;
              ctx.lineWidth = 0.75;
              ctx.moveTo(nodes[i].x + nx, nodes[i].y + ny);
              ctx.lineTo(nodes[j].x + nx, nodes[j].y + ny);
              ctx.stroke();
            }

            // Leaves growing along select connecting edges
            const isEdgeLeaf = (i * 7 + j * 13) % 4 === 0;
            if (isEdgeLeaf && ratio > 0.4) {
              const t = 0.46;
              const lx = nodes[i].x + dx * t;
              const ly = nodes[i].y + dy * t;
              const edgeAngle = Math.atan2(dy, dx);
              const leafSway = Math.sin(timestamp * 0.0018 + i + j) * 0.12;

              drawBotanicalLeaf(
                ctx,
                lx,
                ly,
                edgeAngle + leafSway,
                14,
                6.0,
                Math.min(ratio * 1.35, 0.92),
                "light",
              );
            }
          }
        }
      }

      // 3. Draw nodes and sprouting leaves
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        // Node junction circle (soft sage/mint tone from reference image)
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(125, 177, 151, 0.92)";
        ctx.fill();

        // Subtle soft outer glow border around junction
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 0.8, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(168, 212, 188, 0.40)";
        ctx.lineWidth = 0.75;
        ctx.stroke();

        // Dynamic botanical leaf sprouts
        if (node.sprout) {
          const {
            type,
            stemLength,
            baseAngle,
            leafLength,
            leafWidth,
            variant,
          } = node.sprout;
          const currentSway = Math.sin(timestamp * 0.0018 + node.phase) * 0.15;
          const stemAngle = baseAngle + currentSway;

          const tipX = node.x + Math.cos(stemAngle) * stemLength;
          const tipY = node.y + Math.sin(stemAngle) * stemLength;

          // Organic delicate stem
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(tipX, tipY);
          ctx.strokeStyle = "rgba(82, 128, 102, 0.82)";
          ctx.lineWidth = 1.2;
          ctx.stroke();

          if (type === "pair") {
            // Two leaves sprouting from stem tip in V-shape with gentle breeze flutter
            const flutter1 = Math.sin(timestamp * 0.0024 + node.phase) * 0.07;
            const flutter2 =
              Math.sin(timestamp * 0.0024 + node.phase + 1.2) * 0.07;

            drawBotanicalLeaf(
              ctx,
              tipX,
              tipY,
              stemAngle - 0.44 + flutter1,
              leafLength,
              leafWidth,
              0.94,
              variant,
            );

            drawBotanicalLeaf(
              ctx,
              tipX,
              tipY,
              stemAngle + 0.44 + flutter2,
              leafLength,
              leafWidth,
              0.94,
              variant,
            );
          } else if (type === "single") {
            // Single hanging/angled leaf with center vein
            drawBotanicalLeaf(
              ctx,
              tipX,
              tipY,
              stemAngle,
              leafLength,
              leafWidth,
              0.94,
              variant,
            );
          }
        }
      }
    };

    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      renderFrame(0);
      return;
    }

    // Dynamic 60fps animation loop
    const animate = (timestamp: number) => {
      renderFrame(timestamp);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Battery & CPU optimization: pause animation when page/tab is hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      } else {
        if (animationFrameId === null) {
          animationFrameId = requestAnimationFrame(animate);
        }
      }
    };

    const handleResize = () => {
      setupCanvasDimensions();
    };

    window.addEventListener("resize", handleResize, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 w-full h-full max-w-full overflow-hidden z-0 select-none"
      aria-hidden="true"
    >
      {/* 1. Base Hazy Dark Espresso Gradient (desaturated #26201B to #14100E) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_65%_at_50%_-10%,_#26201B_0%,_#1C1714_50%,_#14100E_100%)]" />

      {/* 2. Fast GPU Hazy Amber/Mocha Radial Ambient Glows */}
      <div className="absolute -top-24 -left-16 w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(168,145,120,0.05)_0%,_rgba(125,105,90,0.02)_45%,_transparent_70%)] animate-ambient-1" />
      <div className="absolute top-1/3 -right-12 w-[380px] h-[380px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(168,145,120,0.04)_0%,_rgba(105,90,75,0.02)_50%,_transparent_70%)] animate-ambient-2" />
      <div className="absolute -bottom-16 left-1/4 w-[360px] h-[360px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(125,105,90,0.05)_0%,_transparent_65%)] animate-ambient-3" />

      {/* 3. Crisp Background Dot Matrix Grid (sampled from reference image #1B2822 at 32px spacing) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-95"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="ambient-dot-matrix"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="16"
              cy="16"
              r="1.35"
              fill="#527863"
              fillOpacity="0.45"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ambient-dot-matrix)" />
      </svg>

      {/* 4. Moving Dynamic Connected Graph Canvas with Botanical Leaves */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-100 pointer-events-none"
      />

      {/* 5. Subtle Drifting Ambient Leaves in Sage-Taupe */}
      <div className="absolute top-[12%] left-[7%] animate-leaf-drift-1">
        <SmallLeaf className="w-4 h-4 text-[#7A9C88]/20 transform -rotate-12" />
      </div>

      <div
        className="absolute top-[24%] right-[9%] animate-leaf-drift-2"
        style={{ animationDelay: "3.5s" }}
      >
        <SmallLeaf className="w-3.5 h-3.5 text-[#88AB96]/18 transform rotate-45" />
      </div>

      <div
        className="absolute top-[68%] left-[5%] animate-leaf-drift-3"
        style={{ animationDelay: "7s" }}
      >
        <SmallLeaf className="w-3.5 h-3.5 text-[#7A9C88]/18 transform -rotate-30" />
      </div>

      <div
        className="absolute top-[82%] right-[11%] animate-leaf-drift-1"
        style={{ animationDelay: "5s" }}
      >
        <SmallLeaf className="w-4 h-4 text-[#88AB96]/20 transform rotate-20" />
      </div>
    </div>
  );
});

AmbientBackground.displayName = "AmbientBackground";
