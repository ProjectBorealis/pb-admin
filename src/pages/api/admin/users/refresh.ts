import type { APIRoute } from "astro";
import { API_ADMIN_TOKEN, API_BASE_URL } from "astro:env/server";
import { authorizeUser } from "@/utils/auth";

export const POST: APIRoute = async ({ cookies, url }) => {
  const authCookie = cookies.get("CF_Authorization");
  const auth = await authorizeUser(authCookie?.value);

  if (!auth.isAdmin) {
    return new Response(JSON.stringify({ error: "Unauthorized: Admins only" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Get the page and limit query params from the incoming request so we can forward them
  const page = url.searchParams.get("page");
  const limit = url.searchParams.get("limit");
  const targetUrl = new URL(`${API_BASE_URL}/api/admin/users/refresh`);
  if (page) targetUrl.searchParams.set("page", page);
  if (limit) targetUrl.searchParams.set("limit", limit);

  const response = await fetch(targetUrl.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_ADMIN_TOKEN}`,
      "Content-Type": "application/json",
    },
    // No body is expected for this endpoint
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
};
