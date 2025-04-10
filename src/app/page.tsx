import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8 md:py-12 bg-slate-50">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 md:mb-6">
          RestoranX Uygulamasına Hoş Geldiniz
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 px-1 md:px-4">
          Restoranlar için özel e-ticaret ve sipariş yönetim sistemi
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 w-full sm:w-auto">
          <Button asChild variant="default" size="lg" className="w-full sm:w-auto">
            <Link href="/admin">Yönetim Paneli</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="/menu">Menüyü Görüntüle</Link>
          </Button>
        </div>
      </main>
      <footer className="w-full py-4 border-t border-gray-200 text-center text-sm md:text-base text-gray-500">
        © {new Date().getFullYear()} RestoranX. Tüm hakları saklıdır.
      </footer>
    </div>
  );
}
