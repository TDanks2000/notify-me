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

let initialTimeout: NodeJS.Timeout | null = null;
let intervalId: NodeJS.Timeout | null  = null;

// your desired repeat interval (changed to 5 minutes):
const interval = ms("5m");

function getMsToNextAlignment(intervalMs: number): number {
  const now = new Date();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const msPart  = now.getMilliseconds();

  const intervalMin = intervalMs / 60_000;
  if (!Number.isInteger(intervalMin)) {
    throw new Error("interval must be a whole number of minutes");
  }

  // how many minutes past the last multiple?
  const past = minutes % intervalMin;
  // minutes until next multiple:
  let minsToAdd = past === 0 && (seconds > 0 || msPart > 0)
    ? intervalMin
    : (intervalMin - past) % intervalMin;

  // compute target time
  const target = new Date(now);
  target.setMinutes(minutes + minsToAdd, 0, 0);

  return target.getTime() - now.getTime();
}

export const startInterval = (): string => {
  if (initialTimeout || intervalId) {
    return "Interval is already running.";
  }

  // schedule first run at the next aligned clock-time
  const delay = getMsToNextAlignment(interval);
  console.log(`First run will start in ${delay}ms`);

  initialTimeout = setTimeout(async () => {
    console.log("Executing initial registry.runAll() at alignment...");
    await runAll();

    // then every `interval`
    intervalId = setInterval(async () => {
      console.log("Executing registry.runAll()...");
      await runAll();
    }, interval);

    initialTimeout = null;
  }, delay);

  return "Interval scheduled (will align to clock).";
};

export const stopInterval = (): string => {
  if (initialTimeout) {
    clearTimeout(initialTimeout);
    initialTimeout = null;
  }
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  return "Interval stopped.";
};

export const toggleInterval = (mode?: modeEnum): string => {
  if (mode === "start") {
    return startInterval();
  } else if (mode === "stop") {
    return stopInterval();
  }
  return (initialTimeout || intervalId) ? stopInterval() : startInterval();
};
