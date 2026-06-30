import { NavLink } from "@remix-run/react";
import { MessageSquare, Wand2, CheckSquare, Moon, Sun } from "lucide-react";
import { cn } from "~/shared/lib/utils";
import { useTheme } from "~/shared/hooks/useTheme";
import { Tooltip } from "~/shared/components/ui/Tooltip";

const navItems = [
  { to: "/chat", icon: MessageSquare, label: "Chat" },
  { to: "/builder", icon: Wand2, label: "Builder" },
  { to: "/tasks", icon: CheckSquare, label: "Tasks" },
];

export function Sidebar() {
  const { theme, setTheme } = useTheme();

  return (
    <aside className="flex flex-col w-[var(--sidebar-width)] h-dvh border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 h-12 px-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="h-5 w-5 rounded-md bg-indigo-500 shrink-0" />
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Claude Chat</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 p-2 flex-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-500 dark:text-zinc-500 hover:bg-white dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300",
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Theme toggle */}
      <div className="p-2 border-t border-zinc-200 dark:border-zinc-800">
        <Tooltip content={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-zinc-500 dark:text-zinc-500 hover:bg-white dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300 w-full transition-colors"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
          </button>
        </Tooltip>
      </div>
    </aside>
  );
}
