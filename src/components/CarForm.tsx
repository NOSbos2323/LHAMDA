import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, X } from "lucide-react";

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  monthly_payment: number;
  image: string;
  mileage?: number;
  transmission?: string;
  fuel_type?: string;
}

interface CarFormProps {
  car?: Car | null;
  onSave: (car: Omit<Car, "id" | "created_at" | "updated_at">) => void;
  onCancel: () => void;
}

const CarForm: React.FC<CarFormProps> = ({ car, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    price: 0,
    monthly_payment: 0,
    image: "",
    mileage: 0,
    transmission: "أوتوماتيك",
    fuel_type: "بنزين",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (car) {
      setFormData({
        make: car.make,
        model: car.model,
        year: car.year,
        price: car.price,
        monthly_payment: car.monthly_payment,
        image: car.image,
        mileage: car.mileage || 0,
        transmission: car.transmission || "أوتوماتيك",
        fuel_type: car.fuel_type || "بنزين",
      });
    }
  }, [car]);

  // Calculate monthly payment automatically based on price
  useEffect(() => {
    if (formData.price > 0) {
      // Simple calculation: 20% down payment, 36 months, 5.9% interest
      const principal = formData.price * 0.8; // 80% financed
      const monthlyRate = 0.059 / 12; // 5.9% annual rate
      const months = 36;
      const monthlyPayment =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);

      setFormData((prev) => ({
        ...prev,
        monthly_payment: Math.round(monthlyPayment),
      }));
    }
  }, [formData.price]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.make.trim()) {
      newErrors.make = "الماركة مطلوبة";
    }

    if (!formData.model.trim()) {
      newErrors.model = "الموديل مطلوب";
    }

    if (formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = "سنة غير صحيحة";
    }

    if (formData.price <= 0) {
      newErrors.price = "السعر يجب أن يكون أكبر من صفر";
    }

    if (!formData.image.trim()) {
      newErrors.image = "رابط الصورة مطلوب";
    } else if (!isValidUrl(formData.image)) {
      newErrors.image = "رابط الصورة غير صحيح";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const formatPrice = (amount: number) => {
    return (
      new Intl.NumberFormat("ar-DZ", {
        style: "decimal",
        maximumFractionDigits: 0,
      }).format(amount) + " د.ج"
    );
  };

  return (
    <div className="bg-background">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">
            {car ? "تعديل بيانات السيارة" : "إضافة سيارة جديدة"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">المعلومات الأساسية</h3>

                <div className="space-y-2">
                  <Label htmlFor="make">الماركة *</Label>
                  <Input
                    id="make"
                    value={formData.make}
                    onChange={(e) => handleInputChange("make", e.target.value)}
                    placeholder="مثال: تويوتا، هوندا، نيسان"
                    className={errors.make ? "border-red-500" : ""}
                  />
                  {errors.make && (
                    <p className="text-sm text-red-500">{errors.make}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">الموديل *</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => handleInputChange("model", e.target.value)}
                    placeholder="مثال: كامري، أكورد، التيما"
                    className={errors.model ? "border-red-500" : ""}
                  />
                  {errors.model && (
                    <p className="text-sm text-red-500">{errors.model}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">السنة *</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) =>
                      handleInputChange("year", parseInt(e.target.value) || 0)
                    }
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    className={errors.year ? "border-red-500" : ""}
                  />
                  {errors.year && (
                    <p className="text-sm text-red-500">{errors.year}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mileage">المسافة المقطوعة (كم)</Label>
                  <Input
                    id="mileage"
                    type="number"
                    value={formData.mileage}
                    onChange={(e) =>
                      handleInputChange(
                        "mileage",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">المواصفات التقنية</h3>

                <div className="space-y-2">
                  <Label htmlFor="transmission">ناقل الحركة</Label>
                  <Select
                    value={formData.transmission}
                    onValueChange={(value) =>
                      handleInputChange("transmission", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="أوتوماتيك">أوتوماتيك</SelectItem>
                      <SelectItem value="يدوي">يدوي</SelectItem>
                      <SelectItem value="CVT">CVT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fuel_type">نوع الوقود</Label>
                  <Select
                    value={formData.fuel_type}
                    onValueChange={(value) =>
                      handleInputChange("fuel_type", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="بنزين">بنزين</SelectItem>
                      <SelectItem value="ديزل">ديزل</SelectItem>
                      <SelectItem value="هجين">هجين</SelectItem>
                      <SelectItem value="كهربائي">كهربائي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">السعر (د.ج) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      handleInputChange("price", parseInt(e.target.value) || 0)
                    }
                    min="0"
                    placeholder="3500000"
                    className={errors.price ? "border-red-500" : ""}
                  />
                  {errors.price && (
                    <p className="text-sm text-red-500">{errors.price}</p>
                  )}
                  {formData.price > 0 && (
                    <p className="text-sm text-muted-foreground">
                      السعر: {formatPrice(formData.price)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthly_payment">القسط الشهري (د.ج)</Label>
                  <Input
                    id="monthly_payment"
                    type="number"
                    value={formData.monthly_payment}
                    onChange={(e) =>
                      handleInputChange(
                        "monthly_payment",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    min="0"
                    placeholder="محسوب تلقائياً"
                  />
                  {formData.monthly_payment > 0 && (
                    <p className="text-sm text-muted-foreground">
                      القسط الشهري: {formatPrice(formData.monthly_payment)}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    يتم حساب القسط تلقائياً بناءً على السعر (دفعة مقدمة 20%، 36
                    شهر، فائدة 5.9%)
                  </p>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">الصورة</h3>
              <div className="space-y-2">
                <Label htmlFor="image">رابط الصورة *</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => handleInputChange("image", e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className={errors.image ? "border-red-500" : ""}
                />
                {errors.image && (
                  <p className="text-sm text-red-500">{errors.image}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  يمكنك استخدام روابط من Unsplash أو أي موقع آخر للصور
                </p>
              </div>

              {/* Image Preview */}
              {formData.image && isValidUrl(formData.image) && (
                <div className="space-y-2">
                  <Label>معاينة الصورة</Label>
                  <div className="w-full max-w-md mx-auto">
                    <img
                      src={formData.image}
                      alt="معاينة"
                      className="w-full h-48 object-cover rounded-lg border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 ml-2" />
                إلغاء
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <Save className="h-4 w-4 ml-2" />
                {car ? "حفظ التعديلات" : "إضافة السيارة"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CarForm;
