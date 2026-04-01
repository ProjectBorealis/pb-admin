import { memo } from "react";

export const TeamsCellRenderer = memo((props: any) => {
  let teams: string[] = [];
  if (Array.isArray(props.value)) {
    teams = props.value;
  } else if (typeof props.value === "string") {
    teams = props.value.split(",").map((s: string) => s.trim()).filter(Boolean);
  }

  return (
    <div className="flex flex-wrap gap-1.5 items-center w-full h-full overflow-hidden py-[3px]">
      {teams.map(team => (
        <span 
          key={team} 
          className="bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 text-xs px-2 py-[2px] rounded-full font-medium shadow-sm border border-blue-200 dark:border-blue-700 flex items-center"
        >
          <span className="truncate">{team}</span>
        </span>
      ))}
    </div>
  );
});
