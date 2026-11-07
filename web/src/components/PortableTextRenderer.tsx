import { PortableText } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';

interface Props {
  value: PortableTextBlock[];
}

const components = {
  block: {
    normal: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
    h2: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
    h3: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
    blockquote: ({ children }: { children: React.ReactNode }) => <blockquote>{children}</blockquote>,
  },
  list: {
    bullet: ({ children }: { children: React.ReactNode }) => <ul>{children}</ul>,
    number: ({ children }: { children: React.ReactNode }) => <ol>{children}</ol>,
  },
  listItem: {
    bullet: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
    number: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
  },
  marks: {
    strong: ({ children }: { children: React.ReactNode }) => <strong>{children}</strong>,
    em: ({ children }: { children: React.ReactNode }) => <em>{children}</em>,
    link: ({ children, value }: { children: React.ReactNode; value?: { href?: string } }) => {
      const href = value?.href || '#';
      const isExternal = href.startsWith('http');
      return (
        <a href={href} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noopener noreferrer' : undefined}>
          {children}
        </a>
      );
    },
  },
};

export default function PortableTextRenderer({ value }: Props) {
  return (
    <div className="prose">
      <PortableText value={value} components={components} />
    </div>
  );
}
