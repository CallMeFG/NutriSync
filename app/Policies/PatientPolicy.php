<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Patient;
use App\Models\User;

class PatientPolicy
{
    /**
     * Determine whether the user can view the patient's data (profile, logs, dashboard).
     */
    public function view(User $user, Patient $patient): bool
    {
        // Faskes Admin dapat melihat semua pasien di wilayahnya / sistem
        if ($user->role === UserRole::FaskesAdmin) {
            return true;
        }

        // Pasien dapat melihat datanya sendiri
        if ($user->id === $patient->user_id) {
            return true;
        }

        // Caregiver hanya boleh melihat jika sudah terhubung (paired) dengan status active
        if ($user->role === UserRole::Caregiver) {
            return $user->monitoredPatients()
                ->where('patient_id', $patient->id)
                ->wherePivot('status', 'active')
                ->exists();
        }

        return false;
    }

    /**
     * Determine whether the user can update the patient's profile.
     * Caregiver bersifat read-only.
     */
    public function update(User $user, Patient $patient): bool
    {
        if ($user->role === UserRole::FaskesAdmin) {
            return true;
        }

        return $user->id === $patient->user_id;
    }

    /**
     * Determine whether the user can create logs (sugar, nutrition) for this patient.
     */
    public function log(User $user, Patient $patient): bool
    {
        return $user->id === $patient->user_id;
    }
}
