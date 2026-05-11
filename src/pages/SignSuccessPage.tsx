import { CheckCircle2 } from "lucide-react";

export default function SignSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Kontrak Berhasil Ditandatangani!</h1>
            <p className="text-muted-foreground mb-6">
                Dokumen kontrak Anda telah ditandatangani secara elektronik.
                Tim kami akan menghubungi Anda dalam 1–2 hari kerja.
            </p>
            <p className="text-sm text-muted-foreground">
                Pertanyaan? Hubungi kami di{' '}
                <a href="mailto:cs@bprperdana.co.id" className="text-primary underline">
                    cs@bprperdana.co.id
                </a>
            </p>
        </div>
  );
}