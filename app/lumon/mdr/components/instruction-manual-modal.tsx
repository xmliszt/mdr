"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import isMobile from "is-mobile";
import { BookText } from "lucide-react";

export function InstructionManualModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <BookText className="size-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="[&>button]:hidden p-0">
        <ScrollArea className="h-[80vh]">
          <div className="p-4 flex flex-col gap-y-2">
            <DialogHeader>
              <DialogTitle className="text-left mb-4">
                Welcome, Valued Refiner!
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 text-sm">
              <section>
                <p>
                  As a Macrodata Refiner, it is important to learn the four
                  different types of numbers you will encounter throughout the
                  process of refining a data set. Every number will elicit one
                  of four emotional responses within you, and it is important to
                  be aware of the four types so that you can more quickly assess
                  and categorize your emotional response. This will, in turn,
                  allow you to more quickly sort the numbers into their
                  appropriate bins.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-lg mb-2">
                  The Four Types of Numbers
                </h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">WO (Woe):</span>
                      <span className="text-slate-500">
                        These numbers elicit melancholy or despair.
                      </span>
                    </div>
                    <p className="text-xs italic mt-1">
                      When you feel a sense of sadness or emptiness upon viewing
                      a number, it is a WO number.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">FC (Frolic):</span>
                      <span className="text-slate-500">
                        These numbers elicit joy, gaiety or ecstasy.
                      </span>
                    </div>
                    <p className="text-xs italic mt-1">
                      When a number brings you happiness or makes you feel
                      light, it is an FC number.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">DR (Dread):</span>
                      <span className="text-slate-500">
                        These numbers elicit fear, anxiety or apprehension.
                      </span>
                    </div>
                    <p className="text-xs italic mt-1">
                      When you feel uneasy or concerned upon viewing a number,
                      it is a DR number.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">MA (Malice):</span>
                      <span className="text-slate-500">
                        These numbers elicit rage or a desire to do harm.
                      </span>
                    </div>
                    <p className="text-xs italic mt-1">
                      When a number makes you feel angry or aggressive, it is an
                      MA number.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h4 className="font-bold text-lg mb-2">Refinement Procedure</h4>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    Begin by selecting a macrodata file from the file selection
                    screen.
                  </li>
                  <li>
                    Upon opening the file, you will be presented with a grid of
                    numbers.
                  </li>
                  <li>
                    Observe each number carefully and note your emotional
                    response.
                  </li>
                  <li>
                    Select numbers by using your pointer to highlight them.
                    Numbers within the influence radius of your pointer will be
                    highlighted.
                  </li>
                  <li>
                    Once you have identified a group of numbers that elicit the
                    same emotional response, direct them to the appropriate bin.
                  </li>
                  <li>
                    Continue this process until all five bins are evenly filled
                    with the four kinds of number clusters.
                  </li>
                  <li>
                    When all bins are properly filled, the file will be 100%
                    refined and your task will be complete.
                  </li>
                </ol>
              </section>

              <section>
                <h4 className="font-bold text-lg mb-2">Keyboard Controls</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <KeyboardKeyComponent>ArrowUp</KeyboardKeyComponent>
                    <span>Move viewport up</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <KeyboardKeyComponent>ArrowDown</KeyboardKeyComponent>
                    <span>Move viewport down</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <KeyboardKeyComponent>ArrowLeft</KeyboardKeyComponent>
                    <span>Move viewport left</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <KeyboardKeyComponent>ArrowRight</KeyboardKeyComponent>
                    <span>Move viewport right</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <KeyboardKeyComponent>1</KeyboardKeyComponent>
                    <span>Select Bin 01</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <KeyboardKeyComponent>2</KeyboardKeyComponent>
                    <span>Select Bin 02</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <KeyboardKeyComponent>3</KeyboardKeyComponent>
                    <span>Select Bin 03</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <KeyboardKeyComponent>4</KeyboardKeyComponent>
                    <span>Select Bin 04</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <KeyboardKeyComponent>5</KeyboardKeyComponent>
                    <span>Select Bin 05</span>
                  </div>
                  {/* Placeholder for space and enter key */}
                  <div></div>
                  <div className="flex col-span-2 items-center gap-2">
                    <KeyboardKeyComponent>Enter</KeyboardKeyComponent>
                    {" / "}
                    <KeyboardKeyComponent>Space</KeyboardKeyComponent>
                    <span>Confirm selection</span>
                  </div>
                </div>
              </section>

              <section>
                <h4 className="font-bold text-lg mb-2">Mouse Controls</h4>
                <div className="space-y-2">
                  <div>
                    <span className="font-bold">Hover:</span> Move your pointer
                    over the grid to navigate.
                  </div>
                  <div>
                    <span className="font-bold">Click on numbers:</span>{" "}
                    Highlight numbers within the influence radius of your
                    pointer.
                  </div>
                  <div>
                    <span className="font-bold">Click on bin:</span> Send
                    highlighted numbers to the selected bin.
                  </div>
                </div>
              </section>

              {isMobile() && (
                <section>
                  <h4 className="font-bold text-lg mb-2">Mobile Controls</h4>
                  <p className="mb-4 text-xs text-muted-foreground">
                    The Macrodata Refinement Dashboard is strictly prohibited
                    for mobile device usage. Per Lumon policy 1578-B, personal
                    devices are not permitted on the severed floor. Please
                    utilize your company-provided terminal for refinement work.
                    Your compliance ensures continued wellness for all. If you
                    insist on using this application on a mobile device, you may
                    forfeit your eligibility for the Waffle Party at the end of
                    your quarterly performance review.
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <span className="font-bold">Swipe:</span> Navigate around
                      the grid.
                    </div>
                    <div>
                      <span className="font-bold">Tap on numbers:</span>{" "}
                      Highlight numbers within the influence radius of your
                      pointer.
                    </div>
                    <div>
                      <span className="font-bold">Tap on bin:</span> Send
                      highlighted numbers to the selected bin.
                    </div>
                  </div>
                </section>
              )}

              <section>
                <h4 className="font-bold text-lg mb-2">Important Notes</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    Numbers may occasionally change their temper. This is a
                    normal part of the refinement process.
                  </li>
                  <li>
                    Each bin must be filled evenly with all four types of
                    numbers for optimal refinement.
                  </li>
                  <li>
                    Trust your emotional response. The numbers know how they
                    want to be sorted.
                  </li>
                  <li>
                    If you experience any unusual sensations during refinement,
                    please continue your work. This is a normal part of the
                    process.
                  </li>
                  <li>
                    Remember that your work as a Macrodata Refiner is vital to
                    Lumon Industries and serves the greater good.
                  </li>
                </ul>
              </section>

              <div className="border-t pt-4 mt-6">
                <p className="text-center italic text-xs">
                  &ldquo;Remember, the work is mysterious and important.&rdquo;
                </p>
                <p className="text-center font-bold mt-2">
                  Thank you for your service to Lumon Industries.
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

type KeyboardKeyComponentProps = {
  children: string;
};

export function KeyboardKeyComponent(props: KeyboardKeyComponentProps) {
  return (
    <div className="flex w-fit px-2 p-1 items-center justify-center rounded-md bg-muted">
      <div className="text-xs text-foreground font-bold font-mono">
        {convertKeyToKeyboardKey(props.children)}
      </div>
    </div>
  );
}

function convertKeyToKeyboardKey(key: string) {
  if (key === " ") return "Space";
  if (key === "Enter") return "Enter";
  if (key === "ArrowUp") return "↑";
  if (key === "ArrowDown") return "↓";
  if (key === "ArrowLeft") return "←";
  if (key === "ArrowRight") return "→";
  return key.toUpperCase();
}
