import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, BookOpen, DollarSign, Wallet } from "lucide-react";
import type { AnalyticsData } from "@shared/schema";
import { format, subDays } from "date-fns";

export default function StatisticsAdmin() {
  const { lang, t } = useI18n();
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [paymentType, setPaymentType] = useState("all");
  const [status, setStatus] = useState("all");

  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/admin/analytics", { startDate, endDate, paymentType, status }],
  });

  if (isLoading) {
    return (
      <AdminLayout title={lang === "ru" ? "Статистика" : "Statistics"}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full mt-8" />
      </AdminLayout>
    );
  }

  const summary = [
    {
      title: lang === "ru" ? "Бронирований" : "Bookings",
      value: data?.totalBookings || 0,
      icon: BookOpen,
      testId: "text-summary-bookings",
    },
    {
      title: lang === "ru" ? "Туристов" : "Tourists",
      value: data?.totalTourists || 0,
      icon: Users,
      testId: "text-summary-tourists",
    },
    {
      title: lang === "ru" ? "Оборот" : "Revenue",
      value: `$${(data?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      testId: "text-summary-revenue",
    },
    {
      title: lang === "ru" ? "Предоплаты" : "Prepaid",
      value: `$${(data?.prepaidRevenue || 0).toLocaleString()}`,
      icon: Wallet,
      testId: "text-summary-prepaid",
    },
  ];

  return (
    <AdminLayout title={lang === "ru" ? "Статистика" : "Statistics"}>
      <div className="flex flex-col gap-6">
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{lang === "ru" ? "От" : "From"}</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                data-testid="input-start-date"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{lang === "ru" ? "До" : "To"}</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                data-testid="input-end-date"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{lang === "ru" ? "Тип оплаты" : "Payment Type"}</label>
              <Select value={paymentType} onValueChange={setPaymentType}>
                <SelectTrigger data-testid="select-payment-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{lang === "ru" ? "Все" : "All"}</SelectItem>
                  <SelectItem value="prepay">{lang === "ru" ? "Предоплата" : "Prepay"}</SelectItem>
                  <SelectItem value="full">{lang === "ru" ? "Полная" : "Full"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{lang === "ru" ? "Статус" : "Status"}</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger data-testid="select-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{lang === "ru" ? "Все" : "All"}</SelectItem>
                  <SelectItem value="new">{lang === "ru" ? "Новый" : "New"}</SelectItem>
                  <SelectItem value="prepaid">{lang === "ru" ? "Внесена предоплата" : "Prepaid"}</SelectItem>
                  <SelectItem value="paid">{lang === "ru" ? "Оплачен" : "Paid"}</SelectItem>
                  <SelectItem value="cancelled">{lang === "ru" ? "Отменен" : "Cancelled"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {summary.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title}>
                <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {item.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid={item.testId}>
                    {item.value}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{lang === "ru" ? "Динамика выручки" : "Revenue Dynamics"}</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.revenueByDay || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => format(new Date(val), "dd.MM")}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(val) => format(new Date(val as string), "dd MMMM yyyy")}
                  formatter={(val: number) => [`$${val.toLocaleString()}`, lang === "ru" ? "Выручка" : "Revenue"]}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{lang === "ru" ? "Топ туров" : "Top Tours"}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{lang === "ru" ? "Тур" : "Tour"}</TableHead>
                    <TableHead className="text-right">{lang === "ru" ? "Брони" : "Bookings"}</TableHead>
                    <TableHead className="text-right">{lang === "ru" ? "Туристы" : "Tourists"}</TableHead>
                    <TableHead className="text-right">{lang === "ru" ? "Выручка" : "Revenue"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.topTours.map((tour: any) => (
                    <TableRow key={tour.tourId}>
                      <TableCell className="font-medium">
                        {lang === "ru" ? tour.titleRu : tour.titleEn}
                      </TableCell>
                      <TableCell className="text-right">{tour.bookings}</TableCell>
                      <TableCell className="text-right">{tour.tourists}</TableCell>
                      <TableCell className="text-right">${tour.revenue.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {(!data?.topTours || data.topTours.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        {lang === "ru" ? "Нет данных" : "No data"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{lang === "ru" ? "Топ стран" : "Top Countries"}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{lang === "ru" ? "Страна" : "Country"}</TableHead>
                    <TableHead className="text-right">{lang === "ru" ? "Туристы" : "Tourists"}</TableHead>
                    <TableHead className="text-right">{lang === "ru" ? "Выручка" : "Revenue"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.topCountries.map((country: any) => (
                    <TableRow key={country.countryId}>
                      <TableCell className="font-medium">
                        {lang === "ru" ? country.nameRu : country.nameEn}
                      </TableCell>
                      <TableCell className="text-right">{country.tourists}</TableCell>
                      <TableCell className="text-right">${country.revenue.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {(!data?.topCountries || data.topCountries.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                        {lang === "ru" ? "Нет данных" : "No data"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
