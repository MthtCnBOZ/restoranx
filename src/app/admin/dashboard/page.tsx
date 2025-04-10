import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Users, LineChart } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-4 md:gap-6 w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="border-l-4 border-l-blue-500 dark:border-l-blue-400">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg md:text-xl">Bugünkü Satışlar</CardTitle>
              <DollarSign className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            </div>
            <CardDescription>Bugün alınan toplam sipariş tutarı</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">₺0</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500 dark:border-l-green-400">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg md:text-xl">Bugünkü Siparişler</CardTitle>
              <ShoppingCart className="h-5 w-5 text-green-500 dark:text-green-400" />
            </div>
            <CardDescription>Bugün alınan sipariş sayısı</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">0</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-amber-500 dark:border-l-amber-400">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg md:text-xl">Toplam Müşteriler</CardTitle>
              <Users className="h-5 w-5 text-amber-500 dark:text-amber-400" />
            </div>
            <CardDescription>Toplam müşteri sayısı</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl md:text-3xl font-bold text-amber-600 dark:text-amber-400">0</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Card className="bg-card dark:bg-card/70 dark:border-card/80">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Son Siparişler</CardTitle>
            <CardDescription>Son 10 sipariş</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Henüz sipariş yok</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card dark:bg-card/70 dark:border-card/80">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg md:text-xl">Aylık Satış Özeti</CardTitle>
                <CardDescription>Son 30 günlük satış istatistikleri</CardDescription>
              </div>
              <LineChart className="h-5 w-5 text-purple-500 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent className="h-[200px] md:h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Henüz veri yok</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 