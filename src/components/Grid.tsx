import type { ColDef, GridOptions } from "ag-grid-community";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeAlpine,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useState } from "react";

// Register all community features
ModuleRegistry.registerModules([AllCommunityModule]);

const theme = themeAlpine;

export function Grid({ initialRows }: { initialRows: any[] }) {
  const [rowData, _setRowData] = useState(initialRows);

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
  });

  return (
    <div
      data-ag-theme-mode={isDarkMode ? "dark-blue" : "light"}
      style={{ height: "94%" }} // the Data Grid will fill the size of the parent container
    >
      <AgGridReact
        rowData={rowData}
        columnDefs={colDefs}
        gridOptions={gridOptions}
        theme={theme}
        context={{ isDarkMode }}
      />
    </div>
  );
}
