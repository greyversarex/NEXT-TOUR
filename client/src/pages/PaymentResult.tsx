import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { CheckCircle, XCircle, Clock, ArrowRight, Home, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentResult() {
  const { t } = useI18n();
  const [, navigate] = useLocation();
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setOrderId(params.get("orderId"));
  }, []);

  const { data, isLoading, refetch } = useQuery<any>({
    queryKey: ["/api/payments/order", orderId],
    queryFn: () => fetch(`/api/payments/order/${orderId}`, { credentials: "include" }).then(r => r.json()),
    enabled: !!orderId,
    refetchInterval: (q) => {
      const status = q.state.data?.payment?.status;
      return status === "pending" ? 3000 : false;
    },
  });

  if (!orderId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <XCircle className="h-16 w-16 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">{t("Некорректная ссылка", "Invalid link")}</h1>
          <Button asChild><Link href="/">{t("На главную", "Go Home")}</Link></Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">{t("Проверяем статус оплаты...", "Checking payment status...")}</p>
        </div>
      </div>
    );
  }

  const payment = data?.payment;
  const booking = data?.booking;
  const status = payment?.status || "pending";

  const statusConfig = {
    ok: {
      icon: <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />,
      title: t("Оплата прошла успешно!", "Payment Successful!"),
      desc: t("Ваше бронирование оплачено. Детали отправлены на вашу почту.", "Your booking is paid. Details sent to your email."),
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900",
    },
    failed: {
      icon: <XCircle className="h-20 w-20 text-destructive mx-auto" />,
      title: t("Оплата не прошла", "Payment Failed"),
      desc: t("К сожалению, оплата не была завершена. Попробуйте снова.", "Unfortunately, the payment was not completed. Please try again."),
      color: "text-destructive",
      bg: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900",
    },
    canceled: {
      icon: <XCircle className="h-20 w-20 text-muted-foreground mx-auto" />,
      title: t("Оплата отменена", "Payment Canceled"),
      desc: t("Вы отменили оплату. Бронирование сохранено.", "You canceled the payment. Your booking is saved."),
      color: "text-muted-foreground",
      bg: "bg-muted/30 border-border",
    },
    pending: {
      icon: <Clock className="h-20 w-20 text-amber-500 mx-auto animate-pulse" />,
      title: t("Ожидаем подтверждения...", "Awaiting Confirmation..."),
      desc: t("Платёж обрабатывается. Страница обновится автоматически.", "Payment is being processed. Page will refresh automatically."),
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900",
    },
  }[status] || statusConfig.pending;

  const tourTitle = (booking as any)?.tour?.titleRu;
  const amount = payment?.amount;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className={`rounded-2xl border-2 p-8 text-center space-y-5 ${statusConfig.bg}`}>
          {statusConfig.icon}
          <div>
            <h1 className={`text-2xl font-bold ${statusConfig.color}`}>{statusConfig.title}</h1>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{statusConfig.desc}</p>
          </div>

          {(tourTitle || amount) && (
            <div className="bg-background/60 rounded-xl px-5 py-4 text-left space-y-2 text-sm">
              {tourTitle && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("Тур", "Tour")}</span>
                  <span className="font-medium truncate max-w-[55%] text-right">{tourTitle}</span>
                </div>
              )}
              {amount && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("Сумма", "Amount")}</span>
                  <span className="font-semibold">{Number(amount).toFixed(2)} TJS</span>
                </div>
              )}
              {payment?.orderId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("Заказ", "Order")}</span>
                  <span className="font-mono text-xs opacity-70">{payment.orderId}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button asChild variant="outline" className="flex-1" data-testid="button-go-home">
              <Link href="/">
                <Home className="h-4 w-4 mr-1.5" />
                {t("Главная", "Home")}
              </Link>
            </Button>
            <Button asChild className="flex-1" data-testid="button-my-bookings">
              <Link href="/profile/bookings">
                {t("Мои бронирования", "My Bookings")}
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Link>
            </Button>
          </div>

          {status === "pending" && (
            <button
              onClick={() => refetch()}
              className="text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              {t("Обновить статус", "Refresh status")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
