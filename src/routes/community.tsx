import { createFileRoute } from '@tanstack/react-router';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';

export const Route = createFileRoute('/community')({
  component: Community,
  head: () => ({
    meta: [
      { title: 'Cadence: Community' },
      {
        name: 'description',
        content: 'Join the Cadence community and contribute to the future of smart contract development.',
      },
    ],
  }),
});

function Community() {
  return (
    <HomeLayout {...baseOptions()}>
      <div className="max-w-[70.4rem] mx-auto px-6 py-8">
        <h1 className="gradient-heading text-3xl mb-4">Community</h1>
        <p className="mb-2">Welcome to the Cadence community!</p>
        <p className="mb-4">
          Together, we are working to build a programming language to empower
          everyone to push the boundaries of smart contracts and on-chain logic.
        </p>
        <p className="mb-4">
          Contributing to Cadence is easy. You can join the community by:
        </p>
        <ul className="list-disc pl-6 space-y-4">
          <li>
            <strong>
              <span className="inline-block mt-2 text-2xl mr-1">⭐</span>{' '}
              Opening a{' '}
              <a
                href="https://github.com/onflow/cadence/issues/new?assignees=turbolent&labels=Feature%2CFeedback&projects=&template=feature-request.yaml"
                className="font-bold"
              >
                feature request
              </a>{' '}
              or{' '}
              <a
                href="https://github.com/onflow/cadence/issues/new?assignees=turbolent&labels=Feature%2CFeedback&projects=&template=feature-request.yaml"
                className="font-bold"
              >
                improvement request
              </a>
            </strong>
          </li>
          <li>
            <strong>
              <span className="inline-block mt-2 text-2xl mr-1">🛠</span>{' '}
              Working on a feature or improvement.
            </strong>
            <p className="mt-1">
              There are several good first issues that are looking for
              contributors{' '}
              <a
                href="https://github.com/onflow/cadence/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%22Good+First+Issue%22"
                className="font-bold"
              >
                in the main Cadence repository
              </a>{' '}
              and{' '}
              <a
                href="https://github.com/onflow/cadence-tools/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%22Good+First+Issue%22"
                className="font-bold"
              >
                in the Cadence tools repository
              </a>
              .
            </p>
          </li>
          <li>
            <strong>
              <span className="inline-block mt-2 text-2xl mr-1">💬</span>{' '}
              Participating in the{' '}
              <a
                href="https://github.com/onflow/flips/pulls?q=is%3Apr+is%3Aopen+sort%3Aupdated-desc+label%3A%22flip%3A+cadence%22"
                className="font-bold"
              >
                FLIP (Flow Improvement Proposal) discussions
              </a>
              .
            </strong>
            <p className="mt-1">
              <a
                href="https://github.com/onflow/flips#flips-flow-improvement-proposals"
                className="font-bold"
              >
                Learn more about FLIPs
              </a>
            </p>
          </li>
          <li>
            <strong>
              <span className="inline-block mt-2 text-2xl mr-1">💭</span>{' '}
              Joining the{' '}
              <a
                href="https://docs.google.com/document/d/1KMGdiZ7qX9aoyH2WEVGHjsvBTNPTN6my8LcNmSVivLQ/edit"
                className="font-bold"
              >
                Cadence Language Design Meetings
              </a>{' '}
              to discuss the design and implementation of Cadence.
            </strong>
            <p className="mt-1">
              In the meetings, the core contributors and the community
              investigate, design, and ultimately decide on language features.
            </p>
          </li>
        </ul>
      </div>
    </HomeLayout>
  );
}
