import { useQuery } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n";
import { Globe, BookOpen, Users, DollarSign, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { t } = useI18n();
  const { data: stats, isLoading } = useQuery<any>({ queryKey: ["/api/admin/stats"] });

  const cards = [
    { icon: Globe, label: t("Туры", "Tours"), value: stats?.tours, color: "text-blue-600 bg-blue-50" },
    { icon: BookOpen, label: t("Бронирования", "Bookings"), value: stats?.bookings, color: "text-green-600 bg-green-50" },
    { icon: Users, label: t("Пользователи", "Users"), value: stats?.users, color: "text-purple-600 bg-purple-50" },
    { icon: DollarSign, label: t("Выручка", "Revenue"), value: stats ? `$${Number(stats.revenue).toFixed(0)}` : null, color: "text-yellow-600 bg-yellow-50" },
  ];

  return (
    <AdminLayout title={t("Дашборд", "Dashboard")}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map(({ icon: Icon, label, value, color }) => (
          <Card key={label}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold mt-1">{value ?? 0}</p>
                  )}
                </div>
                <div className={`p-3 rounded-xl ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentBookings />
      </div>
    </AdminLayout>
  );
}

function RecentBookings() {
  const { t, lang } = useI18n();
  const { data: bookings = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/bookings"] });
  const recent = bookings.slice(0, 5);

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-700",
    prepaid: "bg-yellow-100 text-yellow-700",
    paid: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader><CardTitle className="text-base">{t("Последние бронирования", "Recent Bookings")}</CardTitle></CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-40" /> : (
          <div className="space-y-3">
            {recent.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t("Нет бронирований", "No bookings yet")}</p>
            ) : recent.map((b: any) => (
              <div key={b.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium">{lang === "ru" ? b.tour?.titleRu : b.tour?.titleEn}</p>
                  <p className="text-xs text-muted-foreground">${Number(b.totalPrice).toFixed(0)} · {b.adults + b.children} {t("чел.", "pax")}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[b.bookingStatus] || ""}`}>
                  {b.bookingStatus}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
