<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Item;
use App\Models\Table;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        $data = CvsReader::read('tables');

        $model = new Table();

        foreach ($data as $row){
            $model->create($row);
        }
    }
}
