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

    // Gracefully handle environments without canvas 2d context (e.g., jsdom / unit tests)
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Responsive node density
    const nodeCount = width < 768 ? 22 : 36;
    const maxDistance = width < 768 ? 95 : 125;

    const nodes: GraphNode[] = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.2 + 1.2,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Dynamic animation loop: updating nodes & drawing connecting edges
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

      // 2. Draw connected graph lines between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.22;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(126, 169, 132, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // 3. Draw node dots
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(126, 169, 132, 0.45)";
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
      {/* 1. Deep Atmospheric Ambient Sage Glows */}
      <div className="absolute -top-32 -left-20 w-[550px] h-[450px] rounded-full bg-[#5B8B67]/[0.08] blur-[150px] animate-ambient-1" />
      <div className="absolute top-1/3 -right-24 w-[500px] h-[500px] rounded-full bg-[#7EA984]/[0.06] blur-[160px] animate-ambient-2" />
      <div className="absolute -bottom-24 left-1/4 w-[450px] h-[450px] rounded-full bg-[#3E6349]/[0.06] blur-[140px] animate-ambient-1" />

      {/* 2. Dot Matrix Grid Overlay */}
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

      {/* 3. Dynamic Moving Connected Graph Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-80"
      />

      {/* 4. Elegant Drifting Small Leaves */}
      {/* Leaf 1 - Top Left */}
      <div className="absolute top-[12%] left-[8%] animate-leaf-drift-1">
        <SmallLeaf className="w-5 h-5 text-[#7EA984]/25 drop-shadow-[0_2px_8px_rgba(126,169,132,0.15)] transform -rotate-12" />
      </div>

      {/* Leaf 2 - Top Right */}
      <div
        className="absolute top-[18%] right-[12%] animate-leaf-drift-2"
        style={{ animationDelay: "3.5s" }}
      >
        <SmallLeaf className="w-4 h-4 text-[#7EA984]/20 transform rotate-45" />
      </div>

      {/* Leaf 3 - Mid Left */}
      <div
        className="absolute top-[48%] left-[5%] animate-leaf-drift-3"
        style={{ animationDelay: "7s" }}
      >
        <SmallLeaf className="w-4.5 h-4.5 text-[#7EA984]/22 transform -rotate-30" />
      </div>

      {/* Leaf 4 - Mid Right */}
      <div
        className="absolute top-[55%] right-[7%] animate-leaf-drift-1"
        style={{ animationDelay: "5s" }}
      >
        <SmallLeaf className="w-3.5 h-3.5 text-[#7EA984]/20 transform rotate-20" />
      </div>

      {/* Leaf 5 - Lower Left */}
      <div
        className="absolute top-[78%] left-[15%] animate-leaf-drift-2"
        style={{ animationDelay: "9s" }}
      >
        <SmallLeaf className="w-4 h-4 text-[#7EA984]/24 transform rotate-60" />
      </div>

      {/* Leaf 6 - Lower Right */}
      <div
        className="absolute top-[82%] right-[18%] animate-leaf-drift-3"
        style={{ animationDelay: "1.5s" }}
      >
        <SmallLeaf className="w-5 h-5 text-[#7EA984]/18 transform -rotate-45" />
      </div>

      {/* Subtle Vignette overlay to keep workout cards prominent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#7EA984]/[0.02] via-transparent to-transparent opacity-90" />
    </div>
  );
};
