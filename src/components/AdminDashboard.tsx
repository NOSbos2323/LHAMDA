import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Edit,
  Trash2,
  LogOut,
  RefreshCw,
  Save,
  Globe,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import CarForm from "./CarForm";
import CarCard from "./CarCard";

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
  created_at?: string;
  updated_at?: string;
}

interface TelecomLink {
  id: string;
  name: string;
  url: string;
  created_at?: string;
  updated_at?: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  membership_type: string;
  membership_duration?: string;
  subscription_price?: number;
  created_at?: string;
  updated_at?: string;
}

interface PricingSettings {
  monthly: number;
  quarterly: number;
  yearly: number;
}

interface AdminDashboardProps {
  onLogout?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onLogout = () => {},
}) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [telecomLinks, setTelecomLinks] = useState<TelecomLink[]>([]);
  const [editingLink, setEditingLink] = useState<TelecomLink | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isMemberFormOpen, setIsMemberFormOpen] = useState(false);
  const [pricingSettings] = useState<PricingSettings>({
    monthly: 5000,
    quarterly: 13500,
    yearly: 48000,
  });

  // Fetch cars from database
  const fetchCars = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCars(data || []);
    } catch (err) {
      console.error("Error fetching cars:", err);
      setError("فشل في تحميل البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch telecom links from database
  const fetchTelecomLinks = async () => {
    try {
      const { data, error } = await supabase
        .from("telecom_links")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setTelecomLinks(data || []);
    } catch (err) {
      console.error("Error fetching telecom links:", err);
      setError("فشل في تحميل روابط الاتصالات");
    }
  };

  // Fetch members from database
  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error("Error fetching members:", err);
      setError("فشل في تحميل بيانات الأعضاء");
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    // Subscribe to cars table changes
    const carsSubscription = supabase
      .channel("cars-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cars" },
        (payload) => {
          console.log("Cars table changed:", payload);
          fetchCars(); // Refresh cars data
        },
      )
      .subscribe();

    // Subscribe to telecom_links table changes
    const telecomSubscription = supabase
      .channel("telecom-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "telecom_links" },
        (payload) => {
          console.log("Telecom links changed:", payload);
          fetchTelecomLinks(); // Refresh telecom links data
        },
      )
      .subscribe();

    // Subscribe to members table changes
    const membersSubscription = supabase
      .channel("members-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "members" },
        (payload) => {
          console.log("Members table changed:", payload);
          fetchMembers(); // Refresh members data
        },
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(carsSubscription);
      supabase.removeChannel(telecomSubscription);
      supabase.removeChannel(membersSubscription);
    };
  }, []);

  useEffect(() => {
    fetchCars();
    fetchTelecomLinks();
    fetchMembers();
  }, []);

  const handleAddCar = () => {
    setSelectedCar(null);
    setIsFormOpen(true);
  };

  const handleEditCar = (car: Car) => {
    setSelectedCar(car);
    setIsFormOpen(true);
  };

  const handleDeleteCar = async (carId: string) => {
    if (confirm("هل أنت متأكد من حذف هذه السيارة؟")) {
      try {
        const { error } = await supabase.from("cars").delete().eq("id", carId);

        if (error) throw error;

        setCars(cars.filter((car) => car.id !== carId));
      } catch (err) {
        console.error("Error deleting car:", err);
        alert("فشل في حذف السيارة");
      }
    }
  };

  const handleSaveCar = async (
    carData: Omit<Car, "id" | "created_at" | "updated_at">,
  ) => {
    try {
      if (selectedCar) {
        // Edit existing car
        const { error } = await supabase
          .from("cars")
          .update({
            make: carData.make,
            model: carData.model,
            year: carData.year,
            price: carData.price,
            monthly_payment: carData.monthly_payment,
            image: carData.image,
            mileage: carData.mileage,
            transmission: carData.transmission,
            fuel_type: carData.fuel_type,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedCar.id);

        if (error) throw error;

        setCars(
          cars.map((car) =>
            car.id === selectedCar.id ? { ...car, ...carData } : car,
          ),
        );
      } else {
        // Add new car
        const { data, error } = await supabase
          .from("cars")
          .insert({
            make: carData.make,
            model: carData.model,
            year: carData.year,
            price: carData.price,
            monthly_payment: carData.monthly_payment,
            image: carData.image,
            mileage: carData.mileage,
            transmission: carData.transmission,
            fuel_type: carData.fuel_type,
          })
          .select()
          .single();

        if (error) throw error;

        setCars([data, ...cars]);
      }

      setIsFormOpen(false);
      setSelectedCar(null);
    } catch (err) {
      console.error("Error saving car:", err);
      alert("فشل في حفظ البيانات");
    }
  };

  const handleUpdateTelecomLink = async (linkId: string, newUrl: string) => {
    try {
      const { error } = await supabase
        .from("telecom_links")
        .update({ url: newUrl, updated_at: new Date().toISOString() })
        .eq("id", linkId);

      if (error) throw error;

      setTelecomLinks(
        telecomLinks.map((link) =>
          link.id === linkId ? { ...link, url: newUrl } : link,
        ),
      );
      setEditingLink(null);
    } catch (err) {
      console.error("Error updating telecom link:", err);
      alert("فشل في تحديث الرابط");
    }
  };

  // Member management functions
  const handleEditMember = (member: Member) => {
    setSelectedMember(member);
    setIsMemberFormOpen(true);
  };

  const handleDeleteMember = async (memberId: string) => {
    if (confirm("هل أنت متأكد من حذف هذا العضو؟")) {
      try {
        const { error } = await supabase
          .from("members")
          .delete()
          .eq("id", memberId);

        if (error) throw error;

        setMembers(members.filter((member) => member.id !== memberId));
      } catch (err) {
        console.error("Error deleting member:", err);
        alert("فشل في حذف العضو");
      }
    }
  };

  const handleSaveMember = async (memberData: Partial<Member>) => {
    try {
      if (selectedMember) {
        // Edit existing member
        const { error } = await supabase
          .from("members")
          .update({
            ...memberData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedMember.id);

        if (error) throw error;

        setMembers(
          members.map((member) =>
            member.id === selectedMember.id
              ? { ...member, ...memberData }
              : member,
          ),
        );
      }

      setIsMemberFormOpen(false);
      setSelectedMember(null);
    } catch (err) {
      console.error("Error saving member:", err);
      alert("فشل في حفظ بيانات العضو");
    }
  };

  const getPriceForDuration = (duration: string): number => {
    switch (duration) {
      case "monthly":
        return pricingSettings.monthly;
      case "quarterly":
        return pricingSettings.quarterly;
      case "yearly":
        return pricingSettings.yearly;
      default:
        return 0;
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

  if (isFormOpen) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gradient">
              {selectedCar ? "تعديل السيارة" : "إضافة سيارة جديدة"}
            </h1>
            <Button
              variant="outline"
              onClick={() => {
                setIsFormOpen(false);
                setSelectedCar(null);
              }}
            >
              إلغاء
            </Button>
          </div>
          <CarForm
            car={selectedCar}
            onSave={handleSaveCar}
            onCancel={() => {
              setIsFormOpen(false);
              setSelectedCar(null);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-gradient">
                لوحة تحكم الإدارة
              </h1>
              <nav className="hidden md:flex items-center space-x-6 space-x-reverse">
                <a
                  href="/"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  العودة للموقع
                </a>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={fetchCars}
                className="flex items-center gap-2 luxury-card"
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                تحديث
              </Button>
              <Button
                onClick={handleAddCar}
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <Plus className="h-4 w-4" />
                إضافة سيارة جديدة
              </Button>
              <Button
                variant="destructive"
                onClick={onLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-center">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="luxury-card p-8 rounded-xl text-center animate-fade-in">
              <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <span className="text-lg font-medium">
                جاري تحميل البيانات...
              </span>
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
              <TabsTrigger value="cars">إدارة السيارات</TabsTrigger>
              <TabsTrigger value="members">إدارة الأعضاء</TabsTrigger>
              <TabsTrigger value="telecom">روابط الاتصالات</TabsTrigger>
              <TabsTrigger value="analytics">الإحصائيات</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="luxury-card card-hover">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      إجمالي السيارات
                    </CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{cars.length}</div>
                    <p className="text-xs text-muted-foreground">
                      السيارات المتاحة في المخزون
                    </p>
                  </CardContent>
                </Card>

                <Card className="luxury-card card-hover">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      متوسط السعر
                    </CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatPrice(
                        cars.reduce((sum, car) => sum + car.price, 0) /
                          cars.length || 0,
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      متوسط أسعار السيارات
                    </p>
                  </CardContent>
                </Card>

                <Card className="luxury-card card-hover">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      أحدث إضافة
                    </CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">اليوم</div>
                    <p className="text-xs text-muted-foreground">
                      آخر سيارة تم إضافتها
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="luxury-card">
                <CardHeader>
                  <CardTitle>السيارات المضافة حديثاً</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cars.slice(0, 3).map((car) => (
                      <div
                        key={car.id}
                        className="luxury-card rounded-lg p-4 card-hover animate-fade-in"
                      >
                        <img
                          src={car.image}
                          alt={`${car.make} ${car.model}`}
                          className="w-full h-32 object-cover rounded-md mb-2"
                        />
                        <h3 className="font-medium">
                          {car.make} {car.model}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {car.year}
                        </p>
                        <p className="font-bold text-gradient">
                          {formatPrice(car.price)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cars" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gradient">
                  إدارة السيارات
                </h2>
                <Button
                  onClick={handleAddCar}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  <Plus className="h-4 w-4" />
                  إضافة سيارة جديدة
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars.map((car) => (
                  <div key={car.id} className="relative">
                    <CarCard
                      key={car.id}
                      id={car.id}
                      make={car.make}
                      model={car.model}
                      year={car.year}
                      price={car.price}
                      monthlyPayment={car.monthly_payment}
                      image={car.image}
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 bg-white/90 hover:bg-white"
                        onClick={() => handleEditCar(car)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8"
                        onClick={() => handleDeleteCar(car.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="members" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gradient">
                  إدارة الأعضاء
                </h2>
                <Button
                  onClick={fetchMembers}
                  variant="outline"
                  className="flex items-center gap-2 luxury-card"
                >
                  <RefreshCw className="h-4 w-4" />
                  تحديث
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {members.map((member) => (
                  <Card
                    key={member.id}
                    className="luxury-card card-hover animate-fade-in"
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="text-gradient">{member.name}</span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditMember(member)}
                            className="flex items-center gap-2 luxury-card"
                          >
                            <Edit className="h-4 w-4" />
                            تعديل
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteMember(member.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium">
                            البريد الإلكتروني:
                          </span>{" "}
                          {member.email}
                        </p>
                        <p>
                          <span className="font-medium">الهاتف:</span>{" "}
                          {member.phone}
                        </p>
                        <p>
                          <span className="font-medium">نوع العضوية:</span>{" "}
                          {member.membership_type}
                        </p>
                        {member.membership_duration && (
                          <p>
                            <span className="font-medium">المدة:</span>{" "}
                            {member.membership_duration}
                          </p>
                        )}
                        {member.subscription_price && (
                          <p className="font-bold text-gradient">
                            السعر: {formatPrice(member.subscription_price)}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Member Edit Dialog */}
              {isMemberFormOpen && selectedMember && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 luxury-card">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gradient">
                        تعديل بيانات العضو
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsMemberFormOpen(false);
                          setSelectedMember(null);
                        }}
                      >
                        إغلاق
                      </Button>
                    </div>

                    <MemberEditForm
                      member={selectedMember}
                      onSave={handleSaveMember}
                      onCancel={() => {
                        setIsMemberFormOpen(false);
                        setSelectedMember(null);
                      }}
                      getPriceForDuration={getPriceForDuration}
                      formatPrice={formatPrice}
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="telecom" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gradient">
                  إدارة روابط شركات الاتصالات
                </h2>
                <Button
                  onClick={fetchTelecomLinks}
                  variant="outline"
                  className="flex items-center gap-2 luxury-card"
                >
                  <RefreshCw className="h-4 w-4" />
                  تحديث
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {telecomLinks.length > 0 ? (
                  telecomLinks.map((link) => (
                    <Card
                      key={link.id}
                      className="luxury-card card-hover animate-fade-in"
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="text-gradient">{link.name}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingLink(link)}
                            className="flex items-center gap-2 luxury-card"
                          >
                            <Edit className="h-4 w-4" />
                            تعديل
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {editingLink?.id === link.id ? (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                الرابط الجديد
                              </label>
                              <input
                                type="url"
                                defaultValue={link.url}
                                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                                placeholder="https://example.com"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    const target = e.target as HTMLInputElement;
                                    handleUpdateTelecomLink(
                                      link.id,
                                      target.value,
                                    );
                                  }
                                }}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  const input =
                                    e.currentTarget.parentElement?.parentElement?.querySelector(
                                      "input",
                                    ) as HTMLInputElement;
                                  if (input) {
                                    handleUpdateTelecomLink(
                                      link.id,
                                      input.value,
                                    );
                                  }
                                }}
                                className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                              >
                                <Save className="h-4 w-4" />
                                حفظ
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingLink(null)}
                                className="luxury-card"
                              >
                                إلغاء
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              الرابط الحالي:
                            </p>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline break-all inline-flex items-center gap-2"
                            >
                              <Globe className="h-4 w-4" />
                              {link.url}
                            </a>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      لا توجد روابط اتصالات في قاعدة البيانات
                    </p>
                    <p className="text-sm text-muted-foreground">
                      سيتم عرض الروابط الافتراضية على الموقع
                    </p>
                  </div>
                )}
              </div>

              <Card className="luxury-card">
                <CardHeader>
                  <CardTitle>معلومات مهمة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• يتم تحديث الروابط على الموقع فوراً بعد الحفظ</p>
                    <p>• تأكد من صحة الروابط قبل الحفظ</p>
                    <p>• يجب أن تبدأ الروابط بـ https:// أو http://</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="luxury-card">
                  <CardHeader>
                    <CardTitle className="text-gradient">
                      توزيع الماركات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Array.from(new Set(cars.map((car) => car.make))).map(
                        (make) => {
                          const count = cars.filter(
                            (car) => car.make === make,
                          ).length;
                          const percentage = (count / cars.length) * 100;
                          return (
                            <div
                              key={make}
                              className="flex justify-between items-center"
                            >
                              <span>{make}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary rounded-full"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {count}
                                </span>
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="luxury-card">
                  <CardHeader>
                    <CardTitle className="text-gradient">
                      نطاقات الأسعار
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[
                        { range: "أقل من 3 مليون", min: 0, max: 3000000 },
                        { range: "3-5 مليون", min: 3000000, max: 5000000 },
                        {
                          range: "أكثر من 5 مليون",
                          min: 5000000,
                          max: Infinity,
                        },
                      ].map(({ range, min, max }) => {
                        const count = cars.filter(
                          (car) => car.price >= min && car.price < max,
                        ).length;
                        const percentage = (count / cars.length) * 100;
                        return (
                          <div
                            key={range}
                            className="flex justify-between items-center"
                          >
                            <span>{range}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-accent rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {count}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

// Member Edit Form Component
interface MemberEditFormProps {
  member: Member;
  onSave: (memberData: Partial<Member>) => void;
  onCancel: () => void;
  getPriceForDuration: (duration: string) => number;
  formatPrice: (amount: number) => string;
}

const MemberEditForm: React.FC<MemberEditFormProps> = ({
  member,
  onSave,
  onCancel,
  getPriceForDuration,
  formatPrice,
}) => {
  const [formData, setFormData] = useState({
    name: member.name || "",
    email: member.email || "",
    phone: member.phone || "",
    membership_type: member.membership_type || "",
    membership_duration: member.membership_duration || "",
  });

  const [selectedDuration, setSelectedDuration] = useState(
    member.membership_duration || "",
  );
  const [showSubscriptionType, setShowSubscriptionType] = useState(
    !member.membership_duration,
  );

  const handleDurationChange = (duration: string) => {
    setSelectedDuration(duration);
    setShowSubscriptionType(!duration); // Hide subscription type when duration is selected
    setFormData((prev) => ({
      ...prev,
      membership_duration: duration,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subscriptionPrice = selectedDuration
      ? getPriceForDuration(selectedDuration)
      : undefined;

    onSave({
      ...formData,
      subscription_price: subscriptionPrice,
    });
  };

  const durationOptions = [
    { value: "monthly", label: "شهري" },
    { value: "quarterly", label: "ربع سنوي" },
    { value: "yearly", label: "سنوي" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">
          الاسم
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
          placeholder="اسم العضو"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">
          البريد الإلكتروني
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
          className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
          placeholder="البريد الإلكتروني"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">
          رقم الهاتف
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, phone: e.target.value }))
          }
          className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
          placeholder="رقم الهاتف"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">
          مدة العضوية
        </label>
        <select
          value={selectedDuration}
          onChange={(e) => handleDurationChange(e.target.value)}
          className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
        >
          <option value="">اختر المدة</option>
          {durationOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Show subscription type only when no duration is selected */}
      {showSubscriptionType && (
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">
            نوع الاشتراك
          </label>
          <input
            type="text"
            value={formData.membership_type}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                membership_type: e.target.value,
              }))
            }
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
            placeholder="نوع الاشتراك"
          />
        </div>
      )}

      {/* Show subscription price when duration is selected */}
      {selectedDuration && (
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              سعر الاشتراك:
            </span>
            <span className="text-lg font-bold text-gradient">
              {formatPrice(getPriceForDuration(selectedDuration))}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            السعر محدد من صفحة الإعدادات
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
        >
          <Save className="h-4 w-4 mr-2" />
          حفظ التغييرات
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 luxury-card"
        >
          إلغاء
        </Button>
      </div>
    </form>
  );
};

export default AdminDashboard;
