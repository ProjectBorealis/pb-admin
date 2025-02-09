import type { ColDef, GridOptions } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the Data Grid
import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional Theme applied to the Data Grid
import { AgGridReact } from "ag-grid-react";
import { useState } from "react";
import { useDarkMode } from "usehooks-ts";

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

  const [gridOptions, _setGridOptions] = useState<GridOptions>({
    getRowStyle: (param) => {
      const status = param.data.member_status;
      const teams = new Set(param.data.teams);
      if (status.startsWith("Removed")) {
        return {
          background: "#EF5350",
        };
      }
      if (status.startsWith("On Leave")) {
        return {
          background: "#BDBDBD",
        };
      }
      if (
        teams.has("Team Leads") ||
        teams.has("Directors") ||
        teams.has("Production") ||
        teams.has("Managers")
      ) {
        return {
          background: "#E0F2F1",
        };
      }
      return undefined;
    },
  });

  const { isDarkMode } = useDarkMode();

  return (
    <div
      className="ag-theme-alpine" // applying the Data Grid theme
      data-ag-theme-mode={isDarkMode ? "dark-blue" : "light"}
      style={{ height: "94%" }} // the Data Grid will fill the size of the parent container
    >
      <AgGridReact
        rowData={rowData}
        columnDefs={colDefs}
        gridOptions={gridOptions}
      />
    </div>
  );
}
