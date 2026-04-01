import type { APIRoute } from "astro";
import { API_ADMIN_TOKEN, API_BASE_URL } from "astro:env/server";
import { authorizeUser, canManageUser } from "@/utils/auth";

export const POST: APIRoute = async ({ request, cookies }) => {
  return await handleRequest(request, cookies, "POST");
};

export const PATCH: APIRoute = async ({ request, cookies }) => {
  return await handleRequest(request, cookies, "PATCH");
};

async function handleRequest(request: Request, cookies: any, method: string) {
  const authCookie = cookies.get("CF_Authorization");
  const auth = await authorizeUser(authCookie?.value);

  if (!auth.canManage) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Clone the request because we need to read the body twice (once for validation, once maybe for proxying)
  // Actually we can just stringify the parsed JSON for proxying
  let payload;
  try {
    payload = await request.clone().json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "Bad Request: Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (!canManageUser(payload.teams, auth)) {
    return new Response(JSON.stringify({ error: "Forbidden: Cannot modify this user's teams or you lack permission to manage this role." }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }

  const response = await fetch(`${API_BASE_URL}/api/admin/user`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_ADMIN_TOKEN}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
