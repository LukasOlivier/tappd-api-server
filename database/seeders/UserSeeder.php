<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Item;
use App\Models\Table;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        $data = CvsReader::read('users');

        $model = new User();

        foreach ($data as $row){
            $model->create($row);
        }
    }
}
