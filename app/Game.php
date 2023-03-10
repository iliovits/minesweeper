<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function cells()
    {
        return $this->hasMany(Cell::class);
    }
}
