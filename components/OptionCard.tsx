"use client"
import React from "react";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import clsx from "clsx";

interface OptionCardProps {
  optionKey: "A" | "B" | "C" | "D";
  optionValue: string;
  isSelected: boolean;
}

const OptionCard: React.FC<OptionCardProps> = ({
  optionKey,
  optionValue,
  isSelected,
}) => {
  return (
    <div
      className={clsx(
        "flex items-center space-x-2 bg-neutral-100 p-4 rounded-md duration-300",
        isSelected && "bg-neutral-600 text-white"
      )}
    >
      <RadioGroupItem
        value={optionKey}
        id={optionKey}
        className={clsx(
          "duration-300",
          isSelected && "bg-white border-white outline-none"
        )}
      />
      <Label htmlFor={optionKey} className="break-all cursor-pointer flex-1 py-2">
        {optionValue}
      </Label>
    </div>
  );
};

export default OptionCard;
