import React, { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
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

interface CarListingGridProps {
  cars?: Car[];
}

const CarListingGrid = ({ cars = [] }: CarListingGridProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [selectedMakes, setSelectedMakes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dbCars, setDbCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch cars from database
  const fetchCars = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDbCars(data || []);
    } catch (err) {
      console.error("Error fetching cars:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();

    // Set up real-time subscription for cars
    const carsSubscription = supabase
      .channel("cars-listing-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cars" },
        (payload) => {
          console.log("Cars updated on listing page:", payload);
          fetchCars(); // Refresh cars data immediately
        },
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(carsSubscription);
    };
  }, []);

  // Use database cars first, then fallback to props, then default data
  const defaultCars: Car[] =
    dbCars.length > 0
      ? dbCars
      : cars.length > 0
        ? cars
        : [
            {
              id: "1",
              make: "تويوتا",
              model: "كامري",
              year: 2024,
              price: 4200000,
              monthly_payment: 58000,
              image:
                "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80",
              mileage: 0,
              transmission: "أوتوماتيك",
              fuel_type: "بنزين",
            },
            {
              id: "2",
              make: "هوندا",
              model: "أكورد",
              year: 2024,
              price: 3800000,
              monthly_payment: 52000,
              image:
                "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
              mileage: 0,
              transmission: "أوتوماتيك",
              fuel_type: "بنزين",
            },
            {
              id: "3",
              make: "نيسان",
              model: "التيما",
              year: 2024,
              price: 3500000,
              monthly_payment: 48000,
              image:
                "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80",
              mileage: 0,
              transmission: "أوتوماتيك",
              fuel_type: "بنزين",
            },
            {
              id: "4",
              make: "هيونداي",
              model: "إلنترا",
              year: 2024,
              price: 3200000,
              monthly_payment: 44000,
              image:
                "https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800&q=80",
              mileage: 0,
              transmission: "أوتوماتيك",
              fuel_type: "بنزين",
            },
            {
              id: "5",
              make: "كيا",
              model: "سيراتو",
              year: 2024,
              price: 2900000,
              monthly_payment: 40000,
              image:
                "https://images.unsplash.com/photo-1619767886558-efdc4e4c4c66?w=800&q=80",
              mileage: 0,
              transmission: "أوتوماتيك",
              fuel_type: "بنزين",
            },
            {
              id: "6",
              make: "مرسيدس",
              model: "C-Class",
              year: 2024,
              price: 8500000,
              monthly_payment: 118000,
              image:
                "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80",
              mileage: 0,
              transmission: "أوتوماتيك",
              fuel_type: "بنزين",
            },
            {
              id: "7",
              make: "بي إم دبليو",
              model: "320i",
              year: 2024,
              price: 7800000,
              monthly_payment: 108000,
              image:
                "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
              mileage: 0,
              transmission: "أوتوماتيك",
              fuel_type: "بنزين",
            },
            {
              id: "8",
              make: "أودي",
              model: "A4",
              year: 2024,
              price: 7200000,
              monthly_payment: 100000,
              image:
                "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80",
              mileage: 0,
              transmission: "أوتوماتيك",
              fuel_type: "بنزين",
            },
            {
              id: "9",
              make: "فولكس واجن",
              model: "جيتا",
              year: 2024,
              price: 3600000,
              monthly_payment: 50000,
              image:
                "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80",
              mileage: 0,
              transmission: "أوتوماتيك",
              fuel_type: "بنزين",
            },
            {
              id: "10",
              make: "شيفروليه",
              model: "كروز",
              year: 2024,
              price: 3100000,
              monthly_payment: 43000,
              image:
                "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
              mileage: 0,
              transmission: "أوتوماتيك",
              fuel_type: "بنزين",
            },
            {
              id: "11",
              make: "فورد",
              model: "فوكس",
              year: 2024,
              price: 2800000,
              monthly_payment: 39000,
              image:
                "https://images.unsplash.com/photo-1494905998402-395d579af36f?w=800&q=80",
              mileage: 0,
              transmission: "أوتوماتيك",
              fuel_type: "بنزين",
            },
            {
              id: "12",
              make: "رينو",
              model: "ميجان",
              year: 2024,
              price: 2600000,
              monthly_payment: 36000,
              image:
                "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80",
              mileage: 0,
              transmission: "يدوي",
              fuel_type: "بنزين",
            },
            {
              id: "13",
              make: "بيجو",
              model: "308",
              year: 2024,
              price: 2700000,
              monthly_payment: 37000,
              image:
                "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80",
              mileage: 0,
              transmission: "أوتوماتيك",
              fuel_type: "بنزين",
            },
            {
              id: "14",
              make: "سيات",
              model: "ليون",
              year: 2024,
              price: 3000000,
              monthly_payment: 42000,
              image:
                "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80",
              mileage: 0,
              transmission: "أوتوماتيك",
              fuel_type: "بنزين",
            },
            {
              id: "15",
              make: "سكودا",
              model: "أوكتافيا",
              year: 2024,
              price: 3300000,
              monthly_payment: 46000,
              image:
                "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80",
              mileage: 0,
              transmission: "أوتوماتيك",
              fuel_type: "بنزين",
            },
            {
              id: "16",
              make: "مازدا",
              model: "6",
              year: 2024,
              price: 3700000,
              monthly_payment: 51000,
              image:
                "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80",
              mileage: 0,
              transmission: "أوتوماتيك",
              fuel_type: "بنزين",
            },
            {
              id: "17",
              make: "سوبارو",
              model: "إمبريزا",
              year: 2024,
              price: 3400000,
              monthly_payment: 47000,
              image:
                "https://images.unsplash.com/photo-1606016159991-8b5d5f8e7e8e?w=800&q=80",
              mileage: 0,
              transmission: "أوتوماتيك",
              fuel_type: "بنزين",
            },
            {
              id: "18",
              make: "ميتسوبيشي",
              model: "لانسر",
              year: 2024,
              price: 2900000,
              monthly_payment: 40000,
              image:
                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
              mileage: 0,
              transmission: "أوتوماتيك",
              fuel_type: "بنزين",
            },
          ];

  // Get unique makes for filter
  const makes = Array.from(new Set(defaultCars.map((car) => car.make)));

  const toggleMake = (make: string) => {
    if (selectedMakes.includes(make)) {
      setSelectedMakes(selectedMakes.filter((m) => m !== make));
    } else {
      setSelectedMakes([...selectedMakes, make]);
    }
  };

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " DA";
  };

  const filteredCars = defaultCars.filter((car) => {
    const matchesPrice =
      car.price >= priceRange[0] && car.price <= priceRange[1];
    const matchesMake =
      selectedMakes.length === 0 || selectedMakes.includes(car.make);
    const matchesSearch =
      searchQuery === "" ||
      car.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.model.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesPrice && matchesMake && matchesSearch;
  });

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  return (
    <div className="bg-background w-full max-w-7xl mx-auto mobile-container">
      <div className="flex flex-col md:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex-1 relative">
          <Input
            placeholder="ابحث عن الماركة أو الموديل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-right mobile-input"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        </div>
        <Button
          variant="outline"
          className="mobile-filter-toggle flex items-center gap-2 luxury-card mobile-button"
          onClick={toggleFilter}
        >
          <SlidersHorizontal className="h-4 w-4" />
          فلاتر
          {isFilterOpen && <X className="h-4 w-4 mr-2" />}
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Filter sidebar */}
        {isFilterOpen && (
          <div className="mobile-filter-sidebar luxury-card rounded-lg p-3 sm:p-4 h-fit">
            <h3 className="font-medium text-base sm:text-lg mb-3 sm:mb-4">
              الفلاتر
            </h3>

            <div className="space-y-4 sm:space-y-6">
              {/* Price Range Filter */}
              <div>
                <h4 className="font-medium mb-2">نطاق السعر</h4>
                <div className="mb-6">
                  <Slider
                    defaultValue={[priceRange[0], priceRange[1]]}
                    max={10000000}
                    step={100000}
                    onValueChange={(value) =>
                      setPriceRange(value as [number, number])
                    }
                    className="my-4"
                  />
                  <div className="flex justify-between text-sm">
                    <span>{formatPrice(priceRange[0])}</span>
                    <span>{formatPrice(priceRange[1])}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Make Filter */}
              <div>
                <h4 className="font-medium mb-2">الماركة</h4>
                <div className="space-y-2">
                  {makes.map((make) => (
                    <div key={make} className="flex items-center space-x-2">
                      <Checkbox
                        id={`make-${make}`}
                        checked={selectedMakes.includes(make)}
                        onCheckedChange={() => toggleMake(make)}
                      />
                      <Label htmlFor={`make-${make}`}>{make}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Year Filter */}
              <div>
                <h4 className="font-medium mb-2">السنة</h4>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="أي سنة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">أي سنة</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                    <SelectItem value="2021">2021</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Transmission Filter */}
              <div>
                <h4 className="font-medium mb-2">ناقل الحركة</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox id="transmission-auto" />
                    <Label htmlFor="transmission-auto">أوتوماتيك</Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox id="transmission-manual" />
                    <Label htmlFor="transmission-manual">يدوي</Label>
                  </div>
                </div>
              </div>

              <Button className="w-full mobile-button bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                تطبيق الفلاتر
              </Button>
            </div>
          </div>
        )}

        {/* Car grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="text-center py-8 sm:py-12 luxury-card rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto mb-3 sm:mb-4"></div>
              <h3 className="text-lg sm:text-xl font-medium">
                جاري تحميل السيارات...
              </h3>
            </div>
          ) : filteredCars.length === 0 ? (
            <div className="text-center py-8 sm:py-12 luxury-card rounded-lg">
              <h3 className="text-lg sm:text-xl font-medium">
                لم يتم العثور على سيارات
              </h3>
              <p className="text-muted-foreground mt-2">جرب تعديل الفلاتر</p>
            </div>
          ) : (
            <div className="mobile-grid">
              {filteredCars.map((car) => (
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarListingGrid;
