<?php

namespace App\Enums;

enum UserRole: string
{
    case Patient = 'patient';
    case Caregiver = 'caregiver';
    case FaskesAdmin = 'faskes_admin';
}
