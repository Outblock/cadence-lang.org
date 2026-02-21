import { createFileRoute, notFound } from '@tanstack/react-router';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { createServerFn } from '@tanstack/react-start';
import { source, getPageImage } from '@/lib/source';
import browserCollections from 'fumadocs-mdx:collections/browser';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/layouts/docs/page';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { baseOptions } from '@/lib/layout.shared';
import { useFumadocsLoader } from 'fumadocs-core/source/client';
import { Suspense } from 'react';
import { LLMCopyButton, ViewOptions } from '@/components/page-actions';

export const Route = createFileRoute('/docs/$')({
  component: Page,
  loader: async ({ params }) => {
    const slugs = params._splat?.split('/') ?? [];
    const data = await serverLoader({ data: slugs });
    await clientLoader.preload(data.path);
    return data;
  },
  head: ({ loaderData }) => {
    const title = loaderData?.title
      ? `${loaderData.title} | Cadence`
      : 'Cadence Documentation';
    const description =
      loaderData?.description ||
      'Cadence programming language documentation';
    const url = `https://cadence-lang.org/docs/${loaderData?.slugs?.join('/') || ''}`;

    const ogImage = loaderData?.ogImage || '';

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: url },
        { property: 'og:type', content: 'article' },
        { property: 'og:image', content: `https://cadence-lang.org${ogImage}` },
      ],
    };
  },
});

const serverLoader = createServerFn({
  method: 'GET',
})
  .inputValidator((slugs: string[]) => slugs)
  .handler(async ({ data: slugs }) => {
    const page = source.getPage(slugs);
    if (!page) throw notFound();

    return {
      path: page.path,
      url: page.url,
      title: page.data.title,
      description: page.data.description,
      ogImage: getPageImage(page).url,
      slugs,
      pageTree: await source.serializePageTree(source.getPageTree()),
    };
  });

const clientLoader = browserCollections.docs.createClientLoader({
  component(
    { toc, frontmatter, default: MDX },
    props: { className?: string; pageUrl?: string },
  ) {
    const markdownUrl = `${props.pageUrl}.mdx`;
    const githubUrl = `https://github.com/onflow/cadence-lang.org/blob/main/content/docs${props.pageUrl?.replace('/docs', '') || ''}.mdx`;

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: frontmatter.title,
      description: frontmatter.description || '',
      url: props.pageUrl ? `https://cadence-lang.org${props.pageUrl}` : '',
      author: {
        '@type': 'Organization',
        name: 'Flow Foundation',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Cadence',
        url: 'https://cadence-lang.org',
      },
    };

    return (
      <DocsPage toc={toc} {...props}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <DocsTitle>{frontmatter.title}</DocsTitle>
        <DocsDescription>{frontmatter.description}</DocsDescription>
        <div className="flex flex-row gap-2 items-center border-b pb-4 mb-6">
          <LLMCopyButton markdownUrl={markdownUrl} />
          <ViewOptions markdownUrl={markdownUrl} githubUrl={githubUrl} />
        </div>
        <DocsBody>
          <MDX components={{ ...defaultMdxComponents }} />
        </DocsBody>
      </DocsPage>
    );
  },
});

function Page() {
  const data = useFumadocsLoader(Route.useLoaderData());

  return (
    <DocsLayout
      {...baseOptions()}
      tree={data.pageTree}
      sidebar={{
        footer: (
          <div className="px-2 pb-1">
            {/* llms links — above icons */}
            <div className="border-t border-fd-border pt-2 mb-2">
              <p className="text-[10px] font-mono text-fd-muted-foreground uppercase tracking-widest mb-1 px-1 opacity-60">
                For AI
              </p>
              <a
                href="/llms.txt"
                className="flex items-center gap-2 px-2 py-1 rounded text-xs font-mono text-fd-muted-foreground hover:text-fd-primary hover:bg-fd-accent/50 transition-colors"
              >
                llms.txt
              </a>
              <a
                href="/llms-full.txt"
                className="flex items-center gap-2 px-2 py-1 rounded text-xs font-mono text-fd-muted-foreground hover:text-fd-primary hover:bg-fd-accent/50 transition-colors"
              >
                llms-full.txt
              </a>
            </div>
            {/* GitHub + Discord icons */}
            <div className="flex items-center gap-1 px-1">
              <a
                href="https://github.com/onflow/cadence"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="p-1.5 rounded-md text-fd-muted-foreground hover:text-fd-primary hover:bg-fd-accent/50 transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              </a>
              <a
                href="https://discord.com/invite/J6fFnh2xx6"
                target="_blank"
                rel="noreferrer"
                aria-label="Discord"
                className="p-1.5 rounded-md text-fd-muted-foreground hover:text-fd-primary hover:bg-fd-accent/50 transition-colors"
              >
                <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16">
                  <path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z" />
                </svg>
              </a>
            </div>
          </div>
        ),
      }}
    >
      <Suspense>
        {clientLoader.useContent(data.path, {
          className: '',
          pageUrl: data.url,
        })}
      </Suspense>
    </DocsLayout>
  );
}
