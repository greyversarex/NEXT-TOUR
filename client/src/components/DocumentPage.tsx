import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { FileText, Download, Loader2 } from "lucide-react";
import type { SiteDocument } from "@shared/schema";

const isPdf = (url: string) => /\.pdf(\?|$)/i.test(url);

/**
 * Renders an admin-managed document by slug. When the admin has uploaded a file
 * it becomes the source of truth (shown as a viewer + download button). Otherwise
 * we fall back to the built-in page content so the site is never broken.
 */
export function DocumentPage({ slug, children }: { slug: string; children: React.ReactNode }) {
  const { t, lang } = useI18n();
  const { data: doc, isLoading, isError, error } = useQuery<SiteDocument>({
    queryKey: [`/api/documents/${slug}`],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto w-full px-4 py-24 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // The document was explicitly hidden (or removed): the public endpoint returns
  // 404. Respect that and do NOT show the built-in fallback text. Transient
  // errors (network, 500) still fall through to the fallback so legal text stays
  // reachable when the API is merely unavailable.
  if (isError && /not found/i.test((error as Error)?.message || "")) {
    return (
      <div className="max-w-3xl mx-auto w-full px-4 py-24 text-center">
        <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-xl font-semibold mb-2">{t("Документ недоступен", "Document unavailable")}</h1>
        <p className="text-muted-foreground text-sm">
          {t("Этот документ сейчас не опубликован.", "This document is not currently published.")}
        </p>
      </div>
    );
  }

  if (doc?.fileUrl) {
    const title = lang === "ru" ? doc.titleRu : doc.titleEn;
    const description = lang === "ru" ? doc.descriptionRu : doc.descriptionEn;
    return (
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16">
        <div className="bg-white/95 dark:bg-card/98 backdrop-blur-xl rounded-2xl sm:rounded-3xl px-6 sm:px-10 py-10 sm:py-12 shadow-xl border border-white/30">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <FileText className="h-7 w-7 text-primary shrink-0" />
                {title}
              </h1>
              {description && <p className="text-muted-foreground text-sm">{description}</p>}
            </div>
            <a href={doc.fileUrl} target="_blank" rel="noreferrer" download>
              <Button className="gap-2" data-testid={`button-download-${slug}`}>
                <Download className="h-4 w-4" />
                {t("Скачать / открыть", "Download / open")}
              </Button>
            </a>
          </div>
          {isPdf(doc.fileUrl) ? (
            <iframe
              src={doc.fileUrl}
              title={title}
              className="w-full h-[75vh] rounded-xl border border-border bg-white"
              data-testid={`viewer-${slug}`}
            />
          ) : (
            <div className="rounded-xl border border-border bg-muted/40 p-8 text-center">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {t(
                  "Нажмите кнопку выше, чтобы скачать или открыть документ.",
                  "Use the button above to download or open the document."
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
