import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { useBilling } from "@/contexts/BillingContext";
import { auth, database } from "@/firebase/firebaseConfig";
import PlanModal from "@/pages/PlanModal";
import CryptoJS from "crypto-js";
import { getAuth } from "firebase/auth";
import { get, onValue, push, ref, set } from "firebase/database";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

const CLOUDINARY_CLOUD_NAME = "db0zuhgnc";
const CLOUDINARY_UPLOAD_PRESET = "quick_bill_image";
const SECRET_KEY = "your-very-secure-secret-key";

const encrypt = (value: string) => {
  return CryptoJS.AES.encrypt(value, SECRET_KEY).toString();
};

const decrypt = (cipherText: string) => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return cipherText;
  }
};

interface FormState {
  code: string;
  name: string;
  category: string;
  subcategory: string;
  weight: string;
  quantity: string;
  imageUrl: string;
  // Price fields for different customer types
  regularPrice: string;
  wholesalerPrice: string;
  agentPrice: string;
  agent1Price: string;
  useSamePrice: boolean;
}

const weightOptions = [
  { value: "200ml", label: "200ml" },
  { value: "500ml", label: "500ml" },
  { value: "1L", label: "1L" },
  { value: "200g", label: "200g" },
  { value: "500g", label: "500g" },
  { value: "1kg", label: "1kg" },
];

const ProductForm = () => {
  const { t } = useTranslation("productform");
  const { productId } = useParams();
  const navigate = useNavigate();
  const { products, categories, addProduct, updateProduct } = useBilling();
  const isEditing = !!productId;

  const [formState, setFormState] = useState<FormState>({
    code: "",
    name: "",
    category: "",
    subcategory: "",
    weight: "",
    quantity: "0",
    imageUrl: "",
    regularPrice: "",
    wholesalerPrice: "",
    agentPrice: "",
    agent1Price: "",
    useSamePrice: true,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productLimit, setProductLimit] = useState<number | null>(null);
  const [currentProductCount, setCurrentProductCount] = useState(0);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing) {
      const product = products.find((p) => p.id === productId);
      if (product) {
        setFormState({
          code: product.code ? decrypt(product.code) : "",
          name: decrypt(product.name),
          category: product.category,
          subcategory: product.subcategory ? decrypt(product.subcategory) : "",
          weight: product.weight ? decrypt(product.weight) : "",
          quantity: product.quantity ? decrypt(product.quantity) : "0",
          imageUrl: product.imageUrl ? decrypt(product.imageUrl) : "",
          regularPrice: product.regularPrice ? decrypt(product.regularPrice) : "",
          wholesalerPrice: product.wholesalerPrice ? decrypt(product.wholesalerPrice) : "",
          agentPrice: product.agentPrice ? decrypt(product.agentPrice) : "",
          agent1Price: product.agent1Price ? decrypt(product.agent1Price) : "",
          useSamePrice: product.useSamePrice !== undefined ? product.useSamePrice : true,
        });
      } else {
        toast({
          title: t("error"),
          description: t("productNotFound"),
          variant: "destructive",
        });
        navigate("/products");
      }
    }
  }, [isEditing, productId, products, navigate, t]);

  useEffect(() => {
    const checkProductLimits = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      try {
        const configRef = ref(database, `users/${user.uid}/business`);
        const configSnapshot = await get(configRef);
        const limit = configSnapshot.val()?.productLimit;
        setProductLimit(limit);

        const productsRef = ref(database, `users/${user.uid}/products`);
        const productsSnapshot = await get(productsRef);
        setCurrentProductCount(productsSnapshot.size || 0);
      } catch (error) {
        console.error("Error checking product limits:", error);
      }
    };

    checkProductLimits();
  }, []);

  const checkDuplicateCode = (code: string) => {
    const trimmedCode = code.trim();
    if (!trimmedCode) return false;
    
    return products.some(
      p => p.code && decrypt(p.code) === trimmedCode && (!isEditing || p.id !== productId)
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));

    // If useSamePrice is enabled and regular price changes, update all prices
    if (name === "regularPrice" && formState.useSamePrice) {
      setFormState((prev) => ({
        ...prev,
        wholesalerPrice: value,
        agentPrice: value,
        agent1Price: value,
      }));
    }

    // Check for duplicate code when code field changes
    if (name === "code") {
      if (checkDuplicateCode(value)) {
        setCodeError(t("This product code already exists. Please use a different code."));
      } else {
        setCodeError(null);
      }
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    if (name === "useSamePrice") {
      setFormState((prev) => {
        if (checked) {
          // If enabling same price for all, copy regular price to all fields
          return {
            ...prev,
            useSamePrice: checked,
            wholesalerPrice: prev.regularPrice,
            agentPrice: prev.regularPrice,
            agent1Price: prev.regularPrice,
          };
        } else {
          return {
            ...prev,
            useSamePrice: checked,
          };
        }
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setFormState((prev) => ({ ...prev, imageUrl: "" }));
    }
  };

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    if (!response.ok) {
      toast({
        title: t("error"),
        description: t("uploadFailed"),
        variant: "destructive",
      });
      throw new Error("Image upload failed");
    }

    const data = await response.json();
    return data.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { 
      code, 
      name, 
      category, 
      subcategory, 
      weight, 
      quantity, 
      imageUrl,
      regularPrice,
      wholesalerPrice,
      agentPrice,
      agent1Price,
      useSamePrice
    } = formState;

    if (!code.trim() || !name.trim() || !regularPrice || !category) {
      toast({
        title: t("error"),
        description: t("fillAll"),
        variant: "destructive",
      });
      return;
    }

    const parsedRegularPrice = parseFloat(regularPrice);
    if (isNaN(parsedRegularPrice) || parsedRegularPrice <= 0) {
      toast({
        title: t("error"),
        description: t("validPrice"),
        variant: "destructive",
      });
      return;
    }

    // Validate other prices if not using same price for all
    if (!useSamePrice) {
      const parsedWholesalerPrice = parseFloat(wholesalerPrice);
      const parsedAgentPrice = parseFloat(agentPrice);
      const parsedAgent1Price = parseFloat(agent1Price);
      
      if (isNaN(parsedWholesalerPrice) || parsedWholesalerPrice <= 0 ||
          isNaN(parsedAgentPrice) || parsedAgentPrice <= 0 ||
          isNaN(parsedAgent1Price) || parsedAgent1Price <= 0) {
        toast({
          title: t("error"),
          description: t("validPrice"),
          variant: "destructive",
        });
        return;
      }
    }

    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity < 0) {
      toast({
        title: t("error"),
        description: t("validQuantity"),
        variant: "destructive",
      });
      return;
    }

    // Check if code already exists
    if (checkDuplicateCode(code)) {
      toast({
        title: t("error"),
        description: t("This product code already exists. Please use a different code."),
        variant: "destructive",
      });
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      toast({
        title: t("error"),
        description: t("notSignedIn"),
        variant: "destructive",
      });
      return;
    }

    if (!isEditing && productLimit !== null && currentProductCount >= productLimit) {
      setShowPlanModal(true);
      return;
    }

    setIsSubmitting(true);

    try {
      let finalImageUrl = imageUrl;

      if (imageFile) {
        finalImageUrl = await uploadImageToCloudinary(imageFile);
      }

      const productData = {
        code: encrypt(code.trim()),
        name: encrypt(name.trim()),
        price: encrypt(parsedRegularPrice.toString()), // Use regular price as default price
        category: category,
        subcategory: subcategory ? encrypt(subcategory) : "",
        weight: weight ? encrypt(weight) : "",
        quantity: encrypt(parsedQuantity.toString()),
        imageUrl: finalImageUrl ? encrypt(finalImageUrl) : "",
        regularPrice: encrypt(parsedRegularPrice.toString()),
        wholesalerPrice: useSamePrice 
          ? encrypt(parsedRegularPrice.toString()) 
          : encrypt(wholesalerPrice),
        agentPrice: useSamePrice 
          ? encrypt(parsedRegularPrice.toString()) 
          : encrypt(agentPrice),
        agent1Price: useSamePrice 
          ? encrypt(parsedRegularPrice.toString()) 
          : encrypt(agent1Price),
        useSamePrice: useSamePrice,
        createdAt: new Date().toISOString(),
      };

      if (isEditing && productId) {
        updateProduct(productId, productData);
        await set(ref(database, `users/${user.uid}/products/${productId}`), {
          id: productId,
          ...productData,
        });
        toast({
          title: t("success"),
          description: t("updated"),
        });
      } else {
        const newProductRef = push(ref(database, `users/${user.uid}/products`));
        const id = newProductRef.key!;
        const productWithId = { id, ...productData };
        await set(newProductRef, productWithId);
        addProduct(productWithId);
        toast({
          title: t("success"),
          description: t("saved"),
        });
      }

      navigate("/products");
    } catch (err) {
      console.error("Error saving product:", err);
      toast({
        title: t("error"),
        description: t("saveFailed"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
            replace: true,
          });
          toast({
            title: t("accountDisabledTitle"),
            description: t("accountDisabled"),
            variant: "destructive",
          });
        });
      }
    });

    return () => unsubscribe();
  }, [navigate, t]);

  const handlePlanSelected = (plan: string) => {
    toast.info(`${t("planSelected")}: ${plan}`);
    setShowPlanModal(false);
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-billing-dark dark:text-white">
          {isEditing ? t("titleEdit") : t("titleAdd")}
        </h1>
        {!isEditing && productLimit !== null && (
          <div className="text-sm text-gray-600">
            {t("productLimit")}: {currentProductCount}/{productLimit}
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? t("formTitleEdit") : t("formTitleAdd")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="code">{t("productCode")}</Label>
                <Input
                  id="code"
                  name="code"
                  placeholder={t("productCodePlaceholder")}
                  value={formState.code}
                  onChange={handleChange}
                  required
                  className={codeError ? "border-destructive" : ""}
                />
                {codeError && (
                  <p className="text-sm font-medium text-destructive">
                    {t("This product code already exists. Please use a different code.")}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">{t("productName")}</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder={t("productName")}
                  value={formState.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="regularPrice">{t("regularPrice")}</Label>
                <Input
                  id="regularPrice"
                  name="regularPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formState.regularPrice}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="useSamePrice" className="flex items-center">
                  <input
                    id="useSamePrice"
                    name="useSamePrice"
                    type="checkbox"
                    checked={formState.useSamePrice}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  {t("useSamePriceForAll")}
                </Label>
              </div>

              {!formState.useSamePrice && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="wholesalerPrice">{t("wholesalerPrice")}</Label>
                    <Input
                      id="wholesalerPrice"
                      name="wholesalerPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formState.wholesalerPrice}
                      onChange={handleChange}
                      required={!formState.useSamePrice}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="agentPrice">{t("agentPrice")}</Label>
                    <Input
                      id="agentPrice"
                      name="agentPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formState.agentPrice}
                      onChange={handleChange}
                      required={!formState.useSamePrice}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="agent1Price">{t("agent1Price")}</Label>
                    <Input
                      id="agent1Price"
                      name="agent1Price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formState.agent1Price}
                      onChange={handleChange}
                      required={!formState.useSamePrice}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="quantity">{t("productQuantity")}</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formState.quantity}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">{t("productCategory")}</Label>
                <Select
                  value={formState.category}
                  onValueChange={(value) =>
                    setFormState((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("productCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {decrypt(cat.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">{t("productWeight")}</Label>
                <Select
                  value={formState.weight}
                  onValueChange={(value) =>
                    setFormState((prev) => ({ ...prev, weight: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectWeight")} />
                  </SelectTrigger>
                  <SelectContent>
                    {weightOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">{t("productImage")}</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={!!formState.imageUrl}
                />
                <div className="text-center text-sm text-muted-foreground">
                  {t("or")}
                </div>
                <Input
                  type="text"
                  placeholder={t("pasteUrl")}
                  value={formState.imageUrl}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      imageUrl: e.target.value,
                    }))
                  }
                  disabled={!!imageFile}
                />
                {(formState.imageUrl || imageFile) && (
                  <img
                    src={
                      imageFile
                        ? URL.createObjectURL(imageFile)
                        : formState.imageUrl
                    }
                    alt={t("productImage")}
                    className="h-20 mt-2 rounded object-contain"
                  />
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/products")}
              >
                {t("cancel")}
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || (codeError !== null && !isEditing)}
              >
                {isSubmitting
                  ? t("saving")
                  : isEditing
                  ? t("updateProduct")
                  : t("addProduct")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {showPlanModal && (
        <PlanModal
          isOpen={showPlanModal}
          onClose={() => setShowPlanModal(false)}
        />
      )}
    </Layout>
  );
};

export default ProductForm;