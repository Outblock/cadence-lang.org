import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/og/home')({
  server: {
    handlers: {
      GET: async () => {
        const title = 'The Safest, Most Composable Language for Web3';
        const description =
          'Built for AI-native development. Cadence gives AI agents and human developers the same first-class primitives — resource ownership, capability-based security, and composable contracts.';

        try {
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
                    gap: '16px',
                    marginBottom: '40px',
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #00D87E, #00EF8B)',
                    }}
                  />
                  <span
                    style={{
                      color: '#fff',
                      fontSize: '32px',
                      fontWeight: 700,
                    }}
                  >
                    Cadence
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
                    {title}
                  </h1>
                  <p
                    style={{
                      fontSize: '22px',
                      color: '#888',
                      lineHeight: 1.5,
                      marginTop: '24px',
                      maxWidth: '900px',
                    }}
                  >
                    {description}
                  </p>
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
            <rect x="80" y="60" width="48" height="48" rx="10" fill="url(#accent)"/>
            <text x="140" y="96" font-family="sans-serif" font-size="32" font-weight="bold" fill="#fff">Cadence</text>
            <text x="80" y="280" font-family="sans-serif" font-size="48" font-weight="bold" fill="#fff">The Safest, Most Composable</text>
            <text x="80" y="340" font-family="sans-serif" font-size="48" font-weight="bold" fill="#fff">Language for Web3</text>
            <text x="80" y="400" font-family="sans-serif" font-size="20" fill="#888">Built for AI-native development with resource ownership and capability-based security.</text>
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
