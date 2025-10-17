// components/dairy/FarmersManagement.tsx
import React, { useState, useEffect } from "react";
import { ref, onValue, off, push, update, remove } from "firebase/database";
import { database } from "@/firebase/firebaseConfig";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2, Phone, MapPin } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Farmer {
  id: string;
  name: string;
  mobile: string;
  address: string;
  milkType: 'cow' | 'buffalo' | 'both';
  joinDate: string;
  isActive: boolean;
  bankDetails?: {
    accountNumber: string;
    bankName: string;
    ifscCode: string;
  };
}

interface FarmerFormData {
  name: string;
  mobile: string;
  address: string;
  milkType: 'cow' | 'buffalo' | 'both';
  bankAccountNumber: string;
  bankName: string;
  ifscCode: string;
}

const FarmersManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null);
  const [formData, setFormData] = useState<FarmerFormData>({
    name: "",
    mobile: "",
    address: "",
    milkType: "both",
    bankAccountNumber: "",
    bankName: "",
    ifscCode: ""
  });

  useEffect(() => {
    if (!currentUser) return;

    const farmersRef = ref(database, `dairy/${currentUser.uid}/farmers`);
    const farmersListener = onValue(farmersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const farmersArray: Farmer[] = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value
        }));
        setFarmers(farmersArray.sort((a, b) => a.name.localeCompare(b.name)));
      } else {
        setFarmers([]);
      }
      setLoading(false);
    });

    return () => {
      off(farmersRef, 'value', farmersListener);
    };
  }, [currentUser]);

  const filteredFarmers = farmers.filter(farmer =>
    farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.mobile.includes(searchTerm)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const farmerData: any = {
        name: formData.name.trim(),
        mobile: formData.mobile.trim(),
        address: formData.address.trim(),
        milkType: formData.milkType,
        joinDate: new Date().toISOString(),
        isActive: true
      };

      // Add bank details if provided
      if (formData.bankAccountNumber && formData.bankName && formData.ifscCode) {
        farmerData.bankDetails = {
          accountNumber: formData.bankAccountNumber,
          bankName: formData.bankName,
          ifscCode: formData.ifscCode
        };
      }

      if (editingFarmer) {
        // Update existing farmer
        const farmerRef = ref(database, `dairy/${currentUser.uid}/farmers/${editingFarmer.id}`);
        await update(farmerRef, farmerData);
        toast({
          title: "Success",
          description: "Farmer updated successfully",
        });
      } else {
        // Add new farmer
        const farmersRef = ref(database, `dairy/${currentUser.uid}/farmers`);
        await push(farmersRef, farmerData);
        toast({
          title: "Success",
          description: "Farmer added successfully",
        });
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (farmer: Farmer) => {
    setEditingFarmer(farmer);
    setFormData({
      name: farmer.name,
      mobile: farmer.mobile,
      address: farmer.address,
      milkType: farmer.milkType,
      bankAccountNumber: farmer.bankDetails?.accountNumber || "",
      bankName: farmer.bankDetails?.bankName || "",
      ifscCode: farmer.bankDetails?.ifscCode || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (farmer: Farmer) => {
    if (!currentUser || !window.confirm(`Are you sure you want to delete ${farmer.name}?`)) return;

    try {
      const farmerRef = ref(database, `dairy/${currentUser.uid}/farmers/${farmer.id}`);
      await remove(farmerRef);
      toast({
        title: "Success",
        description: "Farmer deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (farmer: Farmer) => {
    if (!currentUser) return;

    try {
      const farmerRef = ref(database, `dairy/${currentUser.uid}/farmers/${farmer.id}/isActive`);
      await update(farmerRef, !farmer.isActive);
      toast({
        title: "Success",
        description: `Farmer ${!farmer.isActive ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      mobile: "",
      address: "",
      milkType: "both",
      bankAccountNumber: "",
      bankName: "",
      ifscCode: ""
    });
    setEditingFarmer(null);
  };

  const getMilkTypeBadge = (milkType: string) => {
    const variants = {
      cow: "default",
      buffalo: "secondary",
      both: "outline"
    } as const;

    return (
      <Badge variant={variants[milkType as keyof typeof variants]}>
        {milkType.charAt(0).toUpperCase() + milkType.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Farmers Management</h1>
          <p className="text-gray-600">Manage your dairy farmers and their details</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Farmer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Farmers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{farmers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Farmers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {farmers.filter(f => f.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cow Milk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {farmers.filter(f => f.milkType === 'cow' || f.milkType === 'both').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Buffalo Milk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {farmers.filter(f => f.milkType === 'buffalo' || f.milkType === 'both').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Farmers List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Farmers Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Farmer Details</TableHead>
                  <TableHead>Milk Type</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFarmers.map((farmer) => (
                  <TableRow key={farmer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {farmer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{farmer.name}</div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Phone className="h-3 w-3" />
                            {farmer.mobile}
                          </div>
                          {farmer.address && (
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate max-w-[200px]">{farmer.address}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getMilkTypeBadge(farmer.milkType)}</TableCell>
                    <TableCell>
                      {new Date(farmer.joinDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={farmer.isActive ? "default" : "secondary"}>
                        {farmer.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(farmer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(farmer)}
                        >
                          {farmer.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(farmer)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredFarmers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? "No farmers found matching your search" : "No farmers added yet"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Farmer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingFarmer ? "Edit Farmer" : "Add New Farmer"}
            </DialogTitle>
            <DialogDescription>
              {editingFarmer 
                ? "Update farmer details and information" 
                : "Add a new farmer to your dairy management system"
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Farmer Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number *</Label>
                <Input
                  id="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="milkType">Milk Type *</Label>
              <Select
                value={formData.milkType}
                onValueChange={(value: 'cow' | 'buffalo' | 'both') => 
                  setFormData({ ...formData, milkType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select milk type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">Both Cow & Buffalo</SelectItem>
                  <SelectItem value="cow">Cow Milk Only</SelectItem>
                  <SelectItem value="buffalo">Buffalo Milk Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Bank Details (Optional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankAccountNumber">Account Number</Label>
                  <Input
                    id="bankAccountNumber"
                    value={formData.bankAccountNumber}
                    onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input
                    id="ifscCode"
                    value={formData.ifscCode}
                    onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingFarmer ? "Update Farmer" : "Add Farmer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FarmersManagement;