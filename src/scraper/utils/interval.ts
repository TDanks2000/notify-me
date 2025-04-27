import type { modeEnum } from "@/discord/@types";
import ms from "ms";
import { registry } from "..";

export const runAll = async () => {
  try {
    console.log("Running registry...");
    await registry.runAll();
  } catch (error) {
    console.error("Error running registry:", error);
  }
};

let intervalId: NodeJS.Timeout | null = null;
const interval = ms("1h");

export const startInterval = (): string => {
  if (intervalId) {
    console.log("Interval is already running.");
    return "Interval is already running.";
  }

  console.log("Starting interval...");
  intervalId = setInterval(async () => {
    console.log("Executing registry.runAll()...");
    await runAll();
  }, interval);

  console.log("Interval started.");
  return "Interval started.";
};

export const stopInterval = (): string => {
  if (!intervalId) {
    console.log("No interval to stop.");
    return "No interval to stop.";
  }

  clearInterval(intervalId);
  intervalId = null; // Reset the intervalId
  console.log("Interval stopped.");
  return "Interval stopped.";
};

export const toggleInterval = (mode?: modeEnum): string => {
  if (mode === "start") {
    return startInterval();
  } else if (mode === "stop") {
    return stopInterval();
  }

  return intervalId ? stopInterval() : startInterval();
};
