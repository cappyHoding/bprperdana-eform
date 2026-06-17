import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sendOTP, verifyOTP } from '@/lib/api/applicationApi';
import { CheckCircle2, Loader2, MessageSquare, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface OTPVerificationProps {
  appId: string;
  phone: string;         // nomor HP yang sudah diisi nasabah (untuk display)
  onVerified: () => void; // callback ketika OTP berhasil diverifikasi
}

const COOLDOWN_SECONDS = 60;
const OTP_LENGTH = 4;

export default function OTPVerification({ appId, phone, onVerified }: OTPVerificationProps) {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Mask phone number untuk display: 0812-****-4035
  const maskedPhone = (p: string) => {
    const clean = p.replace(/\D/g, '');
    if (clean.length < 6) return p;
    return clean.slice(0, 4) + '-****-' + clean.slice(-4);
  };

  const handleSend = async () => {
    setSending(true);
    setError(null);
    try {
      await sendOTP(appId);
      setSent(true);
      setCooldown(COOLDOWN_SECONDS);
      toast.success('OTP terkirim', {
        description: `Kode OTP telah dikirim ke ${maskedPhone(phone)}`
      });
      // Focus ke input pertama
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      const msg = err.message ?? 'Gagal mengirim OTP';
      if (msg.includes('COOLDOWN')) {
        const secs = msg.split(':')[1];
        setCooldown(parseInt(secs) || COOLDOWN_SECONDS);
        setSent(true);
      } else {
        setError(msg);
        toast.error('Gagal mengirim OTP', { description: msg });
      }
    } finally {
      setSending(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    // Hanya terima angka
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError(null);

    // Auto-focus ke input berikutnya
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit jika semua digit sudah diisi
    if (digit && index === OTP_LENGTH - 1) {
      const fullCode = newOtp.join('');
      if (fullCode.length === OTP_LENGTH) {
        handleVerify(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (pasted.length === OTP_LENGTH) {
      setOtp(pasted.split(''));
      handleVerify(pasted);
    }
  };

  const handleVerify = async (code: string) => {
    if (code.length !== OTP_LENGTH) return;
    setVerifying(true);
    setError(null);
    try {
      await verifyOTP(appId, code);
      setVerified(true);
      toast.success('Nomor HP terverifikasi!');
      setTimeout(() => onVerified(), 800);
    } catch (err: any) {
      const msg = err.message ?? 'Kode OTP salah';
      setError(msg);
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } finally {
      setVerifying(false);
    }
  };

  // ── Sudah verified ────────────────────────────────────────────────────────
  if (verified) {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-success" />
        </div>
        <p className="font-semibold text-foreground">Nomor HP Terverifikasi</p>
        <p className="text-sm text-muted-foreground">{maskedPhone(phone)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
        <MessageSquare className="w-5 h-5 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">Verifikasi Nomor HP</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kami perlu memastikan nomor HP Anda aktif untuk pengiriman sertifikat elektronik.
          </p>
        </div>
      </div>

      {/* Nomor HP */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">OTP akan dikirim ke</p>
        <p className="font-semibold text-foreground mt-1">{maskedPhone(phone)}</p>
      </div>

      {/* Tombol kirim OTP */}
      {!sent ? (
        <Button
          className="w-full"
          onClick={handleSend}
          disabled={sending}
        >
          {sending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mengirim...</>
          ) : (
            <><MessageSquare className="w-4 h-4 mr-2" /> Kirim OTP</>
          )}
        </Button>
      ) : (
        <div className="space-y-4">
          {/* Input OTP */}
          <div>
            <p className="text-sm text-center text-muted-foreground mb-3">
              Masukkan 4 digit kode OTP yang dikirim via SMS
            </p>
            <div className="flex justify-center gap-3" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <Input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`w-14 h-14 text-center text-2xl font-bold p-0 ${
                    error ? 'border-destructive' : ''
                  }`}
                  disabled={verifying}
                />
              ))}
            </div>

            {/* Error message */}
            {error && (
              <p className="text-sm text-destructive text-center mt-2">{error}</p>
            )}
          </div>

          {/* Tombol verifikasi manual */}
          <Button
            className="w-full"
            onClick={() => handleVerify(otp.join(''))}
            disabled={otp.join('').length !== OTP_LENGTH || verifying}
          >
            {verifying ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memverifikasi...</>
            ) : (
              'Verifikasi OTP'
            )}
          </Button>

          {/* Resend */}
          <div className="text-center">
            {cooldown > 0 ? (
              <p className="text-sm text-muted-foreground">
                Kirim ulang dalam <span className="font-semibold text-foreground">{cooldown}s</span>
              </p>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-primary gap-1.5"
                onClick={handleSend}
                disabled={sending}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Kirim ulang OTP
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}