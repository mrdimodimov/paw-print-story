import { Link } from "react-router-dom";

export interface BreadcrumbItem {
  name: string;
  href: string;
}

interface Props {
  items: BreadcrumbItem[];
  className?: string;
}

const SITE = "https://paw-print-story.lovable.app";

export function SeoBreadcrumbs({ items, className = "" }: Props) {
  const crumbs: BreadcrumbItem[] = [
    { name: "Home", href: "/" },
    ...items,
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE}${c.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className={`mx-auto max-w-[700px] px-5 pt-4 ${className}`}>
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          {crumbs.map((c, i) => (
            <li key={c.href} className="flex items-center gap-1">
              {i > 0 && <span className="mx-1">›</span>}
              {i < crumbs.length - 1 ? (
                <Link to={c.href} className="hover:text-primary transition-colors">{c.name}</Link>
              ) : (
                <span className="text-foreground font-medium">{c.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
