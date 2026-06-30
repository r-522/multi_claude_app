import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { GenerateRequestSchema } from "~/features/builder/schemas/builder.schema";
import { BuilderService } from "~/features/builder/services/BuilderService";
import { toAppError } from "~/shared/lib/errors";

export async function action({ request, context }: ActionFunctionArgs) {
  try {
    const body = await request.json();
    const { rawInput, analysis } = GenerateRequestSchema.parse(body);
    const service = new BuilderService(context.cloudflare.env);
    const result = await service.generate(rawInput, analysis);
    return Response.json(result);
  } catch (err) {
    return toAppError(err).toResponse();
  }
}
