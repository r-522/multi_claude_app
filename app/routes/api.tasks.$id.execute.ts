import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { ExecutePhaseRequestSchema } from "~/features/tasks/schemas/tasks.schema";
import { TaskService } from "~/features/tasks/services/TaskService";
import { toAppError } from "~/shared/lib/errors";

export async function action({ params, request, context }: ActionFunctionArgs) {
  try {
    const body = await request.json();
    const { subTaskId, phase, context: ctx } = ExecutePhaseRequestSchema.parse(body);
    const service = new TaskService(context.cloudflare.env);
    const result = await service.executePhase(subTaskId, phase, ctx ?? {});
    return Response.json(result);
  } catch (err) {
    return toAppError(err).toResponse();
  }
}
