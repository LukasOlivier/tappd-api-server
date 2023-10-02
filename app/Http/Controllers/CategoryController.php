<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Item;
use App\Modules\Services\CategoryService;
use App\Modules\Services\ItemService;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    private CategoryService $service;

    public function __construct(Category $model, CategoryService $service)
    {
        $this->service = $service;
    }

    public function categories()
    {
        return $this->service->categories();
    }

    public function addCategory(Request $request)
    {
        return $this->service->addCategory($request);
    }

    public function updateCategory(Request $request, $categoryNumber)
    {
        return $this->service->updateCategory($request, $categoryNumber);
    }

    public function deleteCategory($categoryNumber)
    {
        return $this->service->deleteCategory($categoryNumber);
    }
}
