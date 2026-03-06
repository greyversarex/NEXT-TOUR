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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-2">{t("Новости", "News")}</h1>
      <p className="text-muted-foreground mb-8">{t("Последние новости и статьи о путешествиях", "Latest travel news and articles")}</p>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-64 rounded-lg" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsList.map(item => (
            <Link key={item.id} href={`/news/${item.id}`}>
              <article className="group rounded-lg overflow-hidden bg-card border border-card-border hover-elevate cursor-pointer h-full flex flex-col" data-testid={`card-news-${item.id}`}>
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
      {item.imageUrl && (
        <div className="aspect-video rounded-xl overflow-hidden mb-6">
          <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Calendar className="h-4 w-4" />
        {format(new Date(item.publishedAt), "dd MMMM yyyy")}
      </div>
      <h1 className="text-3xl font-bold mb-6">{lang === "ru" ? item.titleRu : item.titleEn}</h1>
      <div className="prose prose-sm max-w-none text-foreground/80 leading-relaxed whitespace-pre-line">
        {lang === "ru" ? item.contentRu : item.contentEn}
      </div>
    </div>
  );
}
