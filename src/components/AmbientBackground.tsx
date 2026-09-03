import React, { useEffect, useRef } from "react";

interface GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

// Elegant organic leaf SVG icon
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

export const AmbientBackground: React.FC = () => {
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

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Highly optimized node count for buttery mobile performance
    const isMobile = width < 768;
    const nodeCount = isMobile ? 12 : 24;
    const maxDistance = isMobile ? 85 : 115;
    const maxDist2 = maxDistance * maxDistance;

    const nodes: GraphNode[] = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 0.8 + 1.1,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize, { passive: true });

    // 60fps high-efficiency rendering
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Move nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;
      }

      // 2. Draw connecting edges with fast distance squared check
      ctx.lineWidth = 0.75;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist2 = dx * dx + dy * dy;

          if (dist2 < maxDist2) {
            const dist = Math.sqrt(dist2);
            const alpha = (1 - dist / maxDistance) * 0.2;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(126, 169, 132, ${alpha})`;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // 3. Draw node dots
      ctx.fillStyle = "rgba(126, 169, 132, 0.4)";
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden z-0 select-none"
      aria-hidden="true"
    >
      {/* 1. Fast GPU Radial Gradients (No heavy blur filters to avoid mobile lag) */}
      <div className="absolute -top-24 -left-16 w-[400px] h-[350px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(91,139,103,0.12)_0%,_transparent_70%)] animate-ambient-1" />
      <div className="absolute top-1/3 -right-20 w-[380px] h-[380px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(126,169,132,0.09)_0%,_transparent_70%)] animate-ambient-2" />

      {/* 2. Ultra-Light Dot Matrix Grid */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.22] animate-dot-matrix"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="ambient-dot-matrix"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.1" fill="#7EA984" fillOpacity="0.65" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ambient-dot-matrix)" />
      </svg>

      {/* 3. Smooth Connected Graph Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-70"
      />

      {/* 4. Elegant Drifting Small Leaves (GPU-composited translate3d) */}
      <div className="absolute top-[10%] left-[8%] animate-leaf-drift-1">
        <SmallLeaf className="w-4 h-4 text-[#7EA984]/20 transform -rotate-12" />
      </div>

      <div
        className="absolute top-[22%] right-[10%] animate-leaf-drift-2"
        style={{ animationDelay: "3.5s" }}
      >
        <SmallLeaf className="w-3.5 h-3.5 text-[#7EA984]/18 transform rotate-45" />
      </div>

      <div
        className="absolute top-[65%] left-[6%] animate-leaf-drift-3"
        style={{ animationDelay: "7s" }}
      >
        <SmallLeaf className="w-3.5 h-3.5 text-[#7EA984]/18 transform -rotate-30" />
      </div>

      <div
        className="absolute top-[80%] right-[12%] animate-leaf-drift-1"
        style={{ animationDelay: "5s" }}
      >
        <SmallLeaf className="w-4 h-4 text-[#7EA984]/20 transform rotate-20" />
      </div>
    </div>
  );
};
