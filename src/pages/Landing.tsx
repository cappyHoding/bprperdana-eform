import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Landmark,
  Wallet,
  HandCoins,
  FileText,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle2,
  Search
} from 'lucide-react';

export default function Landing() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const products = [
    {
      id: 'deposito',
      icon: Landmark,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      id: 'tabungan',
      icon: Wallet,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      id: 'pinjaman',
      icon: HandCoins,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    // {
    //   id: 'pengkinian-data',
    //   icon: FileText,
    //   color: 'text-success',
    //   bgColor: 'bg-success/10',
    // },
    {
      id: 'cek-status',
      icon: Search,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
  ];

  const features = [
    {
      icon: Clock,
      title: t('landing.hero').includes('Welcome') ? 'Fast & Easy' : 'Cepat & Mudah',
      desc: t('landing.hero').includes('Welcome')
        ? 'Complete your application in minutes'
        : 'Selesaikan pengajuan dalam hitungan menit',
    },
    {
      icon: Shield,
      title: t('landing.hero').includes('Welcome') ? 'Secure' : 'Aman',
      desc: t('landing.hero').includes('Welcome')
        ? 'Your data is protected with bank-grade security'
        : 'Data Anda dilindungi dengan keamanan tingkat perbankan',
    },
    {
      icon: TrendingUp,
      title: t('landing.hero').includes('Welcome') ? 'Competitive Rates' : 'Suku Bunga Kompetitif',
      desc: t('landing.hero').includes('Welcome')
        ? 'Get the best rates for your financial needs'
        : 'Dapatkan suku bunga terbaik untuk kebutuhan finansial Anda',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-hero py-20 text-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />

          <div className="container relative">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold">
                {t('landing.hero')}
              </h1>
              <p className="text-xl opacity-90">
                {t('landing.subtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-16 bg-background">
          <div className="container">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
              {products.map((product) => {
                const Icon = product.icon;
                return (
                  <Card
                    key={product.id}
                    className="p-6 hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => navigate(`/${product.id}`)}
                  >
                    <div className="space-y-4">
                      <div className={`w-12 h-12 rounded-lg ${product.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-6 h-6 ${product.color}`} />
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-xl font-bold">
                          {t(`landing.${product.id}.title`)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t(`landing.${product.id}.desc`)}
                        </p>

                        <ul className="space-y-2">
                          {[0, 1, 2].map((index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${product.color}`} />
                              <span className="text-muted-foreground">
                                {t(`landing.${product.id}.features.${index}`)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button className="w-full" variant="outline">
                        {t('actions.start')}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Features */}
            <div className="grid gap-8 md:grid-cols-3 mt-16">
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div key={idx} className="text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
