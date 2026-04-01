import { CF_ACCESS_DOMAIN, GITHUB_ORG_ID } from "astro:env/server";

export const ADMIN_TEAMS = new Set(["Directors", "Production", "Managers"]);
export const MANAGER_TEAMS = new Set([
  "Directors",
  "Production",
  "Team Leads",
  "Managers",
]);

export interface AuthContext {
  isAdmin: boolean;
  canManage: boolean;
  teams: Set<string>;
}

export async function authorizeUser(authCookie: string | undefined | null): Promise<AuthContext> {
  const context: AuthContext = {
    isAdmin: false,
    canManage: false,
    teams: new Set(),
  };

  if (!authCookie) {
    return context;
  }

  try {
    const identity = await fetch(
      `https://${CF_ACCESS_DOMAIN}/cdn-cgi/access/get-identity`,
      {
        headers: {
          Cookie: `CF_Authorization=${authCookie}`,
        },
      },
    ).then((data) => data.json());

    const myTeams = identity.teams;
    if (myTeams) {
      for (const team of myTeams) {
        if (team.org_id === GITHUB_ORG_ID) {
          context.teams.add(team.name);
          if (!context.isAdmin && ADMIN_TEAMS.has(team.name)) {
            context.isAdmin = true;
          }
          if (!context.canManage && MANAGER_TEAMS.has(team.name)) {
            context.canManage = true;
          }
        }
      }
    }
  } catch (err) {
    console.error("Failed to verify CF_Authorization", err);
  }

  return context;
}

export function canManageUser(
  userTeamsData: string[] | string | undefined, 
  currentUser: AuthContext
): boolean {
  if (!currentUser.canManage) return false;
  if (currentUser.isAdmin) return true;

  let userTeams: string[] = [];
  if (Array.isArray(userTeamsData)) {
    userTeams = userTeamsData;
  } else if (typeof userTeamsData === "string") {
    userTeams = userTeamsData.split(",").map((s) => s.trim()).filter(Boolean);
  }

  const userManager = userTeams.some((team) => MANAGER_TEAMS.has(team));
  // non-admins cannot manage other managers
  if (userManager) {
    return false;
  }
  
  // non-admins cannot manage other teams than their own
  return userTeams.some((team) => currentUser.teams.has(team));
}
