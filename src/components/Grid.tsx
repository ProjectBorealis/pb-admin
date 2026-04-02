import type { ColDef, GridOptions } from "ag-grid-community";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeAlpine,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useEffect, useRef, useState } from "react";
import { TeamsCellEditor } from "./TeamsCellEditor";
import { TeamsCellRenderer } from "./TeamsCellRenderer";

// Register all community features
ModuleRegistry.registerModules([AllCommunityModule]);

const theme = themeAlpine;

let addingNewRow = false;

export function Grid({ initialRows, isAdmin }: { initialRows: any[], isAdmin?: boolean }) {
  const [rowData, setRowData] = useState(structuredClone(initialRows));
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, any>>({});
  const hasPendingUpdates = Object.keys(pendingUpdates).length > 0 || JSON.stringify(rowData.filter(row => row.nickname && row.nickname.length && row.nickname !== "New Member")) !== JSON.stringify(initialRows);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshProgress, setRefreshProgress] = useState(0);

  const readyToUpdate = typeof window !== "undefined" ? hasPendingUpdates : false;
  const updateInProgress = typeof window !== "undefined" ? isUpdating || isRefreshing : false;

  const [colDefs, _setColDefs] = useState<ColDef[]>([
    { field: "nickname", editable: true, filter: true, pinned: "left" },
    { field: "credits_name", headerName: "Credits Name", editable: true },
    { field: "legal_name", headerName: "Legal Name", editable: true },
    { field: "timezone", editable: true },
    {
      field: "member_status",
      headerName: "Status",
      filter: true,
      filterParams: {
        filterOptions: ["contains", "notContains"],
        maxNumConditions: 1,
      },
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: [
          "Onboarding",
          "Active",
          "Support",
          "Consulting",
          "On Leave",
          "On Leave (No Discord)",
          "Offboarding",
          "Removed",
          "Removed (No Credit)",
        ],
      },
      editable: true,
    },
    { field: "title", editable: true },
    {
      field: "teams",
      editable: true,
      filter: true,
      filterParams: {
        textMatcher: ({ filterOption, value, filterText }: any) => {
          if (!filterText) return true;

          const teams = Array.isArray(value) ? value : value.split(",").map((t: string) => t.trim());
          const query = filterText.toLowerCase();

          if (filterOption === 'notEqual' || filterOption === 'notContains') {
             return !teams.some((t: string) => t.toLowerCase().includes(query));
          }

          return teams.some((t: string) => {
            const team = t.toLowerCase();
            if (filterOption === 'equals' || filterOption === 'exact') {
              return team === query;
            }
            // For general filtering ('contains'), anchor to the start of the team name
            // so typing 'Design' strictly matches the 'Design' team, not 'Sound Design'.
            return team.startsWith(query);
          });
        }
      },
      cellDataType: false, // Totally disable AG-Grid type inference which drops array persistence
      valueGetter: (params) => params.data.teams || [],
      valueSetter: (params) => {
        params.data.teams = params.newValue;
        return true;
      },
      equals: (val1, val2) => {
        const a = Array.isArray(val1) ? val1 : [];
        const b = Array.isArray(val2) ? val2 : [];
        return a.length === b.length && a.every((v, i) => v === b[i]);
      },
      valueFormatter: (params) => Array.isArray(params.value) ? params.value.join(", ") : params.value,
      cellRenderer: TeamsCellRenderer,
      cellEditor: TeamsCellEditor,
    },
    { field: "github", editable: true },
    { field: "discord", editable: true },
    { field: "google", editable: true },
    { field: "reddit", editable: true },
    { field: "email", editable: true },
    { field: "steamworks", editable: true },
    { field: "steamid", editable: true },
    {
      field: "va",
      headerName: "Volunteer Agreement",
      filter: true,
      editable: true,
    },
    { field: "nda", headerName: "NDA", filter: true, editable: true },
    { field: "cla", headerName: "CLA", filter: true, editable: true },
    {
      field: "scenefusion",
      headerName: "Scenefusion NDA",
      filter: true,
      editable: true,
    },
    { field: "join_date", headerName: "Join Date", editable: true },
    {
      field: "end_date",
      headerName: "Leave Date",
      filter: "agDateColumnFilter",
      editable: true,
    },
    { field: "end_reason", headerName: "Leave Reason", editable: true },
  ]);

  //const { isDarkMode } = useDarkMode({ initializeWithValue: false });
  const isDarkMode = false;

  const [gridOptions, _setGridOptions] = useState<GridOptions>({
    getRowStyle: (params) => {
      const status = params.data.member_status;
      const teams = new Set(params.data.teams);
      if (status.startsWith("Removed")) {
        return {
          background: "#EF5350",
        };
      }
      if (status.startsWith("On Leave")) {
        return {
          background: params.context.isDarkMode ? "#808080" : "#BDBDBD",
        };
      }
      if (
        teams.has("Team Leads") ||
        teams.has("Directors") ||
        teams.has("Production") ||
        teams.has("Managers")
      ) {
        return {
          background: params.context.isDarkMode ? "#181e28" : "#E0F2F1",
        };
      }
      return undefined;
    },
    editType: "fullRow",
  });

  // Create a gridRef
  const gridRef = useRef<AgGridReact>(null);

  useEffect(() => {
    if (addingNewRow) {
      const lastIndex = rowData.length - 1;
      const gridApi = gridRef.current?.api;
      if (gridApi) {
        gridApi.ensureIndexVisible(lastIndex, "bottom");
        addingNewRow = false;
      }
    }
  }, [addingNewRow, gridRef, rowData]);

  return (
    <div style={{ height: "90%" }}>
      <div
        data-ag-theme-mode={isDarkMode ? "dark-blue" : "light"}
        style={{ height: "99%" }} // the Data Grid will fill the size of the parent container
      >
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={colDefs}
          gridOptions={gridOptions}
          theme={theme}
          context={{ isDarkMode }}
          onRowValueChanged={(row) => {
            if (!row.node.id) return;
            
            const originalRow = row.data.member_id 
              ? initialRows.find(r => r.member_id === row.data.member_id)
              : undefined;

            if ((originalRow && JSON.stringify(row.data) === JSON.stringify(originalRow)) || (!row.data.nickname || !row.data.nickname.length || row.data.nickname === "New Member")) {
              const newUpdates = { ...pendingUpdates };
              delete newUpdates[row.node.id];
              setPendingUpdates(newUpdates);
              return;
            }
            
            setPendingUpdates(prev => ({ ...prev, [row.node.id!]: row.data }));
          }}
        />
      </div>
      <button
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer disabled:cursor-not-allowed disabled:bg-blue-900"
        disabled={isRefreshing || isUpdating}
        onClick={() => {
          const newItem = {
            nickname: "New Member",
            credits_name: "",
            legal_name: "",
            timezone: "",
            member_status: "Onboarding",
            title: "",
            teams: [],
            github: "",
            discord: "",
            google: "",
            reddit: "",
            email: "",
            steamworks: "",
            steamid: "",
            va: false,
            nda: false,
            cla: false,
            scenefusion: false,
            join_date: "",
            end_date: "",
            end_reason: "",
          };
          addingNewRow = true;
          setRowData((prevRowData) => [...prevRowData, newItem]);
        }}
      >
        + Add Member
      </button>
      <span>&nbsp;</span>
      <button
        className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer disabled:cursor-not-allowed disabled:bg-green-900"
        disabled={!readyToUpdate || updateInProgress}
        onClick={async () => {
          setIsUpdating(true);
          const updatePromises: Promise<Response>[] = [];
          for (const rowData of Object.values(pendingUpdates)) {
            // Globally strip empty string fields and map them to null to satisfy strict backend schema validators.
            // This cleanly handles optional data, and triggers better 'Required Field' missing errors 
            // instead of choking on unrelated arbitrary format patterns if a required field is left blank.
            const payload = { ...rowData };
            for (const key of Object.keys(payload)) {
              if (payload[key] === "") {
                payload[key] = null;
              }
            }

            updatePromises.push(fetch(`/api/admin/user`, {
              method: payload.member_id ? "PATCH" : "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }));
          }
          
          try {
            const responses = await Promise.all(updatePromises);
            const failed = responses.find(r => !r.ok);
            
            if (failed) {
              const errorData = await failed.json().catch(() => ({}));
              console.error("Save Changes failed:", errorData);
              
              let errorMessage = "Failed to save changes.\n\n";
              if (errorData.errors && Array.isArray(errorData.errors)) {
                errorData.errors.forEach((err: any) => {
                  const field = err.path ? err.path[err.path.length - 1] : "Field";
                  errorMessage += `- ${field}: ${err.message}\n`;
                });
              } else if (errorData.error) {
                errorMessage += errorData.error;
              } else {
                errorMessage += "Unknown validation error occurred.";
              }
              
              alert(errorMessage);
              setIsUpdating(false);
              return; // DO NOT RELOAD!
            }

            window.location.reload();
          } catch (e) {
            console.error(e);
            setIsUpdating(false);
            alert("Network error occurred.");
          }
        }}
      >
        &#10003; {isUpdating ? "Saving..." : "Save Changes"}
      </button>
      <span>&nbsp;</span>
      <button
        className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer disabled:cursor-not-allowed disabled:bg-red-900"
        disabled={!readyToUpdate || updateInProgress}
        onClick={() => {
          window.location.reload();
        }}
      >
        X Discard Changes
      </button>
      <span>&nbsp;</span>
      {isAdmin && (
        <button
          className="mt-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-900"
          disabled={updateInProgress}
          onClick={async () => {
            setIsRefreshing(true);
            setRefreshProgress(0);
            const limit = 2;
            const totalUsers = rowData.length;
            const totalPages = Math.ceil(totalUsers / limit);

            try {
              for (let page = 1; page <= totalPages; page++) {
                await fetch(`/api/admin/users/refresh?page=${page}&limit=${limit}`, {
                  method: "POST",
                });
                setRefreshProgress(Math.min(page * limit, totalUsers));
              }
              await fetch(`/api/admin/users/refresh/projects`, {
                method: "POST",
              });
            } catch (e) {
              console.error(e);
              alert("Failed to update memberships.");
            } finally {
              setIsRefreshing(false);
              setRefreshProgress(0);
            }
          }}
        >
          &#8635; {isRefreshing ? `Updating (${refreshProgress}/${rowData.length})...` : `Update Memberships`}
        </button>
      )}
    </div>
  );
}
