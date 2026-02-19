import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Tabungan() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-16">
        <div className="container max-w-2xl">
          <Card className="p-8 text-center space-y-6">
            <h1 className="text-3xl font-bold">Formulir Tabungan</h1>
            <p className="text-muted-foreground">
              Form tabungan akan segera tersedia. Silakan hubungi cabang terdekat untuk informasi lebih lanjut.
            </p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Beranda
            </Button>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
