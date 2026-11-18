import React, { useEffect, useRef } from 'react';
import Turnstile from 'react-turnstile';
import { usePage } from '@inertiajs/react';

export default function TurnstileWidget({ onVerify }) {
    const { appConfig } = usePage().props;
    const siteKey = appConfig?.turnstileSiteKey;
    const turnstileRef = useRef(null);
    const onVerifyRef = useRef(onVerify);

    useEffect(() => {
        onVerifyRef.current = onVerify;
    }, [onVerify]);

    useEffect(() => {
        // Graceful Local Testing Fallback:
        // Jika siteKey kosong atau belum diset di .env, kirim token placeholder hanya sekali saat mount
        if (!siteKey) {
            onVerifyRef.current?.('dev_placeholder_token');
        }
    }, [siteKey]);

    if (!siteKey) {
        return (
            <div className="p-3 my-2 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-xs text-center flex items-center justify-center gap-2">
                <span>🛡️</span>
                <span><strong>Turnstile Dev Mode:</strong> Verifikasi keamanan dinonaktifkan (kredensial kosong di .env).</span>
            </div>
        );
    }

    return (
        <div className="my-2 flex justify-center">
            <Turnstile
                ref={turnstileRef}
                sitekey={siteKey}
                onVerify={(token) => onVerifyRef.current?.(token)}
                onError={() => onVerifyRef.current?.(null)}
                onExpire={() => {
                    onVerifyRef.current?.(null);
                    if (turnstileRef.current?.reset) {
                        turnstileRef.current.reset();
                    }
                }}
            />
        </div>
    );
}
