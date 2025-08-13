"use client";

import React, { useState } from "react";
import { Button } from "@/components/common/ui/button";
import { useStreamContext } from "@/providers/Stream";
import { submitInterruptResponse } from "./util";

interface BaggageOption {
  weight: number;
  price: number;
  description: string;
}

interface BaggageSelection {
  [key: number]: number; // weight -> quantity
}

interface AddBaggageProps extends Record<string, any> {
  apiData?: any;
  readOnly?: boolean;
  interruptId?: string;
}

const AddBaggageWidget: React.FC<AddBaggageProps> = (args) => {
  const thread = useStreamContext();

  // Implement frozen/live argument handling pattern
  const liveArgs = args.apiData?.value?.widget?.args ?? {};
  const frozenArgs = (liveArgs as any)?.submission;
  const effectiveArgs = args.readOnly && frozenArgs ? frozenArgs : liveArgs;

  // Extract baggage selection from effective args
  const initialBaggageSelection = effectiveArgs?.baggageSelection ?? {};

  const [baggageSelection, setBaggageSelection] = useState<BaggageSelection>(
    initialBaggageSelection,
  );
  const [isLoading, setIsLoading] = useState(false);

  const readOnly = !!args.readOnly;
  const interruptId: string | undefined =
    args.interruptId ??
    args.apiData?.value?.interrupt_id ??
    args.apiData?.interrupt_id;

  const baggageOptions: BaggageOption[] = [
    {
      weight: 10,
      price: 1200,
      description: "",
    },
    {
      weight: 20,
      price: 2000,
      description: "",
    },
    {
      weight: 30,
      price: 2800,
      description: "",
    },
  ];

  const updateBaggageQuantity = (weight: number, change: number) => {
    // Prevent updates in read-only mode
    if (readOnly) return;

    setBaggageSelection((prev) => {
      const currentQuantity = prev[weight] || 0;
      const newQuantity = Math.max(0, currentQuantity + change);

      if (newQuantity === 0) {
        const { [weight]: removed, ...rest } = prev;
        return rest;
      }

      return { ...prev, [weight]: newQuantity };
    });
  };

  const getTotalBags = () => {
    return Object.values(baggageSelection).reduce(
      (sum, quantity) => sum + quantity,
      0,
    );
  };

  const getTotalPrice = () => {
    return Object.entries(baggageSelection).reduce(
      (total, [weight, quantity]) => {
        const option = baggageOptions.find(
          (opt) => opt.weight === parseInt(weight),
        );
        return total + (option ? option.price * quantity : 0);
      },
      0,
    );
  };

  const getTotalWeight = () => {
    return Object.entries(baggageSelection).reduce(
      (total, [weight, quantity]) => {
        return total + parseInt(weight) * quantity;
      },
      0,
    );
  };

  const hasSelection = () => {
    return getTotalBags() > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSelection() || readOnly) return;

    setIsLoading(true);

    const responseData = {
      baggageSelection,
      totalBags: getTotalBags(),
      totalWeight: getTotalWeight(),
      totalPrice: getTotalPrice(),
      action: "baggage_selected",
    };

    try {
      const frozen = {
        widget: {
          type: "AddBaggageWidget",
          args: {
            baggageSelection,
            submission: {
              baggageSelection,
              totalBags: getTotalBags(),
              totalWeight: getTotalWeight(),
              totalPrice: getTotalPrice(),
            }
          }
        },
        value: {
          type: "widget",
          widget: {
            type: "AddBaggageWidget",
            args: {
              baggageSelection,
              submission: {
                baggageSelection,
                totalBags: getTotalBags(),
                totalWeight: getTotalWeight(),
                totalPrice: getTotalPrice(),
              }
            }
          },
        },
      };
      await submitInterruptResponse(thread, "response", responseData, {
        interruptId,
        frozenValue: frozen,
      });
    } catch (error: any) {
      console.error("Error submitting baggage selection:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="mx-auto mt-2 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-4 shadow-lg sm:p-6"
      style={{ fontFamily: "Uber Move, Arial, Helvetica, sans-serif" }}
    >
      <div className="mb-4 text-center sm:mb-6">
        <h2 className="mb-1 text-xl font-bold text-black sm:mb-2 sm:text-2xl">
          Add Baggage
        </h2>
        <p className="text-sm text-gray-600">
          {readOnly ? "Your selected baggage" : "Select your preferred baggage allowance"}
        </p>
        {readOnly && (
          <div className="mt-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 inline-block">
            Selected
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-3 sm:space-y-4"
      >
        <div className="space-y-2 sm:space-y-3">
          {baggageOptions.map((option) => {
            const quantity = baggageSelection[option.weight] || 0;
            return (
              <div
                key={option.weight}
                className={`relative rounded-xl border-2 p-3 transition-all duration-200 sm:p-4 ${
                  quantity > 0
                    ? "border-black bg-gray-50"
                    : "border-gray-200 bg-white"
                } ${readOnly ? "opacity-75" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex flex-col space-y-1">
                      <h3 className="text-sm font-semibold text-black sm:text-base">
                        {option.weight}kg Baggage
                      </h3>
                      <p className="text-xs font-medium text-black sm:text-sm">
                        ₹{option.price} per bag
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-shrink-0 items-center space-x-2 sm:space-x-3">
                    <div className="flex items-center space-x-2 rounded-lg bg-gray-100 p-1">
                      <button
                        type="button"
                        onClick={() => updateBaggageQuantity(option.weight, -1)}
                        disabled={quantity === 0 || readOnly}
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50 hover:text-black disabled:cursor-not-allowed disabled:opacity-50 sm:h-8 sm:w-8"
                      >
                        <span className="text-sm font-bold sm:text-base">
                          −
                        </span>
                      </button>

                      <span className="min-w-[2rem] text-center text-sm font-bold text-black sm:text-base">
                        {quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => updateBaggageQuantity(option.weight, 1)}
                        disabled={readOnly}
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50 hover:text-black disabled:cursor-not-allowed disabled:opacity-50 sm:h-8 sm:w-8"
                      >
                        <span className="text-sm font-bold sm:text-base">
                          +
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 space-y-3 sm:mt-6">
          {hasSelection() && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Total Summary:
                  </span>
                </div>

                {Object.entries(baggageSelection).map(([weight, quantity]) => {
                  const option = baggageOptions.find(
                    (opt) => opt.weight === parseInt(weight),
                  );
                  if (!option || quantity === 0) return null;

                  return (
                    <div
                      key={weight}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-600">
                        {quantity}x {option.weight}kg bags
                      </span>
                      <span className="font-medium text-black">
                        ₹{option.price * quantity}
                      </span>
                    </div>
                  );
                })}

                <div className="mt-2 border-t border-gray-200 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-black sm:text-base">
                      Total: {getTotalBags()} bags ({getTotalWeight()}kg)
                    </span>
                    <span className="text-base font-bold text-black sm:text-lg">
                      ₹{getTotalPrice()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={!hasSelection() || isLoading || readOnly}
            className={`w-full rounded-xl py-3 text-sm font-medium transition-all duration-200 sm:py-4 sm:text-base ${
              readOnly
                ? "bg-gray-100 text-gray-600 border border-gray-200 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500"
            }`}
          >
            {readOnly ? (
              `Selected: ${getTotalBags()} Bag${getTotalBags() > 1 ? "s" : ""} - ₹${getTotalPrice()}`
            ) : isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>Processing...</span>
              </div>
            ) : hasSelection() ? (
              `Add ${getTotalBags()} Bag${getTotalBags() > 1 ? "s" : ""} - ₹${getTotalPrice()}`
            ) : (
              "Select Baggage to Continue"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddBaggageWidget;
