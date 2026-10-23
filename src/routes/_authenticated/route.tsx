import { createFileRoute, Outlet } from "@tanstack/react-router";

import { ConsoleLayout } from "@/components/console";

export const Route = createFileRoute("/_authenticated")({
  component: () => (
    <ConsoleLayout>
      <Outlet />
    </ConsoleLayout>
  ),
});
