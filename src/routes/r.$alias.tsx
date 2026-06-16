import { createFileRoute, redirect } from "@tanstack/react-router";
import { trackLinkClick } from "../lib/api/links.functions.server";

export const Route = createFileRoute("/r/$alias")({
  loader: async ({ params }) => {
    const longUrl = await trackLinkClick({ data: { alias: params.alias } });
    
    if (longUrl) {
      throw redirect({
        href: longUrl,
      });
    }

    // Fallback if not found
    throw redirect({
      to: "/",
    });
  },
});
