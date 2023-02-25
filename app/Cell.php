<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Cell extends Model
{
    public function user()
    {
        return $this->belongsTo(Game::class);
    }
}
