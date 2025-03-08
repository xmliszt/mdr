"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion } from "framer-motion";
import * as React from "react";

import { cn } from "@/lib/utils";

// Create a context to share the active tab index and dimensions
const TabsContext = React.createContext<{
  activeTabIndex: number;
  setActiveTabIndex: React.Dispatch<React.SetStateAction<number>>;
  tabRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>;
}>({
  activeTabIndex: 0,
  setActiveTabIndex: () => {},
  tabRefs: { current: [] },
});

// Define interface for TabsTrigger props
interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  value: string;
}

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ defaultValue, value, onValueChange, ...props }, ref) => {
  // Track the active tab index
  const [activeTabIndex, setActiveTabIndex] = React.useState(0);
  // Store refs to all tab triggers
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  return (
    <TabsContext.Provider
      value={{ activeTabIndex, setActiveTabIndex, tabRefs }}
    >
      <TabsPrimitive.Root
        ref={ref}
        defaultValue={defaultValue}
        value={value}
        onValueChange={(newValue) => {
          if (onValueChange) {
            onValueChange(newValue);
          }
        }}
        {...props}
      />
    </TabsContext.Provider>
  );
});
Tabs.displayName = TabsPrimitive.Root.displayName;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => {
  const { activeTabIndex, tabRefs } = React.useContext(TabsContext);
  const [sliderStyle, setSliderStyle] = React.useState({
    width: 0,
    left: 0,
  });

  // Update slider position when active tab changes
  React.useEffect(() => {
    const activeTab = tabRefs.current[activeTabIndex];
    if (activeTab) {
      setSliderStyle({
        width: activeTab.offsetWidth,
        left: activeTab.offsetLeft,
      });
    }
  }, [activeTabIndex, tabRefs]);

  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground relative",
        className
      )}
      {...props}
    >
      {props.children}
      <motion.div
        className="absolute h-8 rounded-sm bg-background shadow-sm z-0"
        initial={false}
        animate={{
          width: sliderStyle.width,
          x: sliderStyle.left,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
      />
    </TabsPrimitive.List>
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, value, ...props }, ref) => {
  const { setActiveTabIndex, tabRefs } = React.useContext(TabsContext);

  // Create a ref that combines the forwarded ref and our internal ref system
  const combinedRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      // Handle the forwarded ref
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }

      // Find the index of this trigger
      if (node) {
        const parent = node.parentElement;
        if (parent) {
          const triggers = Array.from(
            parent.querySelectorAll("[data-radix-collection-item]")
          );
          const index = triggers.indexOf(node);
          if (index !== -1) {
            tabRefs.current[index] = node;

            // Check if this is the active tab
            if (node.getAttribute("data-state") === "active") {
              setActiveTabIndex(index);
            }
          }
        }
      }
    },
    [ref, tabRefs, setActiveTabIndex]
  );

  return (
    <TabsPrimitive.Trigger
      ref={combinedRef}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative z-10",
        // Remove the background styling from the active state since we're using the slider
        "data-[state=active]:text-foreground",
        className
      )}
      value={value}
      {...props}
    />
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsContent, TabsList, TabsTrigger };
