<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Modules\Services\ItemService;
use Illuminate\Http\Request;

class ItemController extends Controller
{
    private ItemService $service;

    public function __construct(Item $model, ItemService $service)
    {
        $this->service = $service;
    }

    public function inventory(Request $request){
        $search = $request->query('search');
        $category = $request->query('category');
        $id = $request->query('id');
        $page = $request->query('page', 1);
        $pageSize = $request->query('pageSize', 10);

        return $this->service->inventory($search, $category, $id, $page, $pageSize);
    }

    public function all(){
        return $this->service->all();
    }

    public function updateItem(Request $request, $itemNumber){
        return $this->service->updateItem($request, $itemNumber);
    }

    public function addItem(Request $request){
        return $this->service->addItem($request);
    }

    public function deleteItem($itemNumber){
        return $this->service->deleteItem($itemNumber);
    }

}
