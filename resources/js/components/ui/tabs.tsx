import React, { createContext, useContext, useState } from "react";

interface TabsContextType {
  value: string;
  setValue: (v: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  className?: string;
  children: React.ReactNode;
}

export function Tabs({
  defaultValue = "",
  value,
  onValueChange,
  className,
  children,
}: TabsProps) {
  const [internal, setInternal] = useState(defaultValue);
  const current = value !== undefined ? value : internal;
  const setValue = (v: string) => {
    onValueChange?.(v);
    if (value === undefined) {
      setInternal(v);
    }
  };

  return (
    <TabsContext.Provider value={{ value: current, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={className}>{children}</div>;
}

export function TabsTrigger({
  value,
  children,
  className,
  ...props
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLButtonElement>) {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error("TabsTrigger must be used within a Tabs component");
  }
  const selected = ctx.value === value;
  return (
    <button
      className={`${className ?? ""} ${
        selected ? "font-semibold" : ""
      }`}
      onClick={() => ctx.setValue(value)}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error("TabsContent must be used within a Tabs component");
  }
  return ctx.value === value ? <div className={className}>{children}</div> : null;
}
