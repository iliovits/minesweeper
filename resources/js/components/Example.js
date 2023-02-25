import React, {Component} from "react";
import ReactDOM from "react-dom";
import axios from "axios";


class Hexagon extends Component {

  getValue(){
    if (!this.props.isRevealed){
      return this.props.isFlagged ? "F" : null;
    }
    if (this.props.isMine) {
      return "M";
    }
    if (this.props.neighbors == 0){
      return null;
    }
    return this.props.neighbors;
  }

  render() {
    let revealMid = (this.props.isRevealed ? "reveal-mid" : "middle");
    let revealTop = (this.props.isRevealed ? "reveal-top" : "top");
    let revealBottom = (this.props.isRevealed ? "reveal-bottom" : "bottom");
    return (
      <div className="hex"  onClick={this.props.onClick} onContextMenu={this.props.onRightClick}>
        <div className={revealTop}/>
        <div className={revealMid}>
          {this.getValue()}
        </div>
        <div className={revealBottom}/>
      </div>);
  }
}

class Grid extends Component {
  constructor(props) {
    super(props);
    this.state = {
      grid: this.initializeGrid(),
      status: 'inProgress',
      mineCount: this.props.mines,
    };
  }

  getMines(grid) {
    let mineArray = [];

    grid.map(row => {
        row.map((cell) => {
            if (cell.isMine) {
                mineArray.push(cell);
            }
        });
    });

    return mineArray;
  }

  getFlags(grid) {
    let mineArray = [];

    grid.map(row => {
        row.map((cell) => {
            if (cell.isFlagged) {
                mineArray.push(cell);
            }
        });
    });
    return mineArray;
  }

  getHidden(grid) {
    let mineArray = [];

    grid.map(row => {
      row.map((cell) => {
            if (!cell.isRevealed) {
                mineArray.push(cell);
            }
        });
    });

    return mineArray;
  }

  createGrid(rows, columns) {
    let grid = [];
    let row = [];
    let y = 0;

    while (y < rows) {
      for (let x = 0; x < columns; x++) {
        row.push({x: x, y: y, isMine: 0, isRevealed: 0, isFlagged: 0, neighbors: 0, isEmpty: 0});
      }
      
      grid.push(row);
      y++;
      row = [];
    }

    return grid;
  }

  addMines(grid, mines){
    let minesPlanted = 0;
    let randomX = 0;
    let randomY = 0;
    while (minesPlanted < mines ) {
        randomY = Math.floor(Math.random() * this.props.rows);
        randomX = Math.floor(Math.random() * this.props.columns);
        
        if (!grid[randomY][randomX].isMine){
            grid[randomY][randomX].isMine = 1;
            minesPlanted++;
        }
    }
    return grid;
  }

  getNeighbors(x, y, data)
  {
        const el = [];
        //left
        if (x > 0) {
            el.push(data[y][x - 1]);
        }
        //right
        if (x < this.props.columns - 1) {
            el.push(data[y][x + 1]);
        }
        // top left
        if (y > 0) {
            if (y % 2 == 0) {
                el.push(data[y - 1][x]);
            }
            else if (x > 0) {
                el.push(data[y - 1][x - 1]);
            }
        }
        // top right
        if (y > 0) {
            if (y % 2 == 0 && x < this.props.columns - 1) {
                el.push(data[y - 1][x + 1]);
            }
            else {
                el.push(data[y - 1][x]);
            }
        }
        // bottom right
        if (y < this.props.rows - 1 ) {
            if (y % 2 == 0 && x < this.props.columns - 1) {
                el.push(data[y + 1][x + 1]);
            }
            else if (y % 2 != 0) {
                el.push(data[y + 1][x]);
            }
        }
        // bottom left
        if (y < this.props.rows - 1 ) {
            if (y % 2 == 0) {
                el.push(data[y + 1][x]);
            }
            else if(x > 0){
                el.push(data[y + 1][x - 1]);
            }
        }
        return el;
  }

  countNeighbors(grid)
  {
    let updatedGrid = grid;
    for (let y=0; y < this.props.rows; y++){
        for (let x = 0; x < this.props.columns; x++){
            if(!grid[y][x].isMine){
                let neighboringMines = 0;
                let neighborhood = this.getNeighbors(grid[y][x].x, grid[y][x].y, grid);
                neighborhood.map(cell => {
                    if(cell.isMine){
                        neighboringMines++;
                    }
                });
                if (neighboringMines == 0){
                    updatedGrid[y][x].isEmpty = 1;
                }
                updatedGrid[y][x].neighbors = neighboringMines;
            }
        }
    }
    return updatedGrid
  }

  initializeGrid(){
    let grid = this.createGrid(this.props.rows, this.props.columns);
    grid = this.addMines(grid, this.props.mines);
    grid = this.countNeighbors(grid);
    return grid;
  }

  revealBoard() {
    let updatedGrid = this.state.grid;
    updatedGrid.map((row) => {
      row.map((cell) => {
            cell.isRevealed = 1;
        });
    });
    this.setState({
        grid: updatedGrid
    })
  }

