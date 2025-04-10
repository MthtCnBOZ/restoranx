import RegisterForm from "@/components/client/RegisterForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">RestoranX</h2>
          <p className="mt-2 text-sm text-gray-600">
            Yeni hesap oluşturun
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Kayıt Ol</CardTitle>
            <CardDescription>Bilgilerinizi doldurun ve hesap oluşturun</CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" asChild>
              <Link href="/">Ana sayfaya dön</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/giris">Giriş yap</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 