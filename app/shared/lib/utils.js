import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { nanoid as _nanoid } from "nanoid";
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
export function nanoid() {
    return _nanoid(21);
}
export function formatTokens(tokens) {
    if (tokens < 1000)
        return String(tokens);
    return `${(tokens / 1000).toFixed(1)}k`;
}
export function formatDate(date) {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60_000);
    const diffHours = Math.floor(diffMs / 3_600_000);
    const diffDays = Math.floor(diffMs / 86_400_000);
    if (diffMins < 1)
        return "just now";
    if (diffMins < 60)
        return `${diffMins}m ago`;
    if (diffHours < 24)
        return `${diffHours}h ago`;
    if (diffDays < 7)
        return `${diffDays}d ago`;
    return date.toLocaleDateString();
}
export function truncate(text, maxLength) {
    if (text.length <= maxLength)
        return text;
    return `${text.slice(0, maxLength - 3)}...`;
}
export function generateTitle(firstMessage) {
    return truncate(firstMessage.trim().replace(/\n/g, " "), 60);
}
export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
