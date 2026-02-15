import { createFileRoute, notFound } from '@tanstack/react-router';
import { source } from '@/lib/source';

export const Route = createFileRoute('/og/docs/$')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const slugs = (params._splat?.split('/') ?? []).filter(
          (v) => v.length > 0,
        );
        // Remove the last segment (image.webp)
        const page = source.getPage(slugs.slice(0, -1));
        if (!page) throw notFound();

        try {
          // Dynamic import to avoid crashing the serverless function
          // when the native binding is not available (e.g. on Vercel)
          const { ImageResponse } = await import('@takumi-rs/image-response');

          return new ImageResponse(
            (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #0a0a0a, #1a1a2e)',
                  padding: '60px 80px',
                  fontFamily: 'Geist, sans-serif',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '40px',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #00D87E, #00EF8B)',
                    }}
                  />
                  <span
                    style={{
                      color: '#888',
                      fontSize: '24px',
                      fontWeight: 500,
                    }}
                  >
                    Cadence Documentation
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <h1
                    style={{
                      fontSize: '56px',
                      fontWeight: 700,
                      color: '#fff',
                      lineHeight: 1.2,
                      margin: 0,
                    }}
                  >
                    {page.data.title}
                  </h1>
                  {page.data.description && (
                    <p
                      style={{
                        fontSize: '24px',
                        color: '#888',
                        lineHeight: 1.5,
                        marginTop: '20px',
                      }}
                    >
                      {page.data.description}
                    </p>
                  )}
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid #333',
                    paddingTop: '20px',
                  }}
                >
                  <span style={{ color: '#555', fontSize: '18px' }}>
                    cadence-lang.org
                  </span>
                  <span
                    style={{
                      color: '#00D87E',
                      fontSize: '18px',
                      fontWeight: 500,
                    }}
                  >
                    Flow Blockchain
                  </span>
                </div>
              </div>
            ),
            {
              width: 1200,
              height: 630,
              format: 'webp',
            },
          );
        } catch {
          // Fallback: return a simple SVG-based image when native binding unavailable
          const title = page.data.title;
          const desc = page.data.description || '';
          const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#0a0a0a"/>
                <stop offset="100%" style="stop-color:#1a1a2e"/>
              </linearGradient>
              <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#00D87E"/>
                <stop offset="100%" style="stop-color:#00EF8B"/>
              </linearGradient>
            </defs>
            <rect width="1200" height="630" fill="url(#bg)"/>
            <rect x="80" y="60" width="40" height="40" rx="8" fill="url(#accent)"/>
            <text x="132" y="90" font-family="sans-serif" font-size="24" fill="#888">Cadence Documentation</text>
            <text x="80" y="320" font-family="sans-serif" font-size="48" font-weight="bold" fill="#fff">${escapeXml(title)}</text>
            <text x="80" y="370" font-family="sans-serif" font-size="22" fill="#888">${escapeXml(desc.slice(0, 100))}</text>
            <line x1="80" y1="550" x2="1120" y2="550" stroke="#333" stroke-width="1"/>
            <text x="80" y="590" font-family="sans-serif" font-size="18" fill="#555">cadence-lang.org</text>
            <text x="1020" y="590" font-family="sans-serif" font-size="18" fill="#00D87E">Flow Blockchain</text>
          </svg>`;

          return new Response(svg, {
            headers: {
              'Content-Type': 'image/svg+xml',
              'Cache-Control': 'public, max-age=86400',
            },
          });
        }
      },
    },
  },
});

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
