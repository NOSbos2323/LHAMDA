import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, User, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onCancel,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // For demo purposes, we'll use a simple check
      // In production, you should use proper authentication
      if (username === "admin" && password === "ADMIN12") {
        localStorage.setItem("adminLoggedIn", "true");
        onLoginSuccess();
      } else {
        setError("اسم المستخدم أو كلمة المرور غير صحيحة");
      }
    } catch (err) {
      setError("حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg luxury-card shadow-2xl">
        <CardHeader className="text-center p-6 sm:p-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
            <Lock className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
          </div>
          <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-gradient">
            تسجيل دخول الإدارة
          </CardTitle>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground mt-3">
            يرجى إدخال بيانات الدخول للوصول إلى لوحة التحكم
          </p>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {error && (
              <Alert variant="destructive" className="text-sm">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-right block text-sm">
                اسم المستخدم
              </Label>
              <div className="relative">
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="text-right pr-12 text-base sm:text-lg py-3 sm:py-4 rounded-lg"
                  dir="ltr"
                  required
                />
                <User className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-right block text-sm">
                كلمة المرور
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="text-right pr-12 pl-12 text-base sm:text-lg py-3 sm:py-4 rounded-lg"
                  required
                />
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 text-base sm:text-lg py-3 sm:py-4 rounded-lg shadow-md hover:shadow-lg"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 text-base sm:text-lg py-3 sm:py-4 rounded-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl"
              >
                {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
