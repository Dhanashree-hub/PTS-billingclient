// components/dairy/CollectionHistory.tsx
import React, { useState, useEffect } from "react";
import { ref, onValue, off, query, orderByChild, startAt, endAt } from "firebase/database";
import { database } from "@/firebase/firebaseConfig";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Download, Calendar } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface MilkCollection {
  id: string;
  farmerId: string;
  farmerName: string;
  milkType: 'cow' | 'buffalo';
  quantity: number;
  fat: number;
  degree: number;
  snf: number;
  ratePerLiter: number;
  totalAmount: number;
  timestamp: string;
}

interface DailySummary {
  date: string;
  totalLiters: number;
  totalAmount: number;
  totalCollections: number;
  averageFat: number;
  averageSNF: number;
}

const CollectionHistory: React.FC = () => {
  const { currentUser } = useAuth();
  const [collections, setCollections] = useState<MilkCollection[]>([]);
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");
  const [filterMilkType, setFilterMilkType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"detailed" | "summary">("summary");

  useEffect(() => {
    if (!currentUser) return;

    const collectionsRef = ref(database, `dairy/${currentUser.uid}/collections`);
    const collectionsListener = onValue(collectionsRef, (snapshot) => {
      const data = snapshot.val();
      const allCollections: MilkCollection[] = [];

      if (data) {
        Object.entries(data).forEach(([date, dayData]: [string, any]) => {
          Object.entries(dayData).forEach(([id, collection]: [string, any]) => {
            allCollections.push({
              id: `${date}-${id}`,
              ...collection,
              date: date
            });
          });
        });
      }

      setCollections(allCollections);
      generateDailySummaries(allCollections);
      setLoading(false);
    });

    return () => {
      off(collectionsRef, 'value', collectionsListener);
    };
  }, [currentUser]);

  const generateDailySummaries = (allCollections: MilkCollection[]) => {
    const summariesMap = new Map<string, DailySummary>();

    allCollections.forEach(collection => {
      const date = collection.timestamp.split('T')[0];
      if (!summariesMap.has(date)) {
        summariesMap.set(date, {
          date,
          totalLiters: 0,
          totalAmount: 0,
          totalCollections: 0,
          averageFat: 0,
          averageSNF: 0
        });
      }

      const summary = summariesMap.get(date)!;
      summary.totalLiters += collection.quantity;
      summary.totalAmount += collection.totalAmount;
      summary.totalCollections += 1;
      summary.averageFat = (summary.averageFat * (summary.totalCollections - 1) + collection.fat) / summary.totalCollections;
      summary.averageSNF = (summary.averageSNF * (summary.totalCollections - 1) + collection.snf) / summary.totalCollections;
    });

    const summaries = Array.from(summariesMap.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setDailySummaries(summaries);
  };

  const filteredCollections = collections.filter(collection => {
    const matchesDate = !filterDate || collection.timestamp.startsWith(filterDate);
    const matchesMilkType = filterMilkType === "all" || collection.milkType === filterMilkType;
    const matchesSearch = !searchTerm || 
      collection.farmerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesDate && matchesMilkType && matchesSearch;
  });

  const filteredSummaries = dailySummaries.filter(summary => {
    return !filterDate || summary.date === filterDate;
  });

  const exportToCSV = () => {
    const dataToExport = viewMode === "detailed" ? filteredCollections : filteredSummaries;
    
    if (dataToExport.length === 0) {
      toast({
        title: "No Data",
        description: "No data available to export",
        variant: "destructive",
      });
      return;
    }

    let csvContent = "";
    
    if (viewMode === "detailed") {
      csvContent = "Date,Farmer Name,Milk Type,Quantity (L),Fat %,SNF %,Rate/L,Total Amount\n";
      dataToExport.forEach((item: any) => {
        csvContent += `"${item.date || item.timestamp.split('T')[0]}","${item.farmerName}","${item.milkType}",${item.quantity},${item.fat},${item.snf},${item.ratePerLiter},${item.totalAmount}\n`;
      });
    } else {
      csvContent = "Date,Total Collections,Total Liters,Total Amount,Avg Fat %,Avg SNF %\n";
      dataToExport.forEach((item: any) => {
        csvContent += `"${item.date}",${item.totalCollections},${item.totalLiters},${item.totalAmount},${item.averageFat.toFixed(2)},${item.averageSNF.toFixed(2)}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `milk-collections-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Data exported to CSV file",
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Collection History</h1>
          <p className="text-gray-600">View and analyze milk collection records</p>
        </div>
        <Button onClick={exportToCSV} className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Farmer</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search farmers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="milkType">Milk Type</Label>
              <Select value={filterMilkType} onValueChange={setFilterMilkType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="cow">Cow Milk</SelectItem>
                  <SelectItem value="buffalo">Buffalo Milk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="viewMode">View Mode</Label>
              <Select value={viewMode} onValueChange={(value: "detailed" | "summary") => setViewMode(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select view" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Daily Summary</SelectItem>
                  <SelectItem value="detailed">Detailed View</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>
            {viewMode === "detailed" ? "Detailed Collections" : "Daily Summaries"}
            <Badge variant="secondary" className="ml-2">
              {viewMode === "detailed" ? filteredCollections.length : filteredSummaries.length} records
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {viewMode === "detailed" ? (
            <DetailedTableView collections={filteredCollections} />
          ) : (
            <SummaryTableView summaries={filteredSummaries} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Detailed Table View Component
const DetailedTableView: React.FC<{ collections: MilkCollection[] }> = ({ collections }) => {
  if (collections.length === 0) {
    return <div className="text-center py-8 text-gray-500">No collection records found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date & Time</TableHead>
            <TableHead>Farmer Name</TableHead>
            <TableHead>Milk Type</TableHead>
            <TableHead>Quantity (L)</TableHead>
            <TableHead>Fat %</TableHead>
            <TableHead>SNF %</TableHead>
            <TableHead>Rate/L</TableHead>
            <TableHead>Total Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {collections.map((collection) => (
            <TableRow key={collection.id}>
              <TableCell>
                <div className="text-sm">
                  {new Date(collection.timestamp).toLocaleDateString()}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(collection.timestamp).toLocaleTimeString()}
                </div>
              </TableCell>
              <TableCell className="font-medium">{collection.farmerName}</TableCell>
              <TableCell>
                <Badge variant={collection.milkType === 'cow' ? 'default' : 'secondary'}>
                  {collection.milkType}
                </Badge>
              </TableCell>
              <TableCell>{collection.quantity.toFixed(2)}</TableCell>
              <TableCell>{collection.fat.toFixed(2)}</TableCell>
              <TableCell>{collection.snf.toFixed(2)}</TableCell>
              <TableCell>₹{collection.ratePerLiter}</TableCell>
              <TableCell className="font-medium">₹{collection.totalAmount.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// Summary Table View Component
const SummaryTableView: React.FC<{ summaries: DailySummary[] }> = ({ summaries }) => {
  if (summaries.length === 0) {
    return <div className="text-center py-8 text-gray-500">No summary records found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Total Collections</TableHead>
            <TableHead>Total Liters</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Avg Fat %</TableHead>
            <TableHead>Avg SNF %</TableHead>
            <TableHead>Avg Rate/L</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {summaries.map((summary) => (
            <TableRow key={summary.date}>
              <TableCell className="font-medium">
                {new Date(summary.date).toLocaleDateString()}
              </TableCell>
              <TableCell>{summary.totalCollections}</TableCell>
              <TableCell>{summary.totalLiters.toFixed(2)}</TableCell>
              <TableCell className="font-medium">₹{summary.totalAmount.toFixed(2)}</TableCell>
              <TableCell>{summary.averageFat.toFixed(2)}</TableCell>
              <TableCell>{summary.averageSNF.toFixed(2)}</TableCell>
              <TableCell>
                ₹{(summary.totalAmount / summary.totalLiters).toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CollectionHistory;