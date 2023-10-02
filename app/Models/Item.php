<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'categoryId',
        'price',
        'alcohol'
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
        'categoryId',
    ];

    public function getCategoryAttribute()
    {
        return $this->category()->value('category');
    }

    public function category()
    {
        return $this->hasOne(Category::class, 'id', 'category_id');
    }

    protected $appends = ['category'];

}
