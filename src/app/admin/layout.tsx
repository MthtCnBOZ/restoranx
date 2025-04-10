"use client";

import React from "react";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Menu, X, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Tema butonlarını yalnızca client tarafında render et
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-7xl mx-auto flex h-14 items-center justify-between">
          <div className="flex items-center w-[180px]">
            <Link href="/admin" className="flex items-center space-x-2">
              <span className="font-bold">RestoranX Admin</span>
            </Link>
          </div>

          {/* Mobil menü butonu */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Masaüstü navigasyon */}
          <div className="hidden md:flex md:flex-1 justify-center">
            <Tabs defaultValue="dashboard" className="w-auto">
              <TabsList className="flex flex-wrap justify-center">
                <TabsTrigger value="dashboard" asChild>
                  <Link href="/admin/dashboard">Ana Sayfa</Link>
                </TabsTrigger>
                <TabsTrigger value="categories" asChild>
                  <Link href="/admin/categories">Kategoriler</Link>
                </TabsTrigger>
                <TabsTrigger value="products" asChild>
                  <Link href="/admin/products">Ürünler</Link>
                </TabsTrigger>
                <TabsTrigger value="extras" asChild>
                  <Link href="/admin/extras">Ekstra Malzemeler</Link>
                </TabsTrigger>
                <TabsTrigger value="variations" asChild>
                  <Link href="/admin/variations">Varyasyonlar</Link>
                </TabsTrigger>
                <TabsTrigger value="orders" asChild>
                  <Link href="/admin/orders">Siparişler</Link>
                </TabsTrigger>
                <TabsTrigger value="pages" asChild>
                  <Link href="/admin/pages">Sayfalar</Link>
                </TabsTrigger>
                <TabsTrigger value="slider" asChild>
                  <Link href="/admin/slider">Slider</Link>
                </TabsTrigger>
                <TabsTrigger value="settings" asChild>
                  <Link href="/admin/settings">Ayarlar</Link>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="hidden md:flex md:items-center md:space-x-4 w-[180px] justify-end">
            {mounted && (
              <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Tema Değiştir">
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            )}
            <Link
              href="/"
              className="px-4 py-2 text-sm border rounded-md hover:bg-accent dark:hover:bg-muted"
            >
              Siteye Dön
            </Link>
          </div>
        </div>

        {/* Mobil menü */}
        {isMenuOpen && (
          <div className="md:hidden border-t">
            <div className="container max-w-7xl mx-auto py-3 flex flex-col space-y-3">
              <Link 
                href="/admin/dashboard" 
                className="px-3 py-2 hover:bg-accent rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Ana Sayfa
              </Link>
              <Link 
                href="/admin/categories" 
                className="px-3 py-2 hover:bg-accent rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Kategoriler
              </Link>
              <Link 
                href="/admin/products" 
                className="px-3 py-2 hover:bg-accent rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Ürünler
              </Link>
              <Link 
                href="/admin/extras" 
                className="px-3 py-2 hover:bg-accent rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Ekstra Malzemeler
              </Link>
              <Link 
                href="/admin/variations" 
                className="px-3 py-2 hover:bg-accent rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Varyasyonlar
              </Link>
              <Link 
                href="/admin/orders" 
                className="px-3 py-2 hover:bg-accent rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Siparişler
              </Link>
              <Link 
                href="/admin/pages" 
                className="px-3 py-2 hover:bg-accent rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Sayfalar
              </Link>
              <Link 
                href="/admin/slider" 
                className="px-3 py-2 hover:bg-accent rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Slider
              </Link>
              <Link 
                href="/admin/settings" 
                className="px-3 py-2 hover:bg-accent rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Ayarlar
              </Link>
              <div className="flex items-center justify-between mt-2">
                {mounted && (
                  <Button variant="outline" size="sm" onClick={toggleTheme} className="flex items-center gap-2">
                    {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    {theme === "dark" ? "Açık Tema" : "Koyu Tema"}
                  </Button>
                )}
                <Link
                  href="/"
                  className="px-3 py-2 text-sm border rounded-md hover:bg-accent text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Siteye Dön
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 flex justify-center">
        <div className="container max-w-7xl py-6">{children}</div>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container max-w-7xl mx-auto flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} RestoranX Admin Paneli
          </p>
        </div>
      </footer>
    </div>
  );
} 