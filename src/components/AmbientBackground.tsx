import React, { useEffect, useRef } from "react";

interface GraphNode {
  x: number;
  y: number;
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

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Highly optimized node count for buttery mobile performance
    const isMobile = width < 768;
    const nodeCount = isMobile ? 14 : 24;
    const maxDistance = isMobile ? 95 : 125;
    const maxDist2 = maxDistance * maxDistance;

    interface LeafGraphNode extends GraphNode {
      hasSprout: boolean;
      sproutAngle: number;
      stemLength: number;
    }

    const nodes: LeafGraphNode[] = [];
    for (let i = 0; i < nodeCount; i++) {
      // Designate ~25% of nodes to have a seedling/leaf pair sprout
      const hasSprout = i % 4 === 0;
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 0.6 + 1.2,
        hasSprout,
        sproutAngle: Math.random() * 0.8 - 0.4 - Math.PI / 2, // pointing generally upward
        stemLength: Math.random() * 6 + 14,
      });
    }

    // Draw an organic almond/pointed leaf matching reference image
    const drawBotanicalLeaf = (
      context: CanvasRenderingContext2D,
      x: number,
      y: number,
      angle: number,
      length: number,
      width: number,
      alpha: number,
    ) => {
      if (alpha <= 0.02) return;
      context.save();
      context.translate(x, y);
      context.rotate(angle);

      // 1. Leaf body (almond/oval pointed curve)
      context.beginPath();
      context.moveTo(0, 0);
      context.quadraticCurveTo(length * 0.45, -width * 0.6, length, 0);
      context.quadraticCurveTo(length * 0.45, width * 0.6, 0, 0);
      context.closePath();

      // Soft luminous warm amber-bronze leaf fill
      context.fillStyle = `rgba(105, 88, 74, ${Math.min(alpha * 0.85, 0.9)})`;
      context.fill();

      // Delicate golden amber outer rim stroke
      context.strokeStyle = `rgba(168, 145, 120, ${Math.min(alpha * 0.9, 0.95)})`;
      context.lineWidth = 0.85;
      context.stroke();

      // 2. Center midrib / vein (delicate warm cream vein)
      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(length * 0.9, 0);
      context.strokeStyle = `rgba(235, 222, 210, ${Math.min(alpha * 1.1, 1.0)})`;
      context.lineWidth = 0.95;
      context.stroke();

      context.restore();
    };

    // Draw botanical constellation once with warm amber tones
    const drawConstellation = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw connecting edges and attached leaves along edges
      ctx.lineWidth = 0.85;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist2 = dx * dx + dy * dy;

          if (dist2 < maxDist2) {
            const dist = Math.sqrt(dist2);
            const edgeRatio = 1 - dist / maxDistance;
            const alpha = edgeRatio * 0.38;

            // Draw edge line
            ctx.beginPath();
            ctx.strokeStyle = `rgba(168, 145, 120, ${alpha * 0.35})`;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();

            // Place leaves along certain edges
            const isLeafEdge = (i * 7 + j * 11) % 4 === 0;
            if (isLeafEdge && edgeRatio > 0.18) {
              const leafT = 0.48;
              const leafX = nodes[i].x + dx * leafT;
              const leafY = nodes[i].y + dy * leafT;
              const lineAngle = Math.atan2(dy, dx);
              const leafAlpha = Math.min(edgeRatio * 1.4, 0.88);

              drawBotanicalLeaf(
                ctx,
                leafX,
                leafY,
                lineAngle,
                15,
                6.8,
                leafAlpha,
              );
            }
          }
        }
      }

      // 2. Draw node dots & sprout leaf pairs
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        // Node dot
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(184, 160, 136, 0.65)";
        ctx.fill();

        // If node has sprout: draw stem and two sprouting leaves (seedling)
        if (node.hasSprout) {
          const currentStemAngle = node.sproutAngle;
          const tipX = node.x + Math.cos(currentStemAngle) * node.stemLength;
          const tipY = node.y + Math.sin(currentStemAngle) * node.stemLength;

          // Tiny organic stem
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(tipX, tipY);
          ctx.strokeStyle = "rgba(168, 145, 120, 0.65)";
          ctx.lineWidth = 1.1;
          ctx.stroke();

          // Two sprouting leaves from stem tip
          drawBotanicalLeaf(
            ctx,
            tipX,
            tipY,
            currentStemAngle - 0.45,
            12,
            5.2,
            0.85,
          );

          drawBotanicalLeaf(
            ctx,
            tipX,
            tipY,
            currentStemAngle + 0.45,
            12,
            5.2,
            0.85,
          );
        }
      }
    };

    drawConstellation();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      drawConstellation();
    };

    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 w-full h-full max-w-full overflow-hidden z-0 select-none"
      aria-hidden="true"
    >
      {/* 1. Base Hazy Dark Espresso Gradient (desaturated #26201B to #14100E) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_65%_at_50%_-10%,_#26201B_0%,_#1C1714_50%,_#14100E_100%)]" />

      {/* 2. Fast GPU Hazy Amber/Mocha Radial Gradients */}
      <div className="absolute -top-24 -left-16 w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(168,145,120,0.05)_0%,_rgba(125,105,90,0.02)_45%,_transparent_70%)] animate-ambient-1" />
      <div className="absolute top-1/3 -right-12 w-[380px] h-[380px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(168,145,120,0.04)_0%,_rgba(105,90,75,0.02)_50%,_transparent_70%)] animate-ambient-2" />
      <div className="absolute -bottom-16 left-1/4 w-[360px] h-[360px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(125,105,90,0.05)_0%,_transparent_65%)] animate-ambient-3" />

      {/* 3. Ultra-Light Dot Matrix Grid in Muted Stardust */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.20] animate-dot-matrix"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="ambient-dot-matrix"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.1" fill="#A89178" fillOpacity="0.10" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ambient-dot-matrix)" />
      </svg>

      {/* 4. Smooth Connected Graph Canvas with Dynamic Botanical Leaves */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-80"
      />

      {/* 5. Elegant Drifting Small Leaves in Muted Taupe-Bronze (GPU-composited translate3d) */}
      <div className="absolute top-[10%] left-[8%] animate-leaf-drift-1">
        <SmallLeaf className="w-4 h-4 text-[#A89178]/15 transform -rotate-12" />
      </div>

      <div
        className="absolute top-[22%] right-[10%] animate-leaf-drift-2"
        style={{ animationDelay: "3.5s" }}
      >
        <SmallLeaf className="w-3.5 h-3.5 text-[#B8A087]/14 transform rotate-45" />
      </div>

      <div
        className="absolute top-[65%] left-[6%] animate-leaf-drift-3"
        style={{ animationDelay: "7s" }}
      >
        <SmallLeaf className="w-3.5 h-3.5 text-[#A89178]/14 transform -rotate-30" />
      </div>

      <div
        className="absolute top-[80%] right-[12%] animate-leaf-drift-1"
        style={{ animationDelay: "5s" }}
      >
        <SmallLeaf className="w-4 h-4 text-[#B8A087]/15 transform rotate-20" />
      </div>
    </div>
  );
});

AmbientBackground.displayName = "AmbientBackground";
