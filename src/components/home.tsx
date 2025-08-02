import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronDown, Heart, User, Globe, Menu } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Slider } from "./ui/slider";
import CarListingGrid from "./CarListingGrid";
import CarCard from "./CarCard";

interface TelecomLink {
  id: string;
  name: string;
  url: string;
}

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

const Home = () => {
  const [telecomLinks, setTelecomLinks] = useState<TelecomLink[]>([]);
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);

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
    }
  };

  // Fetch featured cars from database
  const fetchFeaturedCars = async () => {
    try {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      setFeaturedCars(data || []);
    } catch (err) {
      console.error("Error fetching featured cars:", err);
    }
  };

  useEffect(() => {
    fetchTelecomLinks();
    fetchFeaturedCars();

    // Set up real-time subscription for telecom links
    const telecomSubscription = supabase
      .channel("home-telecom-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "telecom_links" },
        (payload) => {
          console.log("Telecom links updated on home page:", payload);
          fetchTelecomLinks(); // Refresh telecom links data immediately
        },
      )
      .subscribe();

    // Set up real-time subscription for cars
    const carsSubscription = supabase
      .channel("home-cars-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cars" },
        (payload) => {
          console.log("Cars updated on home page:", payload);
          fetchFeaturedCars(); // Refresh cars data immediately
        },
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(telecomSubscription);
      supabase.removeChannel(carsSubscription);
    };
  }, []);

  const getTelecomLink = (name: string) => {
    const link = telecomLinks.find(
      (link) => link.name.toLowerCase() === name.toLowerCase(),
    );
    return link?.url || `https://${name.toLowerCase()}.dz`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navigation */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-bold text-gradient">
              تمويل السيارات
            </Link>
            <nav className="hidden md:flex items-center space-x-6 space-x-reverse">
              <Link
                to="/cars"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                تصفح السيارات
              </Link>
              <Link
                to="/financing"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                خيارات التمويل
              </Link>
              <Link
                to="/about"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                من نحن
              </Link>
              <Link
                to="/contact"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                اتصل بنا
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Globe className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Heart className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              className="hidden md:flex gap-2 luxury-card"
              onClick={() => (window.location.href = "/admin-login")}
            >
              <User className="h-4 w-4" />
              <span>تسجيل الدخول</span>
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative gradient-bg py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white animate-fade-in">
              اعثر على سيارة أحلامك بأقساط ميسرة
            </h1>
            <p className="text-lg text-white/90 mb-8 animate-fade-in">
              تصفح مجموعتنا الواسعة من المركبات المتاحة مع خيارات تمويل مرنة في
              الجزائر
            </p>
          </div>

          {/* Search and Filter */}
          <div className="max-w-4xl mx-auto luxury-card rounded-xl p-6 animate-slide-up">
            <Tabs defaultValue="search" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="search">البحث عن السيارات</TabsTrigger>
                <TabsTrigger value="calculator">حاسبة الأقساط</TabsTrigger>
              </TabsList>

              <TabsContent value="search" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="الماركة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="toyota">تويوتا</SelectItem>
                      <SelectItem value="honda">هوندا</SelectItem>
                      <SelectItem value="nissan">نيسان</SelectItem>
                      <SelectItem value="hyundai">هيونداي</SelectItem>
                      <SelectItem value="kia">كيا</SelectItem>
                      <SelectItem value="mercedes">مرسيدس</SelectItem>
                      <SelectItem value="bmw">بي إم دبليو</SelectItem>
                      <SelectItem value="audi">أودي</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="الموديل" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="camry">كامري</SelectItem>
                      <SelectItem value="accord">أكورد</SelectItem>
                      <SelectItem value="altima">التيما</SelectItem>
                      <SelectItem value="elantra">إلنترا</SelectItem>
                      <SelectItem value="cerato">سيراتو</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="نطاق السعر" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-3000000">
                        0 - 3,000,000 د.ج
                      </SelectItem>
                      <SelectItem value="3000000-5000000">
                        3,000,000 - 5,000,000 د.ج
                      </SelectItem>
                      <SelectItem value="5000000-8000000">
                        5,000,000 - 8,000,000 د.ج
                      </SelectItem>
                      <SelectItem value="8000000+">8,000,000+ د.ج</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="مدة التقسيط" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12 شهر</SelectItem>
                      <SelectItem value="24">24 شهر</SelectItem>
                      <SelectItem value="36">36 شهر</SelectItem>
                      <SelectItem value="48">48 شهر</SelectItem>
                      <SelectItem value="60">60 شهر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex">
                  <Button className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                    البحث عن السيارات
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="calculator" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      سعر المركبة
                    </label>
                    <Input
                      type="number"
                      placeholder="أدخل سعر المركبة"
                      defaultValue="3500000"
                      className="text-right"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium">
                        الدفعة المقدمة: 20%
                      </label>
                      <span className="text-sm">700,000 د.ج</span>
                    </div>
                    <Slider defaultValue={[20]} max={50} step={5} />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium">
                        مدة التقسيط: 36 شهر
                      </label>
                    </div>
                    <Slider defaultValue={[36]} min={12} max={60} step={12} />
                  </div>

                  <div className="luxury-card p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">الدفع الشهري:</span>
                      <span className="font-bold text-accent">48,000 د.ج</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>إجمالي الفوائد:</span>
                      <span>280,000 د.ج</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>التكلفة الإجمالية:</span>
                      <span>3,780,000 د.ج</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Best Selling Fiat Cars Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-4">
              السيارات الأكثر مبيعاً في الجزائر - فيات
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              اكتشف مجموعة فيات المتميزة والأكثر طلباً في السوق الجزائري
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {featuredCars.length > 0 ? (
              featuredCars
                .slice(0, 6)
                .map((car) => (
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
                ))
            ) : (
              // Fallback static cars if no database cars available
              <>
                <CarCard
                  id="fiat-1"
                  make="فيات"
                  model="بونتو"
                  year={2024}
                  price={2800000}
                  monthlyPayment={38000}
                  image="https://images.unsplash.com/photo-1494905998402-395d579af36f?w=800&q=80"
                />
                <CarCard
                  id="fiat-2"
                  make="فيات"
                  model="تيبو"
                  year={2024}
                  price={3200000}
                  monthlyPayment={44000}
                  image="https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80"
                />
                <CarCard
                  id="fiat-3"
                  make="فيات"
                  model="500"
                  year={2024}
                  price={2500000}
                  monthlyPayment={35000}
                  image="https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80"
                />
                <CarCard
                  id="fiat-4"
                  make="فيات"
                  model="دوبلو"
                  year={2024}
                  price={3500000}
                  monthlyPayment={48000}
                  image="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80"
                />
                <CarCard
                  id="fiat-5"
                  make="فيات"
                  model="باندا"
                  year={2024}
                  price={2300000}
                  monthlyPayment={32000}
                  image="https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80"
                />
                <CarCard
                  id="fiat-6"
                  make="فيات"
                  model="كرومة"
                  year={2024}
                  price={4200000}
                  monthlyPayment={58000}
                  image="https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80"
                />
              </>
            )}
          </div>

          <div className="text-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
            >
              عرض جميع سيارات فيات
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Cars Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gradient">
              المركبات المميزة
            </h2>
            <Link
              to="/cars"
              className="text-primary hover:underline flex items-center transition-colors"
            >
              عرض الكل <ChevronDown className="h-4 w-4 mr-1 rotate-90" />
            </Link>
          </div>

          <CarListingGrid />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gradient-to-br from-luxury-50 to-luxury-100">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gradient">
            كيف يعمل التمويل
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="luxury-card p-6 rounded-xl text-center animate-fade-in">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">تصفح واختر</h3>
              <p className="text-muted-foreground">
                استكشف مجموعتنا الواسعة من المركبات واعثر على المطابقة المثالية
                لاحتياجاتك وميزانيتك.
              </p>
            </div>

            <div className="luxury-card p-6 rounded-xl text-center animate-fade-in">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
                  <path d="M18 12H9"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">اختر خطتك</h3>
              <p className="text-muted-foreground">
                اختر خطة تمويل تناسب ميزانيتك مع خيارات مرنة للدفعة المقدمة ومدة
                التقسيط.
              </p>
            </div>

            <div className="luxury-card p-6 rounded-xl text-center animate-fade-in">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">انطلق بسيارتك</h3>
              <p className="text-muted-foreground">
                أكمل عملية تقديم بسيطة وانطلق بسيارتك الجديدة مع أقساط شهرية
                ميسرة.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gradient">
            ماذا يقول عملاؤنا
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="luxury-card p-6 rounded-xl animate-fade-in">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full overflow-hidden ml-4">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=user1"
                    alt="Customer"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold">أحمد بن علي</h4>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground">
                "كانت عملية التمويل سلسة بشكل لا يصدق. تمكنت من الحصول على سيارة
                أحلامي مع خطة دفع تناسب ميزانيتي تماماً."
              </p>
            </div>

            <div className="luxury-card p-6 rounded-xl animate-fade-in">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full overflow-hidden ml-4">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=user2"
                    alt="Customer"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold">فاطمة الزهراء</h4>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground">
                "أعجبت بتنوع السيارات المتاحة وبشفافية شروط التمويل. لا توجد
                رسوم مخفية أو مفاجآت!"
              </p>
            </div>

            <div className="luxury-card p-6 rounded-xl animate-fade-in">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full overflow-hidden ml-4">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=user3"
                    alt="Customer"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold">كريم بوضياف</h4>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground">
                "كانت خدمة العملاء استثنائية. ساعدوني في العثور على السيارة
                المثالية وخيار التمويل الذي يناسب احتياجاتي وميزانيتي."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 gradient-bg text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            هل أنت مستعد للعثور على سيارة أحلامك؟
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            تصفح مجموعتنا الواسعة من المركبات واعثر على المطابقة المثالية مع خطط
            أقساط ميسرة.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-primary hover:bg-white/90"
            >
              تصفح السيارات
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-transparent border-white text-white hover:bg-white/10"
            >
              اتصل بنا
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-luxury-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4 text-gradient">
                تمويل السيارات
              </h3>
              <p className="text-luxury-300 mb-4">
                شريكك الموثوق لتمويل السيارات في الجزائر. اعثر على سيارة أحلامك
                مع خطط أقساط ميسرة.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <rect
                      x="2"
                      y="2"
                      width="20"
                      height="20"
                      rx="5"
                      ry="5"
                    ></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">روابط سريعة</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/cars"
                    className="text-luxury-300 hover:text-accent transition-colors"
                  >
                    تصفح السيارات
                  </Link>
                </li>
                <li>
                  <Link
                    to="/financing"
                    className="text-luxury-300 hover:text-accent transition-colors"
                  >
                    خيارات التمويل
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="text-luxury-300 hover:text-accent transition-colors"
                  >
                    من نحن
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-luxury-300 hover:text-accent transition-colors"
                  >
                    اتصل بنا
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">الدعم</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/faq"
                    className="text-luxury-300 hover:text-accent transition-colors"
                  >
                    الأسئلة الشائعة
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-luxury-300 hover:text-accent transition-colors"
                  >
                    الشروط والأحكام
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="text-luxury-300 hover:text-accent transition-colors"
                  >
                    سياسة الخصوصية
                  </Link>
                </li>
                <li>
                  <Link
                    to="/help"
                    className="text-luxury-300 hover:text-accent transition-colors"
                  >
                    مركز المساعدة
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">شركات الاتصالات</h3>
              <ul className="space-y-2">
                {telecomLinks.length > 0 ? (
                  telecomLinks.map((link) => (
                    <li key={link.id}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-luxury-300 hover:text-accent transition-colors flex items-center gap-2"
                      >
                        <Globe className="h-4 w-4" />
                        {link.name}
                      </a>
                    </li>
                  ))
                ) : (
                  // Default telecom links if database is empty
                  <>
                    <li>
                      <a
                        href="https://www.djezzy.dz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-luxury-300 hover:text-accent transition-colors flex items-center gap-2"
                      >
                        <Globe className="h-4 w-4" />
                        دجيزي
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.ooredoo.dz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-luxury-300 hover:text-accent transition-colors flex items-center gap-2"
                      >
                        <Globe className="h-4 w-4" />
                        أوريدو
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.mobilis.dz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-luxury-300 hover:text-accent transition-colors flex items-center gap-2"
                      >
                        <Globe className="h-4 w-4" />
                        موبيليس
                      </a>
                    </li>
                  </>
                )}
              </ul>

              <div className="mt-6">
                <h4 className="text-md font-semibold mb-3">اتصل بنا</h4>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2 mt-0.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>123 Finance Street, Algiers, Algeria</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <span>+213 123 456 789</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    <span>info@autofinance.dz</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t mt-12 pt-8 text-center text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} AutoFinance. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
