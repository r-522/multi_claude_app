import { DecomposeRequestSchema } from "~/features/tasks/schemas/tasks.schema";
import { TaskService } from "~/features/tasks/services/TaskService";
import { toAppError } from "~/shared/lib/errors";
export async function action({ request, context }) {
    try {
        const body = await request.json();
        const data = DecomposeRequestSchema.parse(body);
        const service = new TaskService(context.cloudflare.env);
        const result = await service.decompose(data);
        return Response.json(result);
    }
    catch (err) {
        return toAppError(err).toResponse();
    }
}
