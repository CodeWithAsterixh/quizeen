import { setTheme, ToggleSavedResults } from "@/lib/features/settingsSlice";
import { useAppDispatch } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { useSelector } from "react-redux";

export const useSettingsUpdate = () => {
  const dispatch = useAppDispatch();
  const { theme, saveResults } = useSelector(
    (state: RootState) => state.settings
  );

  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    dispatch(setTheme(newTheme));
  };

  const handleToggleSaveResults = () => {
    dispatch(ToggleSavedResults(!saveResults));
  };

  return {
    actions: {
      handleThemeToggle,
      handleToggleSaveResults,
    },
    settings: {
        theme,
        saveResults,
      },
  };
};
