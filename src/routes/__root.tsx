import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router';
import * as React from 'react';
import appCss from '@/styles/app.css?url';
import { RootProvider } from 'fumadocs-ui/provider/tanstack';
import { SITE_URL } from '@/lib/site';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Cadence - Build the Future of Consumer DeFi' },
      {
        name: 'description',
        content:
          'Cadence is the resource-oriented programming language for building secure smart contracts on Flow.',
      },
      { property: 'og:site_name', content: 'Cadence' },
      { property: 'og:logo', content: `${SITE_URL}/img/logo.svg` },
      { property: 'og:locale', content: 'en_US' },
      { name: 'theme-color', content: '#00D87E' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico' },
    ],
    scripts: import.meta.env.VITE_GTAG
      ? [
          {
            src: `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GTAG}`,
            async: true,
          },
          {
            children: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${import.meta.env.VITE_GTAG}');`,
          },
          {
            children: `(function(h,o,t,j,a,r){h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};h._hjSettings={hjid:5179370,hjsv:6};a=o.getElementsByTagName('head')[0];r=o.createElement('script');r.async=1;r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;a.appendChild(r);})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`,
          },
        ]
      : [],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
        <Scripts />
      </body>
    </html>
  );
}
