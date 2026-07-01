import React, { useEffect, useRef } from 'react';
import Turnstile from 'react-turnstile';
import { usePage } from '@inertiajs/react';

export default function TurnstileWidget({ onVerify }) {
    const { appConfig } = usePage().props;
    const siteKey = appConfig?.turnstileSiteKey;
    const turnstileRef = useRef(null);

    useEffect(() => {
        // Graceful Local Testing Fallback:
        // Jika siteKey kosong atau belum diset di .env, kirim token placeholder
        if (!siteKey) {
            onVerify('dev_placeholder_token');
        }
    }, [siteKey, onVerify]);

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
                onVerify={(token) => onVerify(token)}
                onError={() => onVerify(null)}
                onExpire={() => {
                    onVerify(null);
                    if (turnstileRef.current?.reset) {
                        turnstileRef.current.reset();
                    }
                }}
            />
        </div>
    );
}
