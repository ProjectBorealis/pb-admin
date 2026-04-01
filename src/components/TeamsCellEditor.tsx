import { forwardRef, useEffect, useImperativeHandle, useState, useRef } from "react";
import Select from "react-select";

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
  const selectedTeamsRef = useRef<string[]>([]);
  
  useEffect(() => {
    let initial = props.value;
    if (typeof initial === "string") {
      initial = initial.split(",").map((s: string) => s.trim()).filter(Boolean);
    }
    const safeInitial = Array.isArray(initial) ? initial : [];
    setSelectedTeams(safeInitial);
    selectedTeamsRef.current = safeInitial;
  }, [props.value]);

  useImperativeHandle(ref, () => {
    return {
      getValue() {
        return selectedTeamsRef.current;
      },
      isPopup() {
        return true;
      }
    };
  });

  const options = TEAM_NAMES.map(team => ({ value: team, label: team }));
  const value = options.filter(opt => selectedTeams.includes(opt.value));

  const handleChange = (selectedOptions: any) => {
    const newTeams = selectedOptions ? selectedOptions.map((opt: any) => opt.value) : [];
    setSelectedTeams(newTeams);
    selectedTeamsRef.current = newTeams;
  };

  return (
    <div className="min-w-[350px] w-full">
      <Select
        isMulti
        options={options}
        value={value}
        onChange={handleChange}
        autoFocus
        unstyled
        closeMenuOnSelect={false}
        menuPosition="fixed"
        classNames={{
          control: ({ isFocused }) =>
            `bg-white dark:bg-gray-800 border ${
              isFocused ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-300 dark:border-gray-600"
            } rounded shadow-lg px-2 py-1 text-sm hover:border-blue-400 dark:hover:border-gray-500 flex flex-wrap max-h-32 overflow-y-auto`,
          menu: () => "mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-xl text-sm",
          menuList: () => "max-h-64 overflow-y-auto overflow-x-hidden",
          option: ({ isFocused, isSelected }) =>
            `px-3 py-2 cursor-pointer transition-colors ${
              isSelected
                ? "bg-blue-600 text-white"
                : isFocused
                ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                : "text-gray-700 dark:text-gray-300 bg-transparent"
            }`,
          multiValue: () => "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded items-center p-0 m-1 flex shadow-sm",
          multiValueLabel: () => "text-xs px-2 py-1 font-medium",
          multiValueRemove: () => "hover:bg-blue-200 dark:hover:bg-blue-800 hover:text-red-500 rounded-r px-1 cursor-pointer transition-colors",
          input: () => "text-gray-900 dark:text-gray-100 ml-1 py-0.5",
          placeholder: () => "text-gray-400 dark:text-gray-500 ml-1",
          valueContainer: () => "gap-1 flex flex-wrap",
        }}
      />
    </div>
  );
});