  revealEmpty(x, y, grid) {
    let area = this.getNeighbors(x, y, grid);
    area.map(cell => {
        if (!cell.isFlagged && !cell.isRevealed && (cell.isEmpty || !cell.isMine)) {
            grid[cell.y][cell.x].isRevealed = 1;
            if (cell.isEmpty) {
                this.revealEmpty(cell.x, cell.y, grid);
            }
        }
    });
    return grid;
  }

  handleCellClick(x, y) {

    if (this.state.grid[y][x].isRevealed || this.state.grid[y][x].isFlagged) return null;


    if (this.state.grid[y][x].isMine) {
        this.setState({ gameStatus: "lost" });
        this.revealBoard();
        alert('You Lost!');
    }

    let updatedGrid = this.state.grid;
    updatedGrid[y][x].isFlagged = 0;
    updatedGrid[y][x].isRevealed = 1;
    
    if (updatedGrid[y][x].isEmpty) {
        updatedGrid = this.revealEmpty(x, y, updatedGrid);
    }

    if (this.getHidden(updatedGrid).length === this.props.mines) {
        this.setState({ mineCount: 0, gameStatus: "won" });
        this.revealBoard();
        alert('You Won!');
    }

    this.setState({
        grid: updatedGrid,
        mineCount: this.props.mines - this.getFlags(updatedGrid).length,
    });
}

  handleRightClick(e, x, y) {
    e.preventDefault();
    let updatedGrid = this.state.grid;
    let mines = this.state.mineCount;

    if (updatedGrid[y][x].isRevealed) return;

    if (updatedGrid[y][x].isFlagged) {
      updatedGrid[y][x].isFlagged = 0;
      mines++;
    } else {
      updatedGrid[y][x].isFlagged = 1;
      mines--;
    }

    if (mines === 0) {
      const mineArray = this.getMines(updatedGrid);
      const flagArray = this.getFlags(updatedGrid);
      if (JSON.stringify(mineArray) === JSON.stringify(flagArray)) {
        this.setState({mineCount: 0, gameStatus: "won"});
        this.revealBoard();
        alert('You Won!');
      }
    }

    this.setState({
      grid: updatedGrid,
      mineCount: mines,
    });
  }

  renderBoard(){
    let output = [];
    let row = [];
    let offset = 1;
    for (let y=0; y < this.props.rows; y++){
        for (let x = 0; x< this.props.columns; x++){
            row.push(
                 <Hexagon
                 onClick={() => this.handleCellClick(x, y)}
                 onRightClick={(e) => this.handleRightClick(e, x, y)}
                 x={this.state.grid[y][x].x} 
                 y={this.state.grid[y][x].y} 
                 isMine={this.state.grid[y][x].isMine} 
                 isFlagged={this.state.grid[y][x].isFlagged} 
                 isRevealed={this.state.grid[y][x].isRevealed} 
                 neighbors={this.state.grid[y][x].neighbors}
                 isEmpty={this.state.grid[y][x].isEmpty} 
                 key={x + "," + y}
                 /> 
            )
        }
        
        output.push(<div className={"hex-row " + (offset > 0 ? "even" : "")} key={y}>
        {row}
        </div>);

        offset *= -1;
        row = [];
      }
    return output;
  }

  handleNewGameClick() {
    this.setState({
      grid: this.initializeGrid(),
      status: 'inProgress',
      mineCount: this.props.mines,
    });
  }

  saveToDB() {
    axios
      .post('/cell', this.state.grid)
      .catch(error => {
        console.log(error);
      });
  }

  loadFromDB() {
    axios
      .get('/cell')
      .then(response => {
        let loadedGrid = [];
        let row = [];
        let i = 0;
        for (let y = 0; y < this.props.rows; y++) {
          for (let x = 0; x < this.props.columns; x++) {
            row.push(response.data[i]);
            i++;
          }
          loadedGrid.push(row);
          row=[];
        }
        let flagged = this.getFlags(loadedGrid);
        let mineCount = this.props.mines - flagged.length;
        this.setState({
          grid: loadedGrid,
          mineCount: mineCount,

        });
      })
      .catch(error => {
        console.log(error);
      });
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="mx-auto">
              {this.renderBoard()}           
          </div>
          <div className="mx-auto">
            mines left: {this.state.mineCount}
            <button className="row btn-primary mx-auto" onClick={() => this.handleNewGameClick()}>
              new game
            </button>
            <button className="row btn-warning mx-auto" onClick={() => this.saveToDB()}>
              save game
            </button>
            <button className="row btn-secondary mx-auto" onClick={() => this.loadFromDB()}>
              load game
            </button>
          </div>
        </div>
      </div>
    );
  }
}

class Minesweeper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: 10,
      columns: 10,
      mines: 10
    };
  }

  render() {
    return (
    <div>
      <Grid rows={this.state.rows} columns={this.state.columns} mines={this.state.mines}/>
    </div>);
  }
}


ReactDOM.render(<Minesweeper/>, document.getElementById("minesweeper"));

