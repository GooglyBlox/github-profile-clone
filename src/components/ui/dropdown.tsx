import * as React from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface DropdownProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  buttonClassName?: string;
}

export function Dropdown({
  label,
  options,
  value,
  onChange,
  buttonClassName,
}: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        className={cn("w-full justify-between", buttonClassName)}
        onClick={() => setIsOpen(!isOpen)}
      >
        {label}: {value}
      </Button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 mt-2 w-48 rounded-md bg-[#161b22] border border-gray-700 shadow-lg">
            {options.map((option) => (
              <button
                key={option}
                className="block w-full px-4 py-2 text-sm text-gray-300 hover:bg-[#30363d] text-left"
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
