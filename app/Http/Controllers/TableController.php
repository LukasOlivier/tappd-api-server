<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Item;
use App\Models\Order;
use App\Models\Table;
use App\Modules\Services\CategoryService;
use App\Modules\Services\ItemService;
use App\Modules\Services\OrderService;
use App\Modules\Services\TableService;
use Illuminate\Http\Request;

class TableController extends Controller
{
    private TableService $service;

    public function __construct(Table $model, TableService $service)
    {
        $this->service = $service;
    }

    public function all()
    {
        return $this->service->all();
    }

    public function addTable(Request $request)
    {
        return $this->service->addTable($request);
    }

    public function updateTable(Request $request, $tableNumber)
    {
        return $this->service->updateTable($request, $tableNumber);
    }

    public function deleteTable($tableNumber)
    {
        return $this->service->deleteTable($tableNumber);
    }
}
