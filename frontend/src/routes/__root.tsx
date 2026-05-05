import { Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "MLBB Coach Decision System" },
      { name: "description", content: "Esports analytics & lineup optimizer for Mobile Legends coaches." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "MLBB Coach Decision System" },
      { property: "og:description", content: "Esports analytics & lineup optimizer for Mobile Legends coaches." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "MLBB Coach Decision System" },
      { name: "twitter:description", content: "Esports analytics & lineup optimizer for Mobile Legends coaches." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ed804f24-72ac-49b7-a9b7-33ecfab39675/id-preview-67e47c7d--a0a26027-67cc-4a98-a897-12e63003fa61.lovable.app-1777866318389.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ed804f24-72ac-49b7-a9b7-33ecfab39675/id-preview-67e47c7d--a0a26027-67cc-4a98-a897-12e63003fa61.lovable.app-1777866318389.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Rajdhani:wght@400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <AppLayout />;
}
