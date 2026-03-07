import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useRoute } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import type { News } from "@shared/schema";

export default function NewsPage() {
  const { t, lang } = useI18n();
  const { data: newsList = [], isLoading } = useQuery<News[]>({ queryKey: ["/api/news"] });

  return (
    <div className="min-h-screen">
      {/* Hero header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950/20 dark:via-background dark:to-background border-b border-border/40 mb-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.07),transparent_60%)] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-md">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <p className="text-muted-foreground font-semibold text-sm uppercase tracking-widest">{t("Журнал", "Journal")}</p>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3 leading-tight">{t("Новости и статьи", "News & Articles")}</h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl leading-relaxed">
            {t("Последние новости, советы путешественникам и вдохновение для следующего приключения", "Latest news, travel tips and inspiration for your next adventure")}
          </p>
        </div>
      </div>

    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsList.map(item => (
            <Link key={item.id} href={`/news/${item.id}`}>
              <article className="group rounded-2xl overflow-hidden bg-card border border-card-border hover-elevate cursor-pointer h-full flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300" data-testid={`card-news-${item.id}`}>
                {item.imageUrl && (
                  <div className="aspect-video overflow-hidden">
                    <img src={item.imageUrl} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                )}
                <div className="p-4 flex-1">
                  <h3 className="font-semibold mb-2 line-clamp-2">{lang === "ru" ? item.titleRu : item.titleEn}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                    {(lang === "ru" ? item.contentRu : item.contentEn).slice(0, 120)}...
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(item.publishedAt), "dd.MM.yyyy")}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}

export function NewsDetail() {
  const [, params] = useRoute("/news/:id");
  const id = params?.id || "";
  const { lang } = useI18n();
  const { data: item, isLoading } = useQuery<News>({ queryKey: [`/api/news/${id}`], enabled: !!id });

  if (isLoading) return <div className="max-w-3xl mx-auto px-4 py-8"><Skeleton className="h-96" /></div>;
  if (!item) return <div className="text-center py-16">Not found</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/news">
        <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer mb-6 inline-block">← {lang === "ru" ? "Все новости" : "All News"}</span>
      </Link>

      {/* Image + content card */}
      <div className="rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-card-border">
        {item.imageUrl && (
          <div className="aspect-video w-full overflow-hidden">
            <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="bg-card p-6 sm:p-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Calendar className="h-4 w-4" />
            {format(new Date(item.publishedAt), "dd MMMM yyyy")}
          </div>
          <h1 className="text-3xl font-bold mb-6">{lang === "ru" ? item.titleRu : item.titleEn}</h1>
          <div className="text-foreground/80 leading-relaxed whitespace-pre-line">
            {lang === "ru" ? item.contentRu : item.contentEn}
          </div>
        </div>
      </div>
    </div>
  );
}
