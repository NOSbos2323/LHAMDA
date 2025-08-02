import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Heart, Eye, Share2, Lock, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface TelecomLink {
  id: string;
  name: string;
  url: string;
}

interface CarCardProps {
  id?: string;
  image?: string;
  make?: string;
  model?: string;
  year?: number;
  price?: number;
  monthlyPayment?: number;
  onViewDetails?: (id: string) => void;
  onSaveToFavorites?: (id: string) => void;
  onShare?: (id: string) => void;
}

const CarCard = ({
  id = "1",
  image = "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=80",
  make = "Toyota",
  model = "Corolla",
  year = 2023,
  price = 3500000,
  monthlyPayment = 45000,
  onViewDetails,
  onSaveToFavorites = () => {},
  onShare = () => {},
}: CarCardProps) => {
  const navigate = useNavigate();
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [telecomLinks, setTelecomLinks] = useState<TelecomLink[]>([]);

  // Format price with Algerian Dinar
  const formatPrice = (amount: number) => {
    return (
      new Intl.NumberFormat("ar-DZ", {
        style: "decimal",
        maximumFractionDigits: 0,
      }).format(amount) + " د.ج"
    );
  };

  // Fetch telecom links from database
  const fetchTelecomLinks = async () => {
    try {
      const { data, error } = await supabase
        .from("telecom_links")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      // Filter out azra entries
      const filteredData = (data || []).filter(
        (link) =>
          !link.name.toLowerCase().includes("azra") &&
          !link.name.toLowerCase().includes("أزرا"),
      );
      setTelecomLinks(filteredData);
    } catch (err) {
      console.error("Error fetching telecom links:", err);
    }
  };

  useEffect(() => {
    fetchTelecomLinks();

    // Set up real-time subscription for telecom links
    const telecomSubscription = supabase
      .channel("car-card-telecom-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "telecom_links" },
        (payload) => {
          console.log("Telecom links updated in car card:", payload);
          fetchTelecomLinks(); // Refresh telecom links data immediately
        },
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(telecomSubscription);
    };
  }, []);

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(id);
    } else {
      setShowAccountDialog(true);
    }
  };

  const handlePhoneConfirmation = () => {
    setShowAccountDialog(false);
    setShowPaymentDialog(true);
  };

  const handlePaymentMethod = (method: string) => {
    console.log(`Selected payment method: ${method}`);
    setShowPaymentDialog(false);
    // Here you would typically proceed with the selected payment method
  };

  return (
    <>
      <Card className="mobile-card w-full sm:w-[350px] h-[380px] sm:h-[420px] overflow-hidden transition-all duration-300 hover:shadow-2xl luxury-card animate-fade-in group">
        <div className="relative h-[200px] sm:h-[220px] overflow-hidden">
          <img
            src={image}
            alt={`${make} ${model}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute top-2 left-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full glass-effect hover:bg-white/20"
              onClick={() => onSaveToFavorites(id)}
            >
              <Heart className="h-5 w-5 text-white hover:text-red-400" />
            </Button>
          </div>
          <div className="absolute bottom-2 right-2">
            <Badge
              variant="secondary"
              className="glass-effect text-white border-white/20"
            >
              {year}
            </Badge>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <CardContent className="pt-3 sm:pt-4 px-3 sm:px-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                {make} {model}
              </h3>
              <p className="text-xl sm:text-2xl font-semibold text-primary mt-1">
                {formatPrice(price)}
              </p>
            </div>
            <div className="text-left">
              <p className="text-xs sm:text-sm text-muted-foreground">
                الدفع الشهري
              </p>
              <p className="font-semibold text-base sm:text-lg text-accent">
                {formatPrice(monthlyPayment)}
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between pt-0 px-3 sm:px-6 pb-3 sm:pb-6">
          <Button
            variant="default"
            className="flex-1 ml-2 mobile-button bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            onClick={handleViewDetails}
          >
            <Eye className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm">عرض التفاصيل</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="luxury-card h-8 w-8 sm:h-10 sm:w-10"
            onClick={() => onShare(id)}
          >
            <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </CardFooter>
      </Card>

      {/* Account Creation Dialog */}
      <Dialog open={showAccountDialog} onOpenChange={setShowAccountDialog}>
        <DialogContent className="mobile-dialog bg-white">
          <DialogHeader>
            <DialogTitle className="text-right text-xl font-bold text-primary">
              إنشاء حساب جديد
            </DialogTitle>
            <DialogDescription className="text-right text-muted-foreground">
              يرجى إدخال بياناتك لإنشاء حساب جديد والوصول إلى التفاصيل الكاملة
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label
                htmlFor="firstName"
                className="text-right block font-medium"
              >
                الاسم الأول *
              </Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="text-right border-2 focus:border-primary transition-colors"
                dir="rtl"
                placeholder="أدخل اسمك الأول"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="lastName"
                className="text-right block font-medium"
              >
                اللقب *
              </Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="text-right border-2 focus:border-primary transition-colors"
                dir="rtl"
                placeholder="أدخل لقبك"
              />
            </div>

            <Button
              onClick={handlePhoneConfirmation}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 mt-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              disabled={!firstName || !lastName}
            >
              <Lock className="mr-2 h-5 w-5" />
              تأكيد رقم الهاتف
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-4">
              سيتم استخدام هذه البيانات لإنشاء حسابك وإرسال تفاصيل السيارة
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Method Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="mobile-dialog bg-white">
          <DialogHeader>
            <DialogTitle className="text-right text-xl font-bold text-primary">
              يرجى تأكيد رقم الهاتف
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-6">
            {telecomLinks.length > 0 ? (
              telecomLinks.map((link) => {
                // Determine button color based on telecom company
                let buttonClass =
                  "w-full text-white font-semibold py-3 transition-all duration-200 hover:scale-105";
                const linkName = link.name.toLowerCase();
                if (
                  linkName.includes("mobilis") ||
                  linkName.includes("موبيليس")
                ) {
                  buttonClass +=
                    " bg-orange-500 hover:bg-orange-600 shadow-orange-200";
                } else if (
                  linkName.includes("djezzy") ||
                  linkName.includes("جيزي")
                ) {
                  buttonClass +=
                    " bg-blue-500 hover:bg-blue-600 shadow-blue-200";
                } else if (
                  linkName.includes("ooredoo") ||
                  linkName.includes("أوريدو")
                ) {
                  buttonClass += " bg-red-500 hover:bg-red-600 shadow-red-200";
                } else {
                  buttonClass +=
                    " bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90";
                }

                return (
                  <Button
                    key={link.id}
                    onClick={() => {
                      window.open(link.url, "_blank", "noopener,noreferrer");
                      handlePaymentMethod(link.name);
                    }}
                    className={buttonClass}
                  >
                    <Globe className="mr-2 h-5 w-5" />
                    {link.name}
                  </Button>
                );
              })
            ) : (
              // Fallback to default telecom options if no database links
              <>
                <Button
                  onClick={() => {
                    window.open(
                      "https://www.mobilis.dz",
                      "_blank",
                      "noopener,noreferrer",
                    );
                    handlePaymentMethod("mobilis");
                  }}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 transition-all duration-200 hover:scale-105 shadow-orange-200"
                >
                  <Globe className="mr-2 h-5 w-5" />
                  موبيليس
                </Button>
                <Button
                  onClick={() => {
                    window.open(
                      "https://www.djezzy.dz",
                      "_blank",
                      "noopener,noreferrer",
                    );
                    handlePaymentMethod("djezzy");
                  }}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 transition-all duration-200 hover:scale-105 shadow-blue-200"
                >
                  <Globe className="mr-2 h-5 w-5" />
                  جيزي
                </Button>
                <Button
                  onClick={() => {
                    window.open(
                      "https://www.ooredoo.dz",
                      "_blank",
                      "noopener,noreferrer",
                    );
                    handlePaymentMethod("ooredoo");
                  }}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 transition-all duration-200 hover:scale-105 shadow-red-200"
                >
                  <Globe className="mr-2 h-5 w-5" />
                  أوريدو
                </Button>
              </>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span>معاملة آمنة ومشفرة</span>
            </div>
            {telecomLinks.length > 0 && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                الروابط محدثة من قبل الإدارة • سيتم فتح الرابط في نافذة جديدة
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CarCard;
