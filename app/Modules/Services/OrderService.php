<?php

namespace App\Modules\Services;


use App\Models\Category;
use App\Models\Item;
use App\Models\Order;
use App\Models\Table;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class OrderService
{
    protected Order $model;

    public function __construct(Order $model)
    {
        $this->model = $model;
    }


    public function addOrder($order)
    {
        Table::FindOrFail($order['table']);
        $totalPrice = 0;
        foreach ($order['items'] as $item) {
            $currentItem = Item::FindOrFail($item['id']);
            $totalPrice += $currentItem['price'] * $item['quantity'];
        }

        $itemsAsString = json_encode($order['items']);

        return $this->model->create([
            'order_number' => Str::random(10),
            'table_id' => $order['table'],
            'order_items' => $itemsAsString,
            'total_price' => $totalPrice,
            'remark' => $order['remark'],
            'status' => 'new'
        ]);
    }

    public function all()
    {
        return $this->model->orderBy('status', 'desc')->get();
    }

    public function updateStatus($orderNumber)
    {
        $order = $this->model->where('order_number', $orderNumber)->firstOrFail();
        if ($order['status'] == 'new') {
            $order['status'] = 'pending';
        } else {
            $order['status'] = 'complete';
        }
        $order->save();
        return $order;
    }


}
