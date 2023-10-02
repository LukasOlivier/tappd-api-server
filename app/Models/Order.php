<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_items',
        'total_price',
        'status',
        'table_id',
        'order_number',
        'remark'
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];


}
