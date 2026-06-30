import { jsx as _jsx } from "react/jsx-runtime";
import { RemixServer } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";
export default async function handleRequest(request, responseStatusCode, responseHeaders, remixContext, _loadContext) {
    const body = await renderToReadableStream(_jsx(RemixServer, { context: remixContext, url: request.url }), {
        signal: request.signal,
        onError(error) {
            console.error(error);
            responseStatusCode = 500;
        },
    });
    if (isbot(request.headers.get("user-agent") ?? "")) {
        await body.allReady;
    }
    responseHeaders.set("Content-Type", "text/html");
    return new Response(body, {
        headers: responseHeaders,
        status: responseStatusCode,
    });
}
