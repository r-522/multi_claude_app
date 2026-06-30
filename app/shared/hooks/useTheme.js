import { useState, useEffect, useCallback } from "react";
const STORAGE_KEY = "theme";
function getSystemTheme() {
    if (typeof window === "undefined")
        return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function applyTheme(theme) {
    const resolved = theme === "system" ? getSystemTheme() : theme;
    document.documentElement.classList.toggle("dark", resolved === "dark");
}
export function useTheme() {
    const [theme, setThemeState] = useState("system");
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        const initial = stored ?? "system";
        setThemeState(initial);
        applyTheme(initial);
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = () => {
            if (theme === "system")
                applyTheme("system");
        };
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, [theme]);
    const setTheme = useCallback((next) => {
        setThemeState(next);
        localStorage.setItem(STORAGE_KEY, next);
        applyTheme(next);
    }, []);
    return { theme, setTheme };
}
