import type { APIRoute } from "astro";
import { API_ADMIN_TOKEN, API_BASE_URL } from "astro:env/server";
import { authorizeUser } from "@/utils/auth";

export const POST: APIRoute = async ({ cookies }) => {
  const authCookie = cookies.get("CF_Authorization");
  const auth = await authorizeUser(authCookie?.value);

  if (!auth.isAdmin) {
    return new Response(JSON.stringify({ error: "Unauthorized: Admins only" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  const response = await fetch(`${API_BASE_URL}/api/admin/users/refresh/projects`, {
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
