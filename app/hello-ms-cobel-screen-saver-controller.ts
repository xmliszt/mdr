"use client";

import { helloMsCobelScreenSaver } from "@/app/components/hello-ms-cobel-screensaver";
import { useEffect } from "react";

/**
 * Controller for the Hello Ms. Cobel screensaver
 * Shows the screensaver when the user is inactive for a specified period of time
 */
class HelloMsCobelScreenSaverController {
  private timeoutId: number | null = null;
  private readonly inactivityTimeout: number;
  private isEnabled: boolean = false;

  /**
   * Creates a new controller for the Hello Ms. Cobel screensaver
   * @param inactivityTimeoutMs Time in milliseconds before showing the screensaver (default: 5 minutes)
   */
  constructor({
    inactivityTimeoutMs = 5 * 60 * 1000,
  }: {
    inactivityTimeoutMs?: number;
  }) {
    this.inactivityTimeout = inactivityTimeoutMs;
  }

  /**
   * Enables the screensaver to be shown after inactivity
   */
  public enable(): void {
    if (this.isEnabled) return;

    this.isEnabled = true;
    this.resetTimer();

    // Add event listeners to detect user activity
    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", this.handleUserActivity);
      window.addEventListener("mousedown", this.handleUserActivity);
      window.addEventListener("keypress", this.handleUserActivity);
      window.addEventListener("touchstart", this.handleUserActivity);
      window.addEventListener("scroll", this.handleUserActivity);
    }
  }

  /**
   * Disables the screensaver
   */
  public disable(): void {
    if (!this.isEnabled) return;

    this.isEnabled = false;
    this.clearTimer();

    // Remove event listeners
    if (typeof window !== "undefined") {
      window.removeEventListener("mousemove", this.handleUserActivity);
      window.removeEventListener("mousedown", this.handleUserActivity);
      window.removeEventListener("keypress", this.handleUserActivity);
      window.removeEventListener("touchstart", this.handleUserActivity);
      window.removeEventListener("scroll", this.handleUserActivity);
    }

    // Hide screensaver if it's currently shown
    helloMsCobelScreenSaver.hide();
  }

  /**
   * Handles user activity by resetting the inactivity timer
   */
  private handleUserActivity = (): void => {
    this.resetTimer();
  };

  /**
   * Resets the inactivity timer
   */
  private resetTimer(): void {
    this.clearTimer();

    if (this.isEnabled && typeof window !== "undefined") {
      this.timeoutId = window.setTimeout(() => {
        helloMsCobelScreenSaver.show();
      }, this.inactivityTimeout);
    }
  }

  /**
   * Clears the inactivity timer
   */
  private clearTimer(): void {
    if (this.timeoutId !== null && typeof window !== "undefined") {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

/**
 * Put this component in the root of your app to enable the Hello Ms. Cobel screensaver
 */
export function HelloMsCobelScreenSaverControllerComponent() {
  useEffect(() => {
    const controller = new HelloMsCobelScreenSaverController({
      inactivityTimeoutMs: 60 * 1000, // 1 minute
    });
    controller.enable();
    return () => controller.disable();
  }, []);

  return null;
}
