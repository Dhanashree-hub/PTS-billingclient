// components/dairy/RateCalculator.tsx
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const RateCalculator: React.FC = () => {
  const [calculation, setCalculation] = useState({
    milkType: "cow" as 'cow' | 'buffalo',
    quantity: "",
    fat: "",
    degree: "",
    ratePerLiter: 0,
    totalAmount: 0
  });

  const [calculatedSNF, setCalculatedSNF] = useState<number>(0);

  // Rate charts
  const rateCharts = {
    cow: [
      { fat: 3.0, snf: 8.0, rate: 42 },
      { fat: 3.5, snf: 8.5, rate: 45 },
      { fat: 4.0, snf: 9.0, rate: 48 },
      { fat: 4.5, snf: 9.5, rate: 52 },
      { fat: 5.0, snf: 10.0, rate: 56 },
      { fat: 5.5, snf: 10.5, rate: 60 },
      { fat: 6.0, snf: 11.0, rate: 65 },
    ],
    buffalo: [
      { fat: 5.0, snf: 9.0, rate: 55 },
      { fat: 5.5, snf: 9.5, rate: 58 },
      { fat: 6.0, snf: 10.0, rate: 62 },
      { fat: 6.5, snf: 10.5, rate: 66 },
      { fat: 7.0, snf: 11.0, rate: 70 },
      { fat: 7.5, snf: 11.5, rate: 75 },
      { fat: 8.0, snf: 12.0, rate: 80 },
    ]
  };

  // Calculate SNF based on fat and degree
  const calculateSNF = (fat: number, degree: number): number => {
    const snf = (degree / 4) + (0.21 * fat) + 0.36;
    return parseFloat(snf.toFixed(2));
  };

  // Calculate rate based on fat and SNF
  const calculateRate = (fat: number, snf: number, milkType: 'cow' | 'buffalo'): number => {
    const chart = rateCharts[milkType];
    
    for (let i = chart.length - 1; i >= 0; i--) {
      if (fat >= chart[i].fat && snf >= chart[i].snf) {
        return chart[i].rate;
      }
    }
    
    return chart[0].rate;
  };

  const handleCalculate = () => {
    const fat = parseFloat(calculation.fat);
    const degree = parseFloat(calculation.degree);
    const quantity = parseFloat(calculation.quantity);

    if (!fat || !degree || !quantity) {
      return;
    }

    const snf = calculateSNF(fat, degree);
    const rate = calculateRate(fat, snf, calculation.milkType);
    const total = quantity * rate;

    setCalculatedSNF(snf);
    setCalculation(prev => ({
      ...prev,
      ratePerLiter: rate,
      totalAmount: total
    }));
  };

  const currentChart = rateCharts[calculation.milkType];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Rate Calculator</h1>
        <p className="text-gray-600">Calculate milk rates based on fat and SNF content</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calculator Form */}
        <Card>
          <CardHeader>
            <CardTitle>Calculate Rate</CardTitle>
            <CardDescription>Enter milk parameters to calculate rate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="calcMilkType">Milk Type</Label>
              <Select
                value={calculation.milkType}
                onValueChange={(value: 'cow' | 'buffalo') => 
                  setCalculation({ ...calculation, milkType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select milk type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cow">Cow Milk</SelectItem>
                  <SelectItem value="buffalo">Buffalo Milk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="calcQuantity">Quantity (Liters)</Label>
              <Input
                id="calcQuantity"
                type="number"
                step="0.01"
                placeholder="Enter quantity"
                value={calculation.quantity}
                onChange={(e) => setCalculation({ ...calculation, quantity: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="calcFat">Fat Content (%)</Label>
                <Input
                  id="calcFat"
                  type="number"
                  step="0.01"
                  placeholder="Fat %"
                  value={calculation.fat}
                  onChange={(e) => setCalculation({ ...calculation, fat: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="calcDegree">Degree</Label>
                <Input
                  id="calcDegree"
                  type="number"
                  step="0.01"
                  placeholder="Degree"
                  value={calculation.degree}
                  onChange={(e) => setCalculation({ ...calculation, degree: e.target.value })}
                />
              </div>
            </div>

            <Button onClick={handleCalculate} className="w-full">
              Calculate Rate
            </Button>

            {/* Results */}
            {(calculation.ratePerLiter > 0) && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-green-700 font-medium">SNF Content:</span>
                      <span className="font-bold">{calculatedSNF}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700 font-medium">Rate per Liter:</span>
                      <span className="font-bold">₹{calculation.ratePerLiter}</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span className="text-green-700 font-bold">Total Amount:</span>
                      <span className="font-bold">₹{calculation.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Rate Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Rate Chart - {calculation.milkType === 'cow' ? 'Cow Milk' : 'Buffalo Milk'}</CardTitle>
            <CardDescription>Current pricing based on fat and SNF content</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Min Fat %</TableHead>
                  <TableHead>Min SNF %</TableHead>
                  <TableHead>Rate/Liter (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentChart.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.fat}</TableCell>
                    <TableCell>{row.snf}</TableCell>
                    <TableCell className="font-medium">{row.rate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Calculation Formula */}
      <Card>
        <CardHeader>
          <CardTitle>Calculation Formula</CardTitle>
          <CardDescription>How rates are calculated</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>SNF Calculation:</strong>
              <p>SNF = (Degree / 4) + (0.21 × Fat) + 0.36</p>
            </div>
            <div>
              <strong>Rate Determination:</strong>
              <p>Based on the minimum fat and SNF requirements from the rate chart</p>
            </div>
            <div>
              <strong>Total Amount:</strong>
              <p>Total = Quantity (L) × Rate per Liter</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RateCalculator;