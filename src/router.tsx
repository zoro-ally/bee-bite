import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

// 🛡️ BROWSER SAFETY SHIM: Prevents 'require is not defined' crashes
if (typeof window !== "undefined") {
  (window as any).global = window;
  if (typeof (window as any).require === "undefined") {
    (window as any).require = (id: string) => {
      console.warn(`Attempted to require("${id}") in browser. Returning empty object to prevent crash.`);
      return {};
    };
  }
}

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
