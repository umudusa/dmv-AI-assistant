"use client";

import { createContext, useContext } from "react";

type SelectedStateContextValue = {
  selectedStateCode: string | null;
};

const SelectedStateContext = createContext<SelectedStateContextValue>({
  selectedStateCode: null,
});

export function SelectedStateProvider({
  selectedStateCode,
  children,
}: {
  selectedStateCode: string | null;
  children: React.ReactNode;
}) {
  return (
    <SelectedStateContext.Provider value={{ selectedStateCode }}>
      {children}
    </SelectedStateContext.Provider>
  );
}

export function useSelectedState() {
  return useContext(SelectedStateContext);
}
