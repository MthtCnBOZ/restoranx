import LoginForm from "@/components/client/LoginForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">RestoranX</h2>
          <p className="mt-2 text-sm text-gray-600">
            Hesabınıza giriş yapın
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Giriş</CardTitle>
            <CardDescription>E-posta ve şifrenizle giriş yapın</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" asChild>
              <Link href="/">Ana sayfaya dön</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/kayit">Hesap oluştur</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 