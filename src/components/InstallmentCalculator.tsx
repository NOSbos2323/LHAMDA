import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, RefreshCw } from "lucide-react";

interface InstallmentCalculatorProps {
  carPrice?: number;
  maxTermMonths?: number;
  interestRate?: number;
}

const InstallmentCalculator = ({
  carPrice = 2500000, // Default price in Algerian Dinar
  maxTermMonths = 60, // Default max term of 5 years
  interestRate = 5.5, // Default interest rate
}: InstallmentCalculatorProps) => {
  const [downPayment, setDownPayment] = useState<number>(carPrice * 0.2); // Default 20% down payment
  const [termMonths, setTermMonths] = useState<number>(36); // Default 3 years
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(0);

  // Calculate installment details
  useEffect(() => {
    const loanAmount = carPrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const monthlyPaymentValue =
      (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));
    const totalPayment = monthlyPaymentValue * termMonths;
    const totalInterestValue = totalPayment - loanAmount;

    setMonthlyPayment(monthlyPaymentValue);
    setTotalInterest(totalInterestValue);
    setTotalCost(loanAmount + totalInterestValue);
  }, [carPrice, downPayment, termMonths, interestRate]);

  // Handle down payment slider change
  const handleDownPaymentSliderChange = (value: number[]) => {
    setDownPayment(value[0]);
  };

  // Handle down payment input change
  const handleDownPaymentInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= carPrice) {
      setDownPayment(value);
    }
  };

  // Handle term slider change
  const handleTermSliderChange = (value: number[]) => {
    setTermMonths(value[0]);
  };

  // Reset to default values
  const handleReset = () => {
    setDownPayment(carPrice * 0.2);
    setTermMonths(36);
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-DZ", {
      style: "currency",
      currency: "DZD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="mobile-calculator bg-white shadow-lg">
      <CardHeader className="bg-primary/5 px-3 sm:px-6 py-3 sm:py-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Calculator className="h-4 w-4 sm:h-5 sm:w-5" />
          Installment Calculator
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Adjust the values to calculate your monthly payments
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
        <div className="space-y-4 sm:space-y-6">
          {/* Down Payment Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="down-payment">Down Payment</Label>
              <span className="text-sm text-muted-foreground">
                {formatCurrency(downPayment)} (
                {Math.round((downPayment / carPrice) * 100)}%)
              </span>
            </div>
            <Slider
              id="down-payment-slider"
              min={0}
              max={carPrice}
              step={10000}
              value={[downPayment]}
              onValueChange={handleDownPaymentSliderChange}
              className="py-2"
            />
            <Input
              id="down-payment"
              type="number"
              value={downPayment}
              onChange={handleDownPaymentInputChange}
              className="mt-2 mobile-input"
            />
          </div>

          {/* Term Length Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="term-length">Term Length</Label>
              <span className="text-sm text-muted-foreground">
                {termMonths} months ({Math.round(termMonths / 12)} years)
              </span>
            </div>
            <Slider
              id="term-slider"
              min={12}
              max={maxTermMonths}
              step={6}
              value={[termMonths]}
              onValueChange={handleTermSliderChange}
              className="py-2"
            />
          </div>

          {/* Results Section */}
          <div className="mt-6 rounded-md bg-muted p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Monthly Payment:</span>
                <span className="font-semibold">
                  {formatCurrency(monthlyPayment)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total Interest:</span>
                <span className="text-muted-foreground">
                  {formatCurrency(totalInterest)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total Cost:</span>
                <span className="font-semibold">
                  {formatCurrency(totalCost)}
                </span>
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full mobile-button"
            onClick={handleReset}
          >
            <RefreshCw className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm">Reset to Default</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstallmentCalculator;
