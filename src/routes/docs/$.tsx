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
import {
  AISearch,
  AISearchPanel,
  AISearchTrigger,
} from '@/components/search';
import { MessageCircleIcon } from 'lucide-react';

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
        { property: 'og:site_name', content: 'Cadence' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: `https://cadence-lang.org${ogImage}` },
      ],
      links: [
        { rel: 'canonical', href: url },
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
      <DocsPage
        toc={toc}
        tableOfContent={{
          style: 'clerk',
        }}
        {...props}>
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
    <AISearch>
      <AISearchPanel />
      {/* Floating Cadence AI button — bottom-right */}
      <AISearchTrigger
        position="float"
        className="bg-fd-primary text-fd-primary-foreground px-4 py-2.5 rounded-full text-sm font-medium"
      >
        <MessageCircleIcon className="size-4" />
        Ask Cadence AI
      </AISearchTrigger>
      <DocsLayout
        {...baseOptions()}
        tree={data.pageTree}
      >
        <Suspense>
          {clientLoader.useContent(data.path, {
            className: '',
            pageUrl: data.url,
          })}
        </Suspense>
      </DocsLayout>
    </AISearch>
  );
}
