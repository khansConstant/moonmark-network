import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

interface NavLink {
  href: string;
  label: string;
}

interface MobileNavProps {
  links: NavLink[];
  currentPath: string;
}

export default function MobileNav({ links, currentPath }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="inline-flex items-center justify-center rounded-md p-2 text-foreground transition-colors hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] border-l hairline bg-background p-0">
        <SheetTitle className="sr-only">Navigation menu</SheetTitle>
        <nav className="flex flex-col gap-1 px-6 py-8" aria-label="Mobile navigation">
          {links.map((link) => {
            const isActive = currentPath.startsWith(link.href);
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={isActive ? 'page' : undefined}
                className={`py-3 font-sans text-base no-underline transition-colors duration-150 ${
                  isActive
                    ? 'text-primary font-medium'
                    : 'text-foreground hover:text-primary'
                }`}
              >
                {link.label}
              </a>
            );
          })}
          <div className="mt-4 border-t hairline pt-4">
            <a
              href="/newsletter"
              onClick={() => setOpen(false)}
              className="py-3 font-sans text-base font-medium text-primary no-underline transition-colors duration-150 hover:text-ochre"
            >
              Newsletter
            </a>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
