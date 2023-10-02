<?php

namespace App\Modules\Services;


use App\Models\Category;
use App\Models\Item;
use App\Models\Order;
use App\Models\Table;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TableService
{
    protected Table $model;

    public function __construct(Table $model)
    {
        $this->model = $model;
    }

    public function all()
    {
        return $this->model->all();
    }

    public function addTable($request)
    {
        $table = new Table();
        $table->table_number = $request->table_number;
        $table->save();
        return $table;
    }

    public function updateTable($request, $tableNumber)
    {
        $table = $this->model->where('id', $tableNumber)->first();
        $table->table_number = $request->table_number;
        $table->save();
        return $table;
    }

    public function deleteTable($tableNumber)
    {
        $table = $this->model->where('id', $tableNumber)->first();
        $table->delete();
        return $table;
    }
}
