<?php

namespace App\Enums;

enum RiskStatus: string
{
    case Aman = 'aman';
    case Waspada = 'waspada';
    case Bahaya = 'bahaya';

    /**
     * Warna hex untuk komponen frontend.
     * Konsistensi wajib — jangan gunakan warna lain untuk status ini di mana pun.
     */
    public function color(): string
    {
        return match ($this) {
            self::Aman => '#22C55E', // green-500
            self::Waspada => '#EAB308', // yellow-500
            self::Bahaya => '#EF4444', // red-500
        };
    }

    /**
     * Label bahasa Indonesia untuk ditampilkan ke user.
     */
    public function label(): string
    {
        return match ($this) {
            self::Aman => 'Aman',
            self::Waspada => 'Waspada',
            self::Bahaya => 'Bahaya',
        };
    }
}
