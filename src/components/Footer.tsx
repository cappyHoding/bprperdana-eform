import { useTranslation } from 'react-i18next';
import logoShort from '@/assets/logo-short.png';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t bg-card">
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex items-center gap-3">
            <img src={logoShort} alt="BPR Perdana" className="h-8 w-8" />
            <span className="font-semibold text-primary">BPR Perdana</span>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {t('footer.copyright')}
          </p>
          
          <div className="flex gap-6 text-sm">
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {t('footer.privacy')}
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {t('footer.terms')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
