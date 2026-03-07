import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import { Loader2, Save } from "lucide-react";
import type { LoyaltySettings } from "@shared/schema";
import { useEffect } from "react";

export default function LoyaltyAdmin() {
  const { toast } = useToast();
  const { lang } = useI18n();

  const { data: settings, isLoading } = useQuery<LoyaltySettings>({
    queryKey: ["/api/admin/loyalty-settings"],
  });

  const form = useForm<LoyaltySettings>({
    defaultValues: {
      beginner: { minBookings: 0, discount: 0 },
      traveler: { minBookings: 3, discount: 10, discountCount: 2 },
      premium: { minBookings: 6, discount: 5 },
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  const mutation = useMutation({
    mutationFn: async (values: LoyaltySettings) => {
      const res = await apiRequest("PUT", "/api/admin/loyalty-settings", values);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/loyalty-settings"] });
      toast({
        title: lang === "ru" ? "Успешно" : "Success",
        description: lang === "ru" ? "Настройки сохранены" : "Settings saved successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: lang === "ru" ? "Ошибка" : "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <AdminLayout title={lang === "ru" ? "Программа лояльности" : "Loyalty Program"}>
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={lang === "ru" ? "Программа лояльности" : "Loyalty Program"}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Beginner */}
            <Card className="hover-elevate">
              <CardHeader>
                <CardTitle className="text-lg">
                  {lang === "ru" ? "Новичок" : "Beginner"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{lang === "ru" ? "Мин. бронирований" : "Min Bookings"}</Label>
                  <Input value="0" disabled data-testid="input-beginner-min-bookings" />
                </div>
                <FormField
                  control={form.control}
                  name="beginner.discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{lang === "ru" ? "Скидка (%)" : "Discount (%)"}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-beginner-discount"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Traveler */}
            <Card className="hover-elevate">
              <CardHeader>
                <CardTitle className="text-lg">
                  {lang === "ru" ? "Путешественник" : "Traveler"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="traveler.minBookings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{lang === "ru" ? "Мин. бронирований" : "Min Bookings"}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-traveler-min-bookings"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="traveler.discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{lang === "ru" ? "Скидка (%)" : "Discount (%)"}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-traveler-discount"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="traveler.discountCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{lang === "ru" ? "Кол-во скидок" : "Number of Discounts"}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-traveler-discount-count"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Premium */}
            <Card className="hover-elevate">
              <CardHeader>
                <CardTitle className="text-lg">
                  {lang === "ru" ? "Премиум" : "Premium"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="premium.minBookings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{lang === "ru" ? "Мин. бронирований" : "Min Bookings"}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-premium-min-bookings"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="premium.discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{lang === "ru" ? "Постоянная скидка (%)" : "Permanent Discount (%)"}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-premium-discount"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={mutation.isPending}
              data-testid="button-save-loyalty"
            >
              {mutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {lang === "ru" ? "Сохранить изменения" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </AdminLayout>
  );
}
