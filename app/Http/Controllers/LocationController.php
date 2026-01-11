<?php

namespace App\Http\Controllers;

use App\Models\Province;
use App\Models\District;
use App\Models\Commune;
use App\Models\Village;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    public function getProvinces()
    {
        return Province::select('province_id', 'name_en', 'name_km')
            ->orderBy('name_en')
            ->get();
    }

    public function getDistricts($province_id)
    {
        return District::where('province_id', $province_id)
            ->select('district_id', 'name_en', 'name_km')
            ->orderBy('name_en')
            ->get();
    }

    public function getCommunes($district_id)
    {
        return Commune::where('district_id', $district_id)
            ->select('commune_id', 'name_en', 'name_km')
            ->orderBy('name_en')
            ->get();
    }

    public function getVillages($commune_id)
    {
        return Village::where('commune_id', $commune_id)
            ->select('village_id', 'name_en', 'name_km')
            ->orderBy('name_en')
            ->get();
    }
}
