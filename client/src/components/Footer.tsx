export default function Footer() {
  return (
    <footer className="relative mt-12 sm:mt-24 overflow-hidden" style={{ background: "linear-gradient(160deg, hsl(215 40% 12%) 0%, hsl(220 45% 9%) 100%)" }}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <div className="absolute w-96 h-96 rounded-full bg-primary/6 blur-[120px] -top-24 -left-24 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="rounded-xl overflow-hidden shadow-2xl border border-white/10 h-[180px] sm:h-[260px] w-full">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2245.3726684082543!2d37.61551!3d55.75584!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46b54a50b315e573%3A0xa886bf5a3d9b2e68!2z0JzQvtGB0LrQstCw!5e0!3m2!1sru!2sru!4v1709904000000!5m2!1sru!2sru"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Office Location"
            data-testid="iframe-google-map"
          />
        </div>

        <div className="border-t border-white/8 mt-5 sm:mt-8 pt-4 sm:pt-5 text-center text-[10px] sm:text-xs text-white/25">
          © {new Date().getFullYear()} NEXT TOUR. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
