import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

export const TEAM_NAMES = [
  "Directors",
  "Production",
  "Team Leads",
  "Public Relations",
  "Programming",
  "3D Art",
  "Animation",
  "Texture Art",
  "VFX",
  "Concept Art",
  "Music Composers",
  "Design",
  "Game Design",
  "Sound Design",
  "IT",
  "DevOps",
  "Voice Acting",
  "Writing",
  "Consulting",
  "Graphic Design",
  "Managers"
];

export const TeamsCellEditor = forwardRef((props: any, ref) => {
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  
  useEffect(() => {
    let initial = props.value;
    if (typeof initial === "string") {
      initial = initial.split(",").map((s: string) => s.trim()).filter(Boolean);
    }
    if (Array.isArray(initial)) {
      setSelectedTeams(initial);
    }
  }, [props.value]);

  useImperativeHandle(ref, () => {
    return {
      getValue() {
        return selectedTeams;
      },
      isPopup() {
        return true; // Tells AG Grid this is a popup editor
      }
    };
  });

  const toggleTeam = (team: string) => {
    setSelectedTeams(prev => 
      prev.includes(team) 
        ? prev.filter(t => t !== team)
        : [...prev, team]
    );
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg p-2 overflow-y-auto text-sm"
      style={{ width: '250px', height: '300px' }}
    >
      <div className="font-semibold px-1 pb-2 mb-2 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200">
        Select Teams
      </div>
      <div className="flex flex-col gap-1 overflow-x-hidden">
        {TEAM_NAMES.map(team => (
          <label key={team} className="flex flex-row items-center space-x-2 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-1 rounded">
            <input
              type="checkbox"
              checked={selectedTeams.includes(team)}
              onChange={() => toggleTeam(team)}
              className="rounded text-blue-600 focus:ring-blue-500 bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-gray-900 dark:text-gray-100">{team}</span>
          </label>
        ))}
      </div>
    </div>
  );
});
