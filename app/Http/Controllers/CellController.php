<?php

namespace App\Http\Controllers;

use App\Cell;
use App\Game;
use Illuminate\Http\Request;

class CellController extends Controller
{   
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $game = Game::select()->where(['user_id' => auth()->id()])->first();
        $cells = Cell::where(['game_id' => $game->id])->get();
        return $cells;
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {   
        $user_id = $request->user()->id;
        $old_game = Game::select()->where('user_id',$user_id);
        if ($old_game) {
            Game::where('user_id',$user_id)->delete();
        }
        $game = new Game();
        $game->user_id = $user_id;
        $game->save();
        
        $request = json_decode($request->getContent());
        $cells = array();
        
        foreach ($request as $row){
            foreach ($row as $cell) {
                array_push($cells, array(
                    'game_id' => $game->id,
                    'x' => $cell->x,
                    'y' => $cell->y,
                    'neighbors' => $cell->neighbors,
                    'isEmpty' => $cell->isEmpty,
                    'isMine' => $cell->isMine,
                    'isFlagged' => $cell->isFlagged,
                    'isRevealed' => $cell->isRevealed,
                ));
            }
        }
        Cell::insert($cells);
        return $cells;
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Cell  $cell
     * @return \Illuminate\Http\Response
     */
    public function show(Cell $cell)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Cell  $cell
     * @return \Illuminate\Http\Response
     */
    public function edit(Cell $cell)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Cell  $cell
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Cell $cell)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Cell  $cell
     * @return \Illuminate\Http\Response
     */
    public function destroy(Cell $cell)
    {
        //
    }
}
