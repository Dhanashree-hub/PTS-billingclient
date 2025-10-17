import Layout from "@/components/Layout";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { useBilling } from "@/contexts/BillingContext";
import { auth, database } from "@/firebase/firebaseConfig";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/lib/utils";
import CryptoJS from "crypto-js";
import { get, onValue, push, ref, set } from "firebase/database";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Pen, Plus, Search, Trash, Upload, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Encryption key
const SECRET_KEY = "your-very-secure-secret-key";

// AES Decrypt function
const decrypt = (cipherText: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8) || cipherText;
  } catch {
    return cipherText;
  }
};

// AES Encrypt function
const encrypt = (value: string): string => {
  return CryptoJS.AES.encrypt(value, SECRET_KEY).toString();
};

interface ImportPreviewData {
  code: string;
  name: string;
  category: string;
  weight?: string;
  quantity?: string;
  regularPrice?: string;
  wholesalerPrice?: string;
  agentPrice?: string;
  agent1Price?: string;
  useSamePrice?: boolean;
}

const Products = () => {
  const { t } = useTranslation("product");
  const { products, categories, deleteProduct, addProduct, updateProduct } = useBilling();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [previewData, setPreviewData] = useState<ImportPreviewData[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [missingCategories, setMissingCategories] = useState<string[]>([]);

  const getCategoryName = (encryptedCategoryId: string) => {
    const category = categories.find(cat => decrypt(cat.id) === decrypt(encryptedCategoryId));
    return category ? decrypt(category.name) : t('uncategorized');
  };

  const getCategoryIdByName = (categoryName: string) => {
    const category = categories.find(cat => 
      decrypt(cat.name).toLowerCase() === categoryName.toLowerCase()
    );
    return category ? category.id : null;
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = ref(database, `users/${user.uid}/business/active`);

    const unsubscribe = onValue(userRef, (snapshot) => {
      const isActive = snapshot.exists() ? snapshot.val() : false;

      if (!isActive) {
        auth.signOut().then(() => {
          navigate("/login", {
            state: { accountDisabled: true },
            replace: true
          });
          toast({
            title: t('account_disabled'),
            description: t('account_disabled_message'),
            variant: "destructive",
          });
        });
      }
    });

    return () => unsubscribe();
  }, [navigate, t]);

  const filteredProducts = searchQuery
    ? products.filter(product =>
        decrypt(product.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.code && decrypt(product.code).toLowerCase().includes(searchQuery.toLowerCase())) ||
        getCategoryName(product.category).toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.weight && decrypt(product.weight).toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.quantity && decrypt(product.quantity).toLowerCase().includes(searchQuery.toLowerCase())
      ))
    : products;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(firstSheet);

      // Map Excel data to our expected format
      const mappedData = jsonData.map(item => {
        // Handle different price types
        const getPrice = (fieldName: string) => {
          if (item[fieldName]) {
            if (typeof item[fieldName] === 'string') {
              return item[fieldName].replace(/[^\d.-]/g, '');
            } else {
              return item[fieldName].toString();
            }
          }
          return '';
        };
        
        return {
          code: item['Code']?.toString() || '',
          name: item['Name']?.toString() || '',
          category: item['Category']?.toString() || '',
          weight: item['Weight']?.toString() || '',
          quantity: item['Quantity']?.toString() || '0',
          regularPrice: getPrice('Regular Price'),
          wholesalerPrice: getPrice('Wholesaler Price'),
          agentPrice: getPrice('Agent Price'),
          agent1Price: getPrice('Agent1 Price'),
          useSamePrice: item['Use Same Price'] !== undefined ? Boolean(item['Use Same Price']) : true
        };
      }).filter(item => item.name); // Filter out rows without a name

      // Check for missing categories
      const uniqueCategories = [...new Set(mappedData.map(item => item.category))];
      const missing = uniqueCategories.filter(catName => 
        catName && !categories.some(cat => decrypt(cat.name).toLowerCase() === catName.toLowerCase())
      );

      if (missing.length > 0) {
        setMissingCategories(missing);
        toast({
          title: t('missingCategories'),
          description: (
            <div>
              {t('pleaseAddCategories')}: 
              <ul className="list-disc pl-5 mt-1">
                {missing.map((cat, i) => <li key={i}>{cat}</li>)}
              </ul>
            </div>
          ),
          variant: "destructive",
        });
        return;
      }

      setPreviewData(mappedData);
      setImportDialogOpen(true);
    };
    reader.readAsArrayBuffer(file);
  };

  const confirmImport = async () => {
    if (!previewData.length) return;
    setIsImporting(true);

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      toast({
        title: t('error'),
        description: t('notSignedIn'),
        variant: "destructive",
      });
      setIsImporting(false);
      return;
    }

    try {
      const productsRef = ref(database, `users/${user.uid}/products`);
      
      // Check product limits (only for new products)
      const configRef = ref(database, `users/${user.uid}/business`);
      const configSnapshot = await get(configRef);
      const limit = configSnapshot.val()?.productLimit || 100;
      const currentCount = (await get(productsRef)).size || 0;

      // Count only new products that will be added (not updates)
      const newProductsCount = previewData.filter(item => 
        !products.sample(p => p.code && decrypt(p.code) === item.code)
      ).length;

      if (currentCount + newProductsCount > limit) {
        toast({
          title: t('error'),
          description: t('productLimitExceeded'),
          variant: "destructive",
        });
        setIsImporting(false);
        return;
      }

      // Process each product
      let createdCount = 0;
      let updatedCount = 0;

      for (const product of previewData) {
        const categoryId = getCategoryIdByName(product.category);
        if (!categoryId) {
          console.warn(`Category not found: ${product.category}`);
          continue;
        }

        // Check if product with same code exists
        const existingProduct = products.find(p => 
          p.code && decrypt(p.code) === product.code
        );

        // Validate and clean price value
        const cleanPrice = (price: string) => {
          if (price) {
            // Remove any non-numeric characters except decimal point
            const cleaned = price.replace(/[^\d.-]/g, '');
            // Ensure it's a valid number
            if (isNaN(parseFloat(cleaned))) {
              console.warn(`Invalid price for product ${product.name}: ${price}`);
              return '0';
            }
            return cleaned;
          } else {
            return '0';
          }
        };

        const productData = {
          code: encrypt(product.code),
          name: encrypt(product.name),
          price: encrypt(cleanPrice(product.regularPrice || '0')), // Use regular price as default price
          category: categoryId,
          weight: product.weight ? encrypt(product.weight) : '',
          regularPrice: encrypt(cleanPrice(product.regularPrice || '0')),
          wholesalerPrice: product.useSamePrice 
            ? encrypt(cleanPrice(product.regularPrice || '0')) 
            : encrypt(cleanPrice(product.wholesalerPrice || '0')),
          agentPrice: product.useSamePrice 
            ? encrypt(cleanPrice(product.regularPrice || '0')) 
            : encrypt(cleanPrice(product.agentPrice || '0')),
          agent1Price: product.useSamePrice 
            ? encrypt(cleanPrice(product.regularPrice || '0')) 
            : encrypt(cleanPrice(product.agent1Price || '0')),
          useSamePrice: product.useSamePrice !== undefined ? product.useSamePrice : true,
          createdAt: existingProduct ? existingProduct.createdAt : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (existingProduct) {
          // Update existing product - update all fields
          const existingQuantity = existingProduct.quantity ? parseInt(decrypt(existingProduct.quantity)) : 0;
          const importedQuantity = parseInt(product.quantity || '0');
          const newQuantity = existingQuantity + importedQuantity;

          await set(ref(database, `users/${user.uid}/products/${existingProduct.id}`), {
            ...existingProduct,
            ...productData,
            quantity: encrypt(newQuantity.toString()),
          });

          updateProduct(existingProduct.id, {
            ...productData,
            quantity: encrypt(newQuantity.toString()),
          });
          updatedCount++;
        } else {
          // Create new product
          const newProductRef = push(productsRef);
          const id = newProductRef.key!;
          const productWithId = { 
            id, 
            ...productData,
            quantity: encrypt(product.quantity || '0'),
          };
          await set(newProductRef, productWithId);
          addProduct(productWithId);
          createdCount++;
        }
      }

      toast({
        title: t('success'),
        description: (
          <div>
            {t('importResults')}:
            <ul className="list-disc pl-5 mt-1">
              <li>{t('createdCount', { count: createdCount })}</li>
              <li>{t('updatedCount', { count: updatedCount })}</li>
            </ul>
          </div>
        ),
      });
      setImportDialogOpen(false);
      setPreviewData([]);
    } catch (err) {
      console.error("Error importing products:", err);
      toast({
        title: t('error'),
        description: t('importFailed'),
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const exportToExcel = () => {
    const data = filteredProducts.map(product => ({
      Code: product.code ? decrypt(product.code) : '',
      Name: decrypt(product.name),
      Category: getCategoryName(product.category),
      Weight: product.weight ? decrypt(product.weight) : '',
      Quantity: product.quantity ? decrypt(product.quantity) : '0',
      'Regular Price': formatCurrency(parseFloat(decrypt(product.regularPrice || '0'))),
      'Wholesaler Price': formatCurrency(parseFloat(decrypt(product.wholesalerPrice || product.regularPrice || '0'))),
      'Agent Price': formatCurrency(parseFloat(decrypt(product.agentPrice || product.regularPrice || '0'))),
      'Agent1 Price': formatCurrency(parseFloat(decrypt(product.agent1Price || product.regularPrice || '0'))),
      'Use Same Price': product.useSamePrice !== undefined ? product.useSamePrice : true
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, "products.xlsx");
  };

  const exportToRateChartExcel = () => {
    const data = filteredProducts.map(product => ({
      Code: product.code ? decrypt(product.code) : '',
      Name: decrypt(product.name),
      Weight: product.weight ? decrypt(product.weight) : '',
      Quantity: product.quantity ? decrypt(product.quantity) : '0',
      'Regular Price': parseFloat(decrypt(product.regularPrice || '0')),
      'Wholesaler Price': parseFloat(decrypt(product.wholesalerPrice || product.regularPrice || '0')),
      'Agent Price': parseFloat(decrypt(product.agentPrice || product.regularPrice || '0')),
      'Agent1 Price': parseFloat(decrypt(product.agent1Price || product.regularPrice || '0'))
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rate Chart");
    XLSX.writeFile(workbook, "rate_chart.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const title = "Products List";
    
    const headers = [
      "Code", 
      "Name", 
      "Category", 
      "Weight", 
      "Quantity", 
      "Regular Price",
      "Wholesaler Price",
      "Agent Price",
      "Agent1 Price"
    ];
    
    const data = filteredProducts.map(product => [
      product.code ? decrypt(product.code) : '-',
      decrypt(product.name),
      getCategoryName(product.category),
      product.weight ? decrypt(product.weight) : '-',
      product.quantity ? decrypt(product.quantity) : '0',
      formatCurrency(parseFloat(decrypt(product.regularPrice || '0'))),
      formatCurrency(parseFloat(decrypt(product.wholesalerPrice || product.regularPrice || '0'))),
      formatCurrency(parseFloat(decrypt(product.agentPrice || product.regularPrice || '0'))),
      formatCurrency(parseFloat(decrypt(product.agent1Price || product.regularPrice || '0')))
    ]);

    doc.setFontSize(16);
    doc.text(title, 14, 15);

    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 25,
      styles: {
        cellPadding: 3,
        fontSize: 8,
        valign: 'middle',
        halign: 'left'
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 20 }
    });

    doc.save("products.pdf");
  };

  const exportToRateChartPDF = () => {
    const doc = new jsPDF();
    const title = "Rate Chart";
    
    const headers = [
      "Code",
      "Name", 
      "Weight", 
      "Quantity", 
      "Regular Price",
      "Wholesaler Price",
      "Agent Price",
      "Agent1 Price"
    ];
    
    const data = filteredProducts.map(product => [
      product.code ? decrypt(product.code) : '-',
      decrypt(product.name),
      product.weight ? decrypt(product.weight) : '-',
      product.quantity ? decrypt(product.quantity) : '0',
      parseFloat(decrypt(product.regularPrice || '0')),
      parseFloat(decrypt(product.wholesalerPrice || product.regularPrice || '0')),
      parseFloat(decrypt(product.agentPrice || product.regularPrice || '0')),
      parseFloat(decrypt(product.agent1Price || product.regularPrice || '0'))
    ]);

    doc.setFontSize(16);
    doc.text(title, 14, 15);

    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 25,
      styles: {
        cellPadding: 3,
        fontSize: 8,
        valign: 'middle',
        halign: 'left'
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 20 }
    });

    doc.save("rate_chart.pdf");
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-billing-dark dark:text-white">
          {t('products')}
        </h1>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                {t('download')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={exportToExcel}>
                {t('downloadExcel')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToPDF}>
                {t('downloadPDF')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToRateChartExcel}>
                {t('downloadRateChartExcel')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToRateChartPDF}>
                {t('downloadRateChartPDF')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="outline" 
            className="relative"
            onClick={() => document.getElementById('excel-upload')?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            {t('importExcel')}
            <Input
              id="excel-upload"
              type="file"
              accept=".xlsx,.xls"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileUpload}
            />
          </Button>
          <Button onClick={() => navigate("/products/add")} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> {t('add_product')}
          </Button>
        </div>
      </div>

      {/* Import Preview Dialog */}
      <AlertDialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('importPreview')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('importPreviewDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="my-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('code')}</TableHead>
                  <TableHead>{t('name')}</TableHead>
                  <TableHead>{t('category')}</TableHead>
                  <TableHead>{t('regularPrice')}</TableHead>
                  <TableHead>{t('wholesalerPrice')}</TableHead>
                  <TableHead>{t('agentPrice')}</TableHead>
                  <TableHead>{t('agent1Price')}</TableHead>
                  <TableHead>{t('weight')}</TableHead>
                  <TableHead>{t('quantity')}</TableHead>
                  <TableHead>{t('action')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.map((item, index) => {
                  const existingProduct = products.find(p => 
                    p.code && decrypt(p.code) === item.code
                  );
                  
                  return (
                    <TableRow key={index}>
                      <TableCell>{item.code || '-'}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.regularPrice || '0'}</TableCell>
                      <TableCell>{item.wholesalerPrice || item.regularPrice || '0'}</TableCell>
                      <TableCell>{item.agentPrice || item.regularPrice || '0'}</TableCell>
                      <TableCell>{item.agent1Price || item.regularPrice || '0'}</TableCell>
                      <TableCell>{item.weight || '-'}</TableCell>
                      <TableCell>
                        {existingProduct ? (
                          <span className="flex items-center gap-1">
                            {item.quantity || '0'} (+)
                            {existingProduct.quantity ? decrypt(existingProduct.quantity) : '0'}
                          </span>
                        ) : (
                          item.quantity || '0'
                        )}
                      </TableCell>
                      <TableCell>
                        {existingProduct ? t('willUpdate') : t('willCreate')}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isImporting}>
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmImport}
              disabled={isImporting || !previewData.length}
            >
              {isImporting ? t('importing') : t('confirmImport')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="mb-8 overflow-hidden">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t('search_products')}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {!isMobile ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('code')}</TableHead>
                  <TableHead>{t('name')}</TableHead>
                  <TableHead>{t('category')}</TableHead>
                  <TableHead>{t('weight')}</TableHead>
                  <TableHead>{t('quantity')}</TableHead>
                  <TableHead>{t('regularPrice')}</TableHead>
                  <TableHead>{t('wholesalerPrice')}</TableHead>
                  <TableHead>{t('agentPrice')}</TableHead>
                  <TableHead>{t('agent1Price')}</TableHead>
                  <TableHead className="text-right">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
                    <TableRow key={product.id}>
                      <TableCell>{product.code ? decrypt(product.code) : '-'}</TableCell>
                      <TableCell className="font-medium">{decrypt(product.name)}</TableCell>
                      <TableCell>{getCategoryName(product.category)}</TableCell>
                      <TableCell>{product.weight ? decrypt(product.weight) : '-'}</TableCell>
                      <TableCell>{product.quantity ? decrypt(product.quantity) : '0'}</TableCell>
                      <TableCell>{formatCurrency(parseFloat(decrypt(product.regularPrice || '0')))}</TableCell>
                      <TableCell>{formatCurrency(parseFloat(decrypt(product.wholesalerPrice || product.regularPrice || '0')))}</TableCell>
                      <TableCell>{formatCurrency(parseFloat(decrypt(product.agentPrice || product.regularPrice || '0')))}</TableCell>
                      <TableCell>{formatCurrency(parseFloat(decrypt(product.agent1Price || product.regularPrice || '0')))}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/products/edit/${product.id}`)}
                          >
                            <Pen className="h-4 w-4" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-billing-danger">
                                <Trash className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('delete_product')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t('confirm_delete', { name: decrypt(product.name) })}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-billing-danger hover:bg-red-600"
                                  onClick={() => deleteProduct(product.id)}
                                >
                                  {t('delete')}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-billing-secondary">
                      {searchQuery ? t('no_products_search') : t('no_products')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          ) : (
            <div className="divide-y">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <div key={product.id} className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h3 className="font-medium">{decrypt(product.name)}</h3>
                        {product.code && (
                          <div className="text-xs text-billing-secondary">
                            {t('code')}: {decrypt(product.code)}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/products/edit/${product.id}`)}
                          className="h-8 w-8"
                        >
                          <Pen className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-billing-danger"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('delete_product')}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('confirm_delete', { name: decrypt(product.name) })}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-billing-danger hover:bg-red-600"
                                onClick={() => deleteProduct(product.id)}
                              >
                                {t('delete')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <div className="text-sm text-billing-secondary">
                      <div>{t('category')}: {getCategoryName(product.category)}</div>
                      <div>{t('weight')}: {product.weight ? decrypt(product.weight) : '-'}</div>
                      <div>{t('quantity')}: {product.quantity ? decrypt(product.quantity) : '0'}</div>
                      <div className="font-medium mt-1 text-billing-primary">
                        {t('regularPrice')}: {formatCurrency(parseFloat(decrypt(product.regularPrice || '0')))}
                      </div>
                      <div className="text-xs">
                        {t('wholesalerPrice')}: {formatCurrency(parseFloat(decrypt(product.wholesalerPrice || product.regularPrice || '0')))}
                      </div>
                      <div className="text-xs">
                        {t('agentPrice')}: {formatCurrency(parseFloat(decrypt(product.agentPrice || product.regularPrice || '0')))}
                      </div>
                      <div className="text-xs">
                        {t('agent1Price')}: {formatCurrency(parseFloat(decrypt(product.agent1Price || product.regularPrice || '0')))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-billing-secondary">
                  {searchQuery ? t('no_products_search') : t('no_products')}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </Layout>
  );
};

export default Products;