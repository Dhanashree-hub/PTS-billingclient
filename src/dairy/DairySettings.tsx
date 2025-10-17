// components/dairy/DairySettings.tsx
import React, { useState, useEffect } from "react";
import { ref, onValue, off, update } from "firebase/database";
import { database } from "@/firebase/firebaseConfig";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, Building, Calculator, CreditCard } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface RateChartItem {
  minFat: number;
  minSNF: number;
  rate: number;
}

interface DairySettings {
  dairyName: string;
  address: string;
  contactNumber: string;
  gstNumber: string;
  rateCharts: {
    cow: RateChartItem[];
    buffalo: RateChartItem[];
  };
  paymentSettings: {
    paymentCycle: 'daily' | 'weekly' | 'monthly';
    paymentDay: number;
    advancePayment: boolean;
  };
}

const DairySettings: React.FC = () => {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState<DairySettings>({
    dairyName: "",
    address: "",
    contactNumber: "",
    gstNumber: "",
    rateCharts: {
      cow: [
        { minFat: 3.0, minSNF: 8.0, rate: 42 },
        { minFat: 3.5, minSNF: 8.5, rate: 45 },
        { minFat: 4.0, minSNF: 9.0, rate: 48 },
        { minFat: 4.5, minSNF: 9.5, rate: 52 },
        { minFat: 5.0, minSNF: 10.0, rate: 56 },
        { minFat: 5.5, minSNF: 10.5, rate: 60 },
        { minFat: 6.0, minSNF: 11.0, rate: 65 },
      ],
      buffalo: [
        { minFat: 5.0, minSNF: 9.0, rate: 55 },
        { minFat: 5.5, minSNF: 9.5, rate: 58 },
        { minFat: 6.0, minSNF: 10.0, rate: 62 },
        { minFat: 6.5, minSNF: 10.5, rate: 66 },
        { minFat: 7.0, minSNF: 11.0, rate: 70 },
        { minFat: 7.5, minSNF: 11.5, rate: 75 },
        { minFat: 8.0, minSNF: 12.0, rate: 80 },
      ]
    },
    paymentSettings: {
      paymentCycle: 'daily',
      paymentDay: 1,
      advancePayment: false
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const settingsRef = ref(database, `dairy/${currentUser.uid}/settings`);
    const settingsListener = onValue(settingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSettings(prev => ({
          ...prev,
          ...data
        }));
      }
      setLoading(false);
    });

    return () => {
      off(settingsRef, 'value', settingsListener);
    };
  }, [currentUser]);

  const handleSaveSettings = async () => {
    if (!currentUser) return;

    setSaving(true);
    try {
      const settingsRef = ref(database, `dairy/${currentUser.uid}/settings`);
      await update(settingsRef, settings);
      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddRateItem = (milkType: 'cow' | 'buffalo') => {
    const currentChart = settings.rateCharts[milkType];
    const lastItem = currentChart[currentChart.length - 1];
    
    const newItem: RateChartItem = {
      minFat: lastItem ? lastItem.minFat + 0.5 : 3.0,
      minSNF: lastItem ? lastItem.minSNF + 0.5 : 8.0,
      rate: lastItem ? lastItem.rate + 5 : 40
    };

    setSettings(prev => ({
      ...prev,
      rateCharts: {
        ...prev.rateCharts,
        [milkType]: [...currentChart, newItem]
      }
    }));
  };

  const handleRemoveRateItem = (milkType: 'cow' | 'buffalo', index: number) => {
    const currentChart = settings.rateCharts[milkType];
    if (currentChart.length <= 1) {
      toast({
        title: "Error",
        description: "Cannot remove the last rate item",
        variant: "destructive",
      });
      return;
    }

    const newChart = currentChart.filter((_, i) => i !== index);
    setSettings(prev => ({
      ...prev,
      rateCharts: {
        ...prev.rateCharts,
        [milkType]: newChart
      }
    }));
  };

  const handleRateChange = (milkType: 'cow' | 'buffalo', index: number, field: keyof RateChartItem, value: string) => {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) return;

    const newChart = settings.rateCharts[milkType].map((item, i) => 
      i === index ? { ...item, [field]: numericValue } : item
    );

    setSettings(prev => ({
      ...prev,
      rateCharts: {
        ...prev.rateCharts,
        [milkType]: newChart
      }
    }));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dairy Settings</h1>
          <p className="text-gray-600">Configure your dairy management system</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general" className="gap-2">
            <Building className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="rates" className="gap-2">
            <Calculator className="h-4 w-4" />
            Rate Charts
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>Basic details about your dairy business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dairyName">Dairy Name *</Label>
                  <Input
                    id="dairyName"
                    value={settings.dairyName}
                    onChange={(e) => setSettings(prev => ({ ...prev, dairyName: e.target.value }))}
                    placeholder="Enter dairy name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    value={settings.contactNumber}
                    onChange={(e) => setSettings(prev => ({ ...prev, contactNumber: e.target.value }))}
                    placeholder="Enter contact number"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={settings.address}
                  onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter dairy address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gstNumber">GST Number</Label>
                <Input
                  id="gstNumber"
                  value={settings.gstNumber}
                  onChange={(e) => setSettings(prev => ({ ...prev, gstNumber: e.target.value }))}
                  placeholder="Enter GST number"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rate Charts Settings */}
        <TabsContent value="rates">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cow Milk Rate Chart */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Cow Milk Rate Chart</CardTitle>
                  <CardDescription>Set rates based on fat and SNF content</CardDescription>
                </div>
                <Button
                  onClick={() => handleAddRateItem('cow')}
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Rate
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Min Fat %</TableHead>
                      <TableHead>Min SNF %</TableHead>
                      <TableHead>Rate/L (₹)</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {settings.rateCharts.cow.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.1"
                            value={item.minFat}
                            onChange={(e) => handleRateChange('cow', index, 'minFat', e.target.value)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.1"
                            value={item.minSNF}
                            onChange={(e) => handleRateChange('cow', index, 'minSNF', e.target.value)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.rate}
                            onChange={(e) => handleRateChange('cow', index, 'rate', e.target.value)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveRateItem('cow', index)}
                            disabled={settings.rateCharts.cow.length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Buffalo Milk Rate Chart */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Buffalo Milk Rate Chart</CardTitle>
                  <CardDescription>Set rates based on fat and SNF content</CardDescription>
                </div>
                <Button
                  onClick={() => handleAddRateItem('buffalo')}
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Rate
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Min Fat %</TableHead>
                      <TableHead>Min SNF %</TableHead>
                      <TableHead>Rate/L (₹)</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {settings.rateCharts.buffalo.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.1"
                            value={item.minFat}
                            onChange={(e) => handleRateChange('buffalo', index, 'minFat', e.target.value)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.1"
                            value={item.minSNF}
                            onChange={(e) => handleRateChange('buffalo', index, 'minSNF', e.target.value)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.rate}
                            onChange={(e) => handleRateChange('buffalo', index, 'rate', e.target.value)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveRateItem('buffalo', index)}
                            disabled={settings.rateCharts.buffalo.length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Rate Calculation Info */}
          <Card>
            <CardHeader>
              <CardTitle>Rate Calculation Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p><strong>How rates are calculated:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>SNF is automatically calculated using: <code>SNF = (Degree / 4) + (0.21 × Fat) + 0.36</code></li>
                  <li>The system finds the highest rate where both fat and SNF meet the minimum requirements</li>
                  <li>If milk parameters don't meet any threshold, the lowest rate is applied</li>
                  <li>Total amount = Quantity (L) × Rate per Liter</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>Configure payment cycles and methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentCycle">Payment Cycle</Label>
                    <Select
                      value={settings.paymentSettings.paymentCycle}
                      onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                        setSettings(prev => ({
                          ...prev,
                          paymentSettings: { ...prev.paymentSettings, paymentCycle: value }
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment cycle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {settings.paymentSettings.paymentCycle !== 'daily' && (
                    <div className="space-y-2">
                      <Label htmlFor="paymentDay">
                        {settings.paymentSettings.paymentCycle === 'weekly' ? 'Payment Day' : 'Payment Date'}
                      </Label>
                      <Select
                        value={settings.paymentSettings.paymentDay.toString()}
                        onValueChange={(value) => 
                          setSettings(prev => ({
                            ...prev,
                            paymentSettings: { ...prev.paymentSettings, paymentDay: parseInt(value) }
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent>
                          {settings.paymentSettings.paymentCycle === 'weekly' ? (
                            <>
                              <SelectItem value="1">Monday</SelectItem>
                              <SelectItem value="2">Tuesday</SelectItem>
                              <SelectItem value="3">Wednesday</SelectItem>
                              <SelectItem value="4">Thursday</SelectItem>
                              <SelectItem value="5">Friday</SelectItem>
                              <SelectItem value="6">Saturday</SelectItem>
                              <SelectItem value="7">Sunday</SelectItem>
                            </>
                          ) : (
                            Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                              <SelectItem key={day} value={day.toString()}>
                                {day}
                                {day === 1 || day === 21 || day === 31 ? 'st' : 
                                 day === 2 || day === 22 ? 'nd' : 
                                 day === 3 || day === 23 ? 'rd' : 'th'}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="advancePayment"
                      checked={settings.paymentSettings.advancePayment}
                      onChange={(e) => 
                        setSettings(prev => ({
                          ...prev,
                          paymentSettings: { ...prev.paymentSettings, advancePayment: e.target.checked }
                        }))
                      }
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="advancePayment">Enable Advance Payments</Label>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Current Payment Setup</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Cycle:</span>
                        <Badge variant="outline" className="capitalize">
                          {settings.paymentSettings.paymentCycle}
                        </Badge>
                      </div>
                      {settings.paymentSettings.paymentCycle !== 'daily' && (
                        <div className="flex justify-between">
                          <span>Payment Day:</span>
                          <span>
                            {settings.paymentSettings.paymentCycle === 'weekly' 
                              ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][settings.paymentSettings.paymentDay - 1]
                              : `${settings.paymentSettings.paymentDay}${settings.paymentSettings.paymentDay === 1 ? 'st' : settings.paymentSettings.paymentDay === 2 ? 'nd' : settings.paymentSettings.paymentDay === 3 ? 'rd' : 'th'}`
                            }
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Advance Payments:</span>
                        <Badge variant={settings.paymentSettings.advancePayment ? "default" : "secondary"}>
                          {settings.paymentSettings.advancePayment ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DairySettings;