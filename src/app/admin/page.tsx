import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { PieChart, ShoppingCart, ListPlus, Settings } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold">Yönetici Paneli</h1>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Link href="/admin/categories" className="block">
          <Card className="hover:shadow-md transition-shadow h-full border-l-4 border-l-blue-500 dark:border-l-blue-400">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg md:text-xl">Kategoriler</CardTitle>
                <PieChart className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              </div>
              <CardDescription>Menü kategorilerini yönetin</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">0</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/admin/products" className="block">
          <Card className="hover:shadow-md transition-shadow h-full border-l-4 border-l-green-500 dark:border-l-green-400">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg md:text-xl">Ürünler</CardTitle>
                <ListPlus className="h-5 w-5 text-green-500 dark:text-green-400" />
              </div>
              <CardDescription>Tüm ürünleri yönetin</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">0</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/admin/orders" className="block">
          <Card className="hover:shadow-md transition-shadow h-full border-l-4 border-l-amber-500 dark:border-l-amber-400">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg md:text-xl">Siparişler</CardTitle>
                <ShoppingCart className="h-5 w-5 text-amber-500 dark:text-amber-400" />
              </div>
              <CardDescription>Siparişleri takip edin</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xl md:text-2xl font-bold text-amber-600 dark:text-amber-400">0</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/admin/settings" className="block">
          <Card className="hover:shadow-md transition-shadow h-full border-l-4 border-l-purple-500 dark:border-l-purple-400">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg md:text-xl">Ayarlar</CardTitle>
                <Settings className="h-5 w-5 text-purple-500 dark:text-purple-400" />
              </div>
              <CardDescription>Site ayarlarını yapılandırın</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Site özelleştirme</p>
            </CardContent>
          </Card>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Card className="bg-card dark:bg-card/70 dark:border-card/80">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Son Siparişler</CardTitle>
            <CardDescription>Son 5 sipariş</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Henüz sipariş yok</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card dark:bg-card/70 dark:border-card/80">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Popüler Ürünler</CardTitle>
            <CardDescription>En çok sipariş edilen ürünler</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Henüz ürün yok</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 