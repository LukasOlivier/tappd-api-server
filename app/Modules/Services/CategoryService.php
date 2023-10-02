<?php

namespace App\Modules\Services;


use App\Models\Category;
use App\Models\Item;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CategoryService
{
    protected Category $model;

    public function __construct(Category $model)
    {
        $this->model = $model;
    }


    public function categories()
    {
        return $this->model->all()->sortBy('category')->pluck('category');
    }

    public function addCategory($request)
    {
        $category = new Category();
        $category->category = $request->category;
        $category->save();
        return $category;
    }

    public function updateCategory($request, $categoryNumber)
    {
        $category = $this->model->where('id', $categoryNumber)->first();
        $category->category = $request->category;
        $category->name = $request->name;
        $category->save();
        return $category;
    }

    public function deleteCategory($categoryNumber)
    {
        $category = $this->model->where('id', $categoryNumber)->first();
        $category->delete();
        return $category;
    }
}
