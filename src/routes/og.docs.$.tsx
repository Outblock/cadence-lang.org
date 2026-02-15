import { createFileRoute, notFound } from '@tanstack/react-router';
import { source } from '@/lib/source';
import { ImageResponse } from '@takumi-rs/image-response';

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
      },
    },
  },
});
