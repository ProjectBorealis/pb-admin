import { forwardRef, useEffect, useImperativeHandle, useState, useRef } from "react";
import { createPortal } from "react-dom";

const TEAM_NAMES = [
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
  const [dropdownBounds, setDropdownBounds] = useState<{ top?: number, bottom?: number, left: number, width: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let initial = props.value;
    if (typeof initial === "string") {
      initial = initial.split(",").map((s: string) => s.trim()).filter(Boolean);
    }
    const safeInitial = Array.isArray(initial) ? initial : [];
    setSelectedTeams(safeInitial);
    selectedTeamsRef.current = safeInitial;
  }, []);

  useImperativeHandle(ref, () => ({
    getValue() {
      return selectedTeamsRef.current;
    }
  }));

  const toggleTeam = (team: string) => {
    const newTeams = selectedTeams.includes(team) 
      ? selectedTeams.filter(t => t !== team)
      : [...selectedTeams, team];
    setSelectedTeams(newTeams);
    selectedTeamsRef.current = newTeams;

    if (props.onValueChange) {
      props.onValueChange(newTeams);
    }
  };

  const openDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (dropdownBounds) {
      setDropdownBounds(null);
      return;
    }
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const popupHeight = 288; // max-h-72 roughly translates to 288px max
      const spaceBelow = window.innerHeight - rect.bottom;
      
      let bounds: any = {
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, 250),
      };

      if (spaceBelow < popupHeight && rect.top > spaceBelow) {
        bounds.bottom = window.innerHeight - (rect.top + window.scrollY) + 3;
      } else {
        bounds.top = rect.bottom + window.scrollY + 3;
      }

      setDropdownBounds(bounds);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!dropdownBounds) return;
      const target = event.target as Node;
      if (containerRef.current && containerRef.current.contains(target)) return;
      if (dropdownRef.current && dropdownRef.current.contains(target)) return;
      setDropdownBounds(null);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownBounds]);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      if (dropdownRef.current && e.target && dropdownRef.current.contains(e.target as Node)) return;
      if (containerRef.current && e.target && containerRef.current.contains(e.target as Node)) return;
      if (dropdownBounds) setDropdownBounds(null);
    };
    window.addEventListener("scroll", handleScroll, true); 
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [dropdownBounds]);

  return (
    <div
      ref={containerRef}
      className="flex items-center w-full h-[40px] px-1.5 py-1 bg-white dark:bg-gray-800 cursor-pointer overflow-hidden border-[1.5px] border-blue-500 rounded ring-[1.5px] ring-blue-500 focus:outline-none"
      onClick={openDropdown}
      tabIndex={0}
      onMouseDown={(e) => e.stopPropagation()} 
    >
      <div className="flex flex-wrap gap-1.5 items-start flex-1 h-[32px] w-full overflow-y-auto overflow-x-hidden pr-2 pb-1 custom-scrollbar">
        {selectedTeams.length === 0 && (
          <span className="text-gray-400 dark:text-gray-500 text-sm ml-1 mt-0.5">Select teams...</span>
        )}
        {selectedTeams.map(team => (
           <span 
             key={team} 
             className="bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 text-xs pl-2 pr-1 py-[2px] rounded-full font-medium shadow-sm border border-blue-200 dark:border-blue-700 flex items-center gap-1"
           >
             <span className="truncate">{team}</span>
             <span
               className="hover:text-white hover:bg-red-500 dark:hover:bg-red-600 rounded-full h-[14px] w-[14px] flex items-center justify-center cursor-pointer transition-colors"
               onClick={(e) => { e.stopPropagation(); toggleTeam(team); }}
             >
               &times;
             </span>
           </span>
        ))}
      </div>
      
      <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 ml-1 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
      </svg>

      {dropdownBounds && typeof window !== "undefined" && createPortal(
        <div
          ref={dropdownRef}
          className="absolute z-[99999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl rounded-lg py-1 text-sm max-h-72 overflow-y-auto"
          style={{ 
            top: dropdownBounds.top, 
            bottom: dropdownBounds.bottom,
            left: dropdownBounds.left, 
            width: dropdownBounds.width 
          }}
        >
          {TEAM_NAMES.map(team => {
            const isSelected = selectedTeams.includes(team);
            return (
              <div
                key={team}
                onClick={(e) => { e.stopPropagation(); toggleTeam(team); }}
                className={`px-4 py-2 cursor-pointer transition-colors flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 ${isSelected ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold" : "text-gray-700 dark:text-gray-300"}`}
              >
                {team}
                {isSelected && (
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
});
