<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Only Battambang province
        $province = ['name_en' => 'Battambang', 'name_km' => 'បាត់ដំបង'];

        $provinceId = DB::table('provinces')->insertGetId($province);

        // Add districts for Battambang
        $this->seedDistricts($provinceId);
    }
    private function seedDistricts(int $provinceId): void
    {
        $districts = [
            ['name_en' => 'Battambang', 'name_km' => 'បាត់ដំបង'],
            ['name_en' => 'Banan', 'name_km' => 'បាណន់'],
            ['name_en' => 'Thma Koul', 'name_km' => 'ថ្មគោល'],
            ['name_en' => 'Bavel', 'name_km' => 'បវេល'],
            ['name_en' => 'Aek Phnum', 'name_km' => 'ឯកភ្នំ'],
            ['name_en' => 'Moung Ruessei', 'name_km' => 'មោងឫស្សី'],
            ['name_en' => 'Rotanak Mondol', 'name_km' => 'រតនមណ្ឌល'],
            ['name_en' => 'Sangkae', 'name_km' => 'សង្កែ'],
            ['name_en' => 'Samlout', 'name_km' => 'សំឡូត'],
            ['name_en' => 'Sampov Loun', 'name_km' => 'សំពៅលូន'],
            ['name_en' => 'Phnum Proek', 'name_km' => 'ភ្នំព្រឹក'],
            ['name_en' => 'Kamrieng', 'name_km' => 'កំរៀង'],
            ['name_en' => 'Koas Krala', 'name_km' => 'កោះក្រឡា'],
            ['name_en' => 'Rukhak Kiri', 'name_km' => 'រុក្ខគិរី'],
        ];

        foreach ($districts as $district) {
            $district['province_id'] = $provinceId;
            $districtId = DB::table('districts')->insertGetId($district);

            // Add communes for each district
            $this->seedCommunes($districtId, $district['name_en']);
        }
    }

    private function seedCommunes(int $districtId, string $districtName): void
    {
        $communesData = [
            'Battambang' => [
                ['name_en' => 'Rattanak', 'name_km' => 'រតនៈ'],
                ['name_en' => 'Prek Mohatep', 'name_km' => 'ព្រែកមហាទេព'],
                ['name_en' => 'Chamkar Samrong', 'name_km' => 'ចំការសំរោង'],
                ['name_en' => 'Ou Char', 'name_km' => 'អូរជ័រ'],
                ['name_en' => 'Prek Preah Sdech', 'name_km' => 'ព្រែកព្រះស្តេច'],
                ['name_en' => 'Chaeng Meanchey', 'name_km' => 'ចែងមានជ័យ'],
                ['name_en' => 'Ta Pun', 'name_km' => 'តាពុន'],
                ['name_en' => 'Sla Ket', 'name_km' => 'ស្លាកែត'],
                ['name_en' => 'Ksach Poy', 'name_km' => 'ក្សាច់ពុយ'],
                ['name_en' => 'Toul Ta Ek', 'name_km' => 'ទួលតាឯក'],
            ],
            'Banan' => [
                ['name_en' => 'Kantueu Muoy', 'name_km' => 'កន្ទួតមួយ'],
                ['name_en' => 'Kantueu Pir', 'name_km' => 'កន្ទួតពីរ'],
                ['name_en' => 'Chaeng Khmeng', 'name_km' => 'ចែងឃ្មេង'],
                ['name_en' => 'Chheu Teal', 'name_km' => 'ឈើទាល'],
                ['name_en' => 'Ta Kream', 'name_km' => 'តាគ្រាម'],
                ['name_en' => 'Banan', 'name_km' => 'បាណន់'],
                ['name_en' => 'Phnom Sampov', 'name_km' => 'ភ្នំសំពៅ'],
                ['name_en' => 'Snay Por', 'name_km' => 'ស្ណាយប'],
            ],
            'Thma Koul' => [
                ['name_en' => 'Thma Koul', 'name_km' => 'ថ្មគោល'],
                ['name_en' => 'Poi Pet', 'name_km' => 'ប៉ោយប៉ែត'],
                ['name_en' => 'Ou Ambel', 'name_km' => 'អូរអំពិល'],
                ['name_en' => 'Phsa Kandal', 'name_km' => 'ផ្សារកណ្តាល'],
                ['name_en' => 'Tuol Pongro', 'name_km' => 'ទួលពង្រ'],
                ['name_en' => 'Ou Samrel', 'name_km' => 'អូរសំរែល'],
            ],
            'Bavel' => [
                ['name_en' => 'Bavel', 'name_km' => 'បវេល'],
                ['name_en' => 'Kdol Ta Haen', 'name_km' => 'ក្តូលតាហែន'],
                ['name_en' => 'Prey Khpos', 'name_km' => 'ព្រៃខ្ពស់'],
                ['name_en' => 'Chheu Teal', 'name_km' => 'ឈើទាល'],
                ['name_en' => 'Lvea', 'name_km' => 'ល្វា'],
                ['name_en' => 'Prey Svay', 'name_km' => 'ព្រៃស្វាយ'],
                ['name_en' => 'Khnach Romeas', 'name_km' => 'ខ្នាចរមាស'],
            ],
            'Aek Phnum' => [
                ['name_en' => 'Aek Phnum', 'name_km' => 'ឯកភ្នំ'],
                ['name_en' => 'Preaek Norint', 'name_km' => 'ព្រែកនរិន្ទ'],
                ['name_en' => 'Samraong Knong', 'name_km' => 'សំរោងក្នុង'],
                ['name_en' => 'Prey Chas', 'name_km' => 'ព្រៃចាស់'],
                ['name_en' => 'Tuol Prich', 'name_km' => 'ទួលព្រីច'],
                ['name_en' => 'Chrey', 'name_km' => 'ជ្រៃ'],
            ],
            'Moung Ruessei' => [
                ['name_en' => 'Moung Ruessei', 'name_km' => 'មោងឫស្សី'],
                ['name_en' => 'Rohat Tuek', 'name_km' => 'រហាទឹក'],
                ['name_en' => 'Kakaoh', 'name_km' => 'កាកោះ'],
                ['name_en' => 'Sala Kamraeuk', 'name_km' => 'សាលាកំរើក'],
                ['name_en' => 'Kouk Ballangk', 'name_km' => 'គោកបល្លង្គ'],
                ['name_en' => 'Snoeng', 'name_km' => 'ស្នួង'],
                ['name_en' => 'Ou Ta Paong', 'name_km' => 'អូរតាពោង'],
                ['name_en' => 'Chrey Seima', 'name_km' => 'ជ្រៃសែម៉ា'],
            ],
            'Rotanak Mondol' => [
                ['name_en' => 'Rotanak Mondol', 'name_km' => 'រតនមណ្ឌល'],
                ['name_en' => 'Koy Maeng', 'name_km' => 'កុយមែង'],
                ['name_en' => 'Peam Aek', 'name_km' => 'ពាមឯក'],
                ['name_en' => 'Srah Chrey', 'name_km' => 'ស្រះជ្រៃ'],
                ['name_en' => 'Ta Meun', 'name_km' => 'តាមឿន'],
                ['name_en' => 'Tuol Snaeng', 'name_km' => 'ទួលស្នែង'],
                ['name_en' => 'Sdau', 'name_km' => 'ស្តៅ'],
            ],
            'Sangkae' => [
                ['name_en' => 'Sangkae', 'name_km' => 'សង្កែ'],
                ['name_en' => 'Roka', 'name_km' => 'រកា'],
                ['name_en' => 'Ruessei Krang', 'name_km' => 'ឫស្សីក្រង'],
                ['name_en' => 'Anlong Vil', 'name_km' => 'អន្លង់វិល'],
                ['name_en' => 'Tuol Ta Prum', 'name_km' => 'ទួលតាព្រំ'],
                ['name_en' => 'Norea', 'name_km' => 'នរា'],
                ['name_en' => 'Ta Pung', 'name_km' => 'តាពូង'],
                ['name_en' => 'Prey Chhor', 'name_km' => 'ព្រៃឈរ'],
            ],
            'Samlout' => [
                ['name_en' => 'Samlout', 'name_km' => 'សំឡូត'],
                ['name_en' => 'Boeung Reang', 'name_km' => 'បឹងរាំង'],
                ['name_en' => 'Anlong Tnaot', 'name_km' => 'អន្លង់ត្នោត'],
                ['name_en' => 'Ta Sanh', 'name_km' => 'តាសាញ'],
                ['name_en' => 'Ruessei Chrum', 'name_km' => 'ឫស្សីជ្រុំ'],
            ],
            'Sampov Loun' => [
                ['name_en' => 'Sampov Loun', 'name_km' => 'សំពៅលូន'],
                ['name_en' => 'Anlong Run', 'name_km' => 'អន្លង់រុន'],
                ['name_en' => 'Ruessei Keo', 'name_km' => 'ឫស្សីកែវ'],
                ['name_en' => 'Bak Kheng', 'name_km' => 'បាក់ខេង'],
                ['name_en' => 'Pech Changvar', 'name_km' => 'ពេជ្រចង្វារ'],
                ['name_en' => 'Krapeu Pir', 'name_km' => 'ក្របើពីរ'],
            ],
            'Phnum Proek' => [
                ['name_en' => 'Phnum Proek', 'name_km' => 'ភ្នំព្រឹក'],
                ['name_en' => 'Kor', 'name_km' => 'កោរ'],
                ['name_en' => 'Kouk Khmum', 'name_km' => 'គោកឃ្មុំ'],
                ['name_en' => 'Pech Chenda', 'name_km' => 'ពេជ្រចិន្តា'],
                ['name_en' => 'Rolous', 'name_km' => 'រលួស'],
            ],
            'Kamrieng' => [
                ['name_en' => 'Kamrieng', 'name_km' => 'កំរៀង'],
                ['name_en' => 'Boeung Pring', 'name_km' => 'បឹងព្រីង'],
                ['name_en' => 'Ta Suos', 'name_km' => 'តាស៊ុស'],
                ['name_en' => 'Thmei', 'name_km' => 'ថ្មី'],
                ['name_en' => 'Trapeang Chong', 'name_km' => 'ត្រពាំងចុង'],
            ],
            'Koas Krala' => [
                ['name_en' => 'Koas Krala', 'name_km' => 'កោះក្រឡា'],
                ['name_en' => 'Dambouk Khpos', 'name_km' => 'ដំបូកខ្ពស់'],
                ['name_en' => 'Pech Chrum', 'name_km' => 'ពេជ្រជ្រុំ'],
                ['name_en' => 'Ou Taki', 'name_km' => 'អូរតាគី'],
            ],
            'Rukhak Kiri' => [
                ['name_en' => 'Rukhak Kiri', 'name_km' => 'រុក្ខគិរី'],
                ['name_en' => 'Trang', 'name_km' => 'ត្រង់'],
                ['name_en' => 'Pramoey', 'name_km' => 'ប្រមោយ'],
                ['name_en' => 'Ta Moen', 'name_km' => 'តាមោន'],
            ],
        ];

        $communes = $communesData[$districtName] ?? [];

        foreach ($communes as $commune) {
            $commune['district_id'] = $districtId;
            $communeId = DB::table('communes')->insertGetId($commune);

            // Add villages for each commune
            $this->seedVillages($communeId, $commune['name_en']);
        }
    }
    private function seedVillages(int $communeId, string $communeName): void
    {
        $villagesData = [
            // Battambang District
            'Rattanak' => [
                ['name_en' => 'Rattanak', 'name_km' => 'រតនៈ'],
                ['name_en' => 'Prek Preah Sdech', 'name_km' => 'ព្រែកព្រះស្ដេច'],
                ['name_en' => 'Kampong Preah', 'name_km' => 'កំពង់ព្រះ'],
            ],
            'Prek Mohatep' => [
                ['name_en' => 'Prek Mohatep', 'name_km' => 'ព្រែកមហាទេព'],
                ['name_en' => 'Kampong Pring', 'name_km' => 'កំពង់ព្រីង'],
                ['name_en' => 'Bak Andeaung', 'name_km' => 'បាក់អណ្តើង'],
            ],
            'Chamkar Samrong' => [
                ['name_en' => 'Chamkar Samrong', 'name_km' => 'ចំការសំរោង'],
                ['name_en' => 'Ta Long', 'name_km' => 'តាឡុង'],
                ['name_en' => 'Boeng Lvea', 'name_km' => 'បឹងល្វា'],
            ],
            'Ou Char' => [
                ['name_en' => 'Ou Char', 'name_km' => 'អូរជ័រ'],
                ['name_en' => 'Ta Meun', 'name_km' => 'តាមឿន'],
                ['name_en' => 'Prek Kak', 'name_km' => 'ព្រែកកក់'],
            ],
            'Prek Preah Sdech' => [
                ['name_en' => 'Prek Preah Sdech', 'name_km' => 'ព្រែកព្រះស្តេច'],
                ['name_en' => 'Ta Prich', 'name_km' => 'តាព្រីច'],
                ['name_en' => 'Kampong Thom', 'name_km' => 'កំពង់ធំ'],
            ],
            'Chaeng Meanchey' => [
                ['name_en' => 'Chaeng Meanchey', 'name_km' => 'ចែងមានជ័យ'],
                ['name_en' => 'Anlong Romiet', 'name_km' => 'អន្លង់រមៀត'],
                ['name_en' => 'Ta Haen', 'name_km' => 'តាហែន'],
            ],
            'Ta Pun' => [
                ['name_en' => 'Ta Pun', 'name_km' => 'តាពុន'],
                ['name_en' => 'Pong Tuek', 'name_km' => 'ពងទឹក'],
                ['name_en' => 'Sdau', 'name_km' => 'ស្ដៅ'],
            ],
            'Sla Ket' => [
                ['name_en' => 'Sla Ket', 'name_km' => 'ស្លាកែត'],
                ['name_en' => 'Kampong Preah', 'name_km' => 'កំពង់ព្រះ'],
                ['name_en' => 'Tuol Khnol', 'name_km' => 'ទួលខ្នុល'],
            ],
            'Ksach Poy' => [
                ['name_en' => 'Ksach Poy', 'name_km' => 'ក្សាច់ពុយ'],
                ['name_en' => 'Damnak Kantuot', 'name_km' => 'ដំណាក់កន្ទួត'],
                ['name_en' => 'Ta Ches', 'name_km' => 'តាចេស'],
            ],
            'Toul Ta Ek' => [
                ['name_en' => 'Toul Ta Ek', 'name_km' => 'ទួលតាឯក'],
                ['name_en' => 'Roka Kaong', 'name_km' => 'រកាកោង'],
                ['name_en' => 'Svay', 'name_km' => 'ស្វាយ'],
            ],

            // Banan District
            'Kantueu Muoy' => [
                ['name_en' => 'Kantueu Muoy', 'name_km' => 'កន្ទួតមួយ'],
                ['name_en' => 'Phnum Touch', 'name_km' => 'ភ្នំទូច'],
                ['name_en' => 'Kampong Cham', 'name_km' => 'កំពង់ចាម'],
            ],
            'Kantueu Pir' => [
                ['name_en' => 'Kantueu Pir', 'name_km' => 'កន្ទួតពីរ'],
                ['name_en' => 'Tuol Snaeng', 'name_km' => 'ទួលស្នែង'],
                ['name_en' => 'Prey Chhor', 'name_km' => 'ព្រៃឈរ'],
            ],
            'Chaeng Khmeng' => [
                ['name_en' => 'Chaeng Khmeng', 'name_km' => 'ចែងឃ្មេង'],
                ['name_en' => 'Sambuor', 'name_km' => 'សំបួរ'],
                ['name_en' => 'Ta Kream Leu', 'name_km' => 'តាគ្រាមលើ'],
            ],
            'Chheu Teal' => [
                ['name_en' => 'Chheu Teal', 'name_km' => 'ឈើទាល'],
                ['name_en' => 'Tuol Lvea', 'name_km' => 'ទួលល្វា'],
                ['name_en' => 'Koki', 'name_km' => 'កូគី'],
            ],
            'Ta Kream' => [
                ['name_en' => 'Ta Kream', 'name_km' => 'តាគ្រាម'],
                ['name_en' => 'Andoung Bat', 'name_km' => 'អណ្តូងបាត'],
                ['name_en' => 'Prey Khla', 'name_km' => 'ព្រៃខ្លា'],
            ],
            'Banan' => [
                ['name_en' => 'Banan', 'name_km' => 'បាណន់'],
                ['name_en' => 'Phnum Banan', 'name_km' => 'ភ្នំបាណន់'],
                ['name_en' => 'Kampong Krabei', 'name_km' => 'កំពង់ក្របី'],
            ],
            'Phnom Sampov' => [
                ['name_en' => 'Phnom Sampov', 'name_km' => 'ភ្នំសំពៅ'],
                ['name_en' => 'O Dambang', 'name_km' => 'អូរដំបង'],
                ['name_en' => 'Kampong Krasang', 'name_km' => 'កំពង់ក្រសាំង'],
            ],
            'Snay Por' => [
                ['name_en' => 'Snay Por', 'name_km' => 'ស្ណាយប'],
                ['name_en' => 'Tuek Thla', 'name_km' => 'ទឹកថ្លា'],
                ['name_en' => 'Kbal Dongkaeub', 'name_km' => 'ក្បាលដូងកើប'],
            ],

            // Thma Koul District
            'Thma Koul' => [
                ['name_en' => 'Thma Koul', 'name_km' => 'ថ្មគោល'],
                ['name_en' => 'Kouk Khmum', 'name_km' => 'គោកឃ្មុំ'],
                ['name_en' => 'Prey Chhlang', 'name_km' => 'ព្រៃឈ្លាំង'],
            ],
            'Poi Pet' => [
                ['name_en' => 'Poi Pet', 'name_km' => 'ប៉ោយប៉ែត'],
                ['name_en' => 'Nimit', 'name_km' => 'និមិត្ត'],
                ['name_en' => 'Ou Ambel', 'name_km' => 'អូរអំពិល'],
            ],
            'Ou Ambel' => [
                ['name_en' => 'Ou Ambel', 'name_km' => 'អូរអំពិល'],
                ['name_en' => 'Ta Sanh', 'name_km' => 'តាសាញ'],
                ['name_en' => 'Kakaoh', 'name_km' => 'កាកោះ'],
            ],
            'Phsa Kandal' => [
                ['name_en' => 'Phsa Kandal', 'name_km' => 'ផ្សារកណ្តាល'],
                ['name_en' => 'Daun Kaev', 'name_km' => 'ដូនកែវ'],
                ['name_en' => 'O Brae', 'name_km' => 'អូរប្រែ'],
            ],
            'Tuol Pongro' => [
                ['name_en' => 'Tuol Pongro', 'name_km' => 'ទួលពង្រ'],
                ['name_en' => 'Chambak', 'name_km' => 'ចំបក់'],
                ['name_en' => 'Sdau', 'name_km' => 'ស្ដៅ'],
            ],
            'Ou Samrel' => [
                ['name_en' => 'Ou Samrel', 'name_km' => 'អូរសំរែល'],
                ['name_en' => 'Andoung Pou', 'name_km' => 'អណ្តូងពោធិ៍'],
                ['name_en' => 'Kampong Svay', 'name_km' => 'កំពង់ស្វាយ'],
            ],

            // Bavel District
            'Bavel' => [
                ['name_en' => 'Bavel', 'name_km' => 'បវេល'],
                ['name_en' => 'Phnum Sampov', 'name_km' => 'ភ្នំសំពៅ'],
                ['name_en' => 'Ta Khmau', 'name_km' => 'តាខ្មៅ'],
            ],
            'Kdol Ta Haen' => [
                ['name_en' => 'Kdol Ta Haen', 'name_km' => 'ក្តូលតាហែន'],
                ['name_en' => 'Prey Thmei', 'name_km' => 'ព្រៃថ្មី'],
                ['name_en' => 'Kampong Prieng', 'name_km' => 'កំពង់ព្រៀង'],
            ],
            'Prey Khpos' => [
                ['name_en' => 'Prey Khpos', 'name_km' => 'ព្រៃខ្ពស់'],
                ['name_en' => 'Tuol Sala', 'name_km' => 'ទួលសាលា'],
                ['name_en' => 'Anlong Vil', 'name_km' => 'អន្លង់វិល'],
            ],
            'Lvea' => [
                ['name_en' => 'Lvea', 'name_km' => 'ល្វា'],
                ['name_en' => 'Kbal Trach', 'name_km' => 'ក្បាលត្រាច'],
                ['name_en' => 'Pong Tuek', 'name_km' => 'ពងទឹក'],
            ],
            'Prey Svay' => [
                ['name_en' => 'Prey Svay', 'name_km' => 'ព្រៃស្វាយ'],
                ['name_en' => 'Kampong Cham', 'name_km' => 'កំពង់ចាម'],
                ['name_en' => 'Ta Prom', 'name_km' => 'តាព្រហ្ម'],
            ],
            'Khnach Romeas' => [
                ['name_en' => 'Khnach Romeas', 'name_km' => 'ខ្នាចរមាស'],
                ['name_en' => 'Thmei', 'name_km' => 'ថ្មី'],
                ['name_en' => 'Sambuor', 'name_km' => 'សំបួរ'],
            ],

            // Aek Phnum District
            'Aek Phnum' => [
                ['name_en' => 'Aek Phnum', 'name_km' => 'ឯកភ្នំ'],
                ['name_en' => 'Phnum Srok', 'name_km' => 'ភ្នំស្រុក'],
                ['name_en' => 'Prey Totueng', 'name_km' => 'ព្រៃតូទឹង'],
            ],
            'Preaek Norint' => [
                ['name_en' => 'Preaek Norint', 'name_km' => 'ព្រែកនរិន្ទ'],
                ['name_en' => 'Kampong Svay', 'name_km' => 'កំពង់ស្វាយ'],
                ['name_en' => 'Ta Pon', 'name_km' => 'តាពូន'],
            ],

        ];
        $villages = $villagesData[$communeName] ?? [];

        foreach ($villages as $village) {
            $village['commune_id'] = $communeId;
            DB::table('villages')->insert($village);
        }
    }
}
