<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Item;
use App\Models\Order;
use App\Modules\Services\CategoryService;
use App\Modules\Services\ItemService;
use App\Modules\Services\OrderService;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    private OrderService $service;

    public function __construct(Order $model, OrderService $service)
    {
        $this->service = $service;
    }

    public function order(Request $request)
    {
        $order = $request->all();
        return $this->service->addOrder($order);
    }

    public function updateStatus($orderNumber)
    {
        return $this->service->updateStatus($orderNumber);
    }

    public function all()
    {
        return $this->service->all();
    }
}
