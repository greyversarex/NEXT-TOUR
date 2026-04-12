import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

const LOYALTY_LABELS: Record<string, { ru: string; en: string; color: string }> = {
  beginner: { ru: "Новичок", en: "Beginner", color: "bg-gray-100 text-gray-700" },
  traveler: { ru: "Путешественник", en: "Traveler", color: "bg-blue-100 text-blue-700" },
  premium: { ru: "Премиум", en: "Premium", color: "bg-yellow-100 text-yellow-700" },
};

export default function UsersAdmin() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const { data: users = [] } = useQuery<any[]>({ queryKey: ["/api/admin/users"] });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => apiRequest("PUT", `/api/admin/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: t("Обновлено", "Updated") });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setDeleteTarget(null);
      toast({ title: t("Пользователь удалён", "User deleted") });
    },
    onError: (err: any) => {
      toast({ title: t("Ошибка", "Error"), description: err.message, variant: "destructive" });
    },
  });

  return (
    <AdminLayout title={t("Пользователи", "Users")}>
      <p className="text-sm text-muted-foreground mb-6">{users.length} {t("пользователей", "users")}</p>
      <div className="space-y-3">
        {users.map((user: any) => {
          const loyalty = LOYALTY_LABELS[user.loyaltyLevel] || LOYALTY_LABELS.beginner;
          return (
            <Card key={user.id} data-testid={`card-user-${user.id}`}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar || undefined} />
                      <AvatarFallback className="text-sm bg-primary text-primary-foreground">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm" data-testid={`text-username-${user.id}`}>{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email} · @{user.username}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${loyalty.color}`}>
                          {lang === "ru" ? loyalty.ru : loyalty.en}
                        </span>
                        <span className="text-xs text-muted-foreground">{user.bookingsCount} {t("туров", "tours")}</span>
                        {user.role === "admin" && <Badge className="text-xs py-0">Admin</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">{format(new Date(user.createdAt), "dd.MM.yyyy")}</span>
                    <Select
                      value={user.role}
                      onValueChange={v => updateMutation.mutate({ id: user.id, data: { role: v } })}
                    >
                      <SelectTrigger className="w-28 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">{t("Пользователь", "User")}</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    {user.role !== "admin" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => setDeleteTarget(user)}
                        data-testid={`button-delete-user-${user.id}`}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        {t("Удалить", "Delete")}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Удалить пользователя?", "Delete user?")}</DialogTitle>
            <DialogDescription>
              {deleteTarget && (
                <>
                  <strong>{deleteTarget.name}</strong> ({deleteTarget.email})
                  <br />
                  {t(
                    "Будут удалены: избранное, отзывы, токены сброса пароля. Бронирования сохранятся. Пользователь сможет заново зарегистрироваться по этому email.",
                    "Favorites, reviews, and password reset tokens will be deleted. Bookings will be preserved. The user will be able to re-register with this email."
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} data-testid="button-cancel-delete">
              {t("Отмена", "Cancel")}
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              data-testid="button-confirm-delete-user"
            >
              {deleteMutation.isPending ? t("Удаление...", "Deleting...") : t("Удалить", "Delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
