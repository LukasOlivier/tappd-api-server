<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\TableController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware('auth:api')->group(function () {
    Route::get("/orders", [OrderController::class, "all"]);
    Route::put("/order/{orderNumber}", [OrderController::class, "updateStatus"]);
    Route::post('/register', [AuthController::class, "register"]);
    Route::put("/inventory/{itemNumber}", [ItemController::class, "updateItem"]);
    Route::delete("/inventory/{itemNumber}", [ItemController::class, "deleteItem"]);
    Route::post("/inventory", [ItemController::class, "addItem"]);
    Route::post("/category", [CategoryController::class, "addCategory"]);
    Route::put("/category/{categoryNumber}", [CategoryController::class, "updateCategory"]);
    Route::delete("/category/{categoryNumber}", [CategoryController::class, "deleteCategory"]);
    Route::post("/table", [TableController::class, "addTable"]);
    Route::put("/table/{tableNumber}", [TableController::class, "updateTable"]);
    Route::delete("/table/{tableNumber}", [TableController::class, "deleteTable"]);
});

Route::post("/order", [OrderController::class, "order"]);
Route::get("/tables", [TableController::class, "all"]);
Route::get("/inventory", [ItemController::class, "inventory"]);
Route::get("/items", [ItemController::class, "all"]);

Route::get("/categories", [CategoryController::class, "categories"]);
Route::post('/login', [AuthController::class, "login"]);


