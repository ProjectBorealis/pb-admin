import type { ColDef, GridOptions } from "ag-grid-community";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeAlpine,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useEffect, useRef, useState } from "react";

// Register all community features
ModuleRegistry.registerModules([AllCommunityModule]);

const theme = themeAlpine;

let addingNewRow = false;
let pendingUpdates = [];

export function Grid({ initialRows }: { initialRows: any[] }) {
  const [rowData, setRowData] = useState(initialRows);
  const [hasPendingUpdates, setHasPendingUpdates] = useState(false);
  const [hasAdds, setHasAdds] = useState(false);

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
    { field: "teams", editable: true, filter: true },
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
      console.log(addingNewRow, lastIndex, gridApi);
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
            pendingUpdates.push(row.data);
            setHasPendingUpdates(pendingUpdates.length > 0);
          }}
        />
      </div>
      <button
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
        onClick={() => {
          const newItem = {
            nickname: "New Member",
            credits_name: "",
            legal_name: "",
            timezone: "",
            member_status: "Onboarding",
            title: "",
            teams: "",
            github: "",
            discord: "",
            google: "",
            reddit: "",
            email: "",
            steamworks: "",
            steamid: "",
            va: "No",
            nda: "No",
            cla: "No",
            scenefusion: "No",
            join_date: "",
            end_date: "",
            end_reason: "",
          };
          addingNewRow = true;
          setRowData((prevRowData) => [...prevRowData, newItem]);
          setHasAdds(true);
        }}
      >
        + Add Member
      </button>
      <span>&nbsp;</span>
      <button
        className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer disabled:bg-green-900"
        disabled={!hasPendingUpdates}
        onClick={() => {}}
      >
        &#10003; Save Changes
      </button>
      <span>&nbsp;</span>
      <button
        className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer disabled:bg-red-900"
        disabled={!hasAdds && !hasPendingUpdates}
        onClick={() => {
          window.location.reload();
        }}
      >
        X Discard Changes
      </button>
      <span>&nbsp;</span>
      <button className="mt-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 cursor-pointer">
        &#10227; Update Memberships
      </button>
    </div>
  );
}
