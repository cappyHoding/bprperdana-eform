import { XCircle } from "lucide-react";
export default function SignFailedPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Penandatanganan Gagal</h1>
            <p className="text-muted-foreground mb-6">
                Proses penandatanganan tidak berhasil diselesaikan.
                Silakan hubungi tim kami untuk mendapatkan link baru.
            </p>
            <a href="mailto:cs@bprperdana.co.id"
               className="text-primary underline text-sm">
                cs@bprperdana.co.id
            </a>
        </div>
    );
}