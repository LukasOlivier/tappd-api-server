<?php

namespace App\Modules\Services;


use App\Models\Category;
use App\Models\Item;

class ItemService
{
    protected Item $model;

    public function __construct(Item $model)
    {
        $this->model = $model;
    }

    public function updateItem($request, $itemNumber)
    {
        $item = $this->model->where('id', $itemNumber)->first();
        $item->name = $request->name;
        $item->price = $request->price;
        $item->category_id = Category::query()->where('category', $request->category)->first()->id;
        $item->save();
        return $item;
    }


    public function inventory($search, $category, $id, $page, $pageSize = 10)
    {
        $items = $this->model->all();
        $maxPage = ceil($items->count() / $pageSize);

        if ($id != null) {
            return $items->where('id', $id)->first();
        }

        if ($category != null && $category != "all") {
            $categoryId = Category::where('category', $category)->first()->id;
            $items = $items->where('category_id', $categoryId);
        }

        if ($search != null) {
            $search = strtolower($search);

            $items = $items->filter(function ($item) use ($search) {
                $itemName = strtolower($item->name);
                return str_contains($itemName, $search);
            });
        }
        $items = $items->sortBy('category')->forPage($page, $pageSize)->values();
        return [
            'items' => $items,
            'currentPage' => $page,
            'maxPage' => $maxPage
        ];
    }

    public function all()
    {
        return $this->model->all();
    }

    public function addItem($request)
    {
        $item = new Item();
        $item->name = $request->name;
        $item->price = $request->price;
        $item->category_id = Category::query()->where('category', $request->category)->first()->id;
        $item->alcohol = $request->alcohol;
        $item->save();
        return $item;
    }

    public function deleteItem($itemNumber)
    {
        $item = $this->model->where('id', $itemNumber)->first();
        $item->delete();
        return $item;
    }
}
