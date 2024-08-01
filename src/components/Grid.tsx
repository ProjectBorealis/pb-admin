import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the Data Grid
import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional Theme applied to the Data Grid
import { AgGridReact } from "ag-grid-react";
import { useState } from "react";

export function Grid({ initialRows }: { initialRows: any[] }) {
  const [rowData, _setRowData] = useState(initialRows);

  const [colDefs, _setColDefs] = useState([
    { field: "nickname", editable: true },
    { field: "credits_name", headerName: "Credits Name", editable: true },
    { field: "legal_name", headerName: "Legal Name", editable: true },
    { field: "timezone", editable: true },
    {
      field: "member_status",
      headerName: "Status",
      filter: true,
      filterParams: {
        filterOptions: ["contains"],
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
    { field: "teams", editable: true },
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

  return (
    <div
      className="ag-theme-alpine" // applying the Data Grid theme
      style={{ height: 500 }} // the Data Grid will fill the size of the parent container
    >
      <AgGridReact rowData={rowData} columnDefs={colDefs} />
    </div>
  );
}
