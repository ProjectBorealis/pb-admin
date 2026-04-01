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

  let payload;
  try {
    payload = await request.clone().json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "Bad Request: Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    if (!canManageUser(payload.teams, auth)) {
      return new Response(JSON.stringify({ error: "Forbidden: Cannot modify this user's teams or you lack permission to manage this role." }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: "Internal Server Error during team authorization" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/user`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_ADMIN_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      data = { error: "Upstream server returned non-JSON response", details: responseText };
    }

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: "Fetch to upstream failed", details: e.message }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
}
