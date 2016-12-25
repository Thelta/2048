function Bot()
{
    this.size = 4;
    this.euclidGrids = [];
    this.cornerCo = [{x:0,y:0}, {x:0,y:3}, {x:3,y:0}, {x:3,y:3}];
    for(var i = 0; i < 4; i++)
    {
        var cornerX = this.cornerCo[i].x, cornerY = this.cornerCo[i].y;
        this.euclidGrids[i] = [[],[],[],[]];
        for(var y = 0; y < 4; y++)
        {
            for(var x = 0; x < 4; x++)
            {
                var diffX = 4 - cornerX + x, diffY = 4 - cornerY + y;
                this.euclidGrids[i][x][y] = Math.sqrt(diffX * diffX + diffY * diffY );
            }
        }
    }    
}

Bot.prototype.findFarthestPosition = GameManager.prototype.findFarthestPosition;
Bot.prototype.createNextGrid = GameManager.prototype.createNextGrid;
Bot.prototype.getVector = GameManager.prototype.getVector;
Bot.prototype.tileMatchesAvailable = GameManager.prototype.tileMatchesAvailable;
Bot.prototype.movesAvailable = GameManager.prototype.movesAvailable;
Bot.prototype.buildTraversals = GameManager.prototype.buildTraversals;
Bot.prototype.prepareTiles = GameManager.prototype.prepareTiles;
Bot.prototype.moveTile = GameManager.prototype.moveTile;
Bot.prototype.positionsEqual = GameManager.prototype.positionsEqual;

Bot.prototype.findCornerTile = function(grid)
{
    var maxCell = 3;
    var maxVal = 0;
    for(var i = 0; i < this.cornerCo.length; i++)
    {
        var value = grid.cellContent(this.cornerCo[i]);
        if(value && maxVal < value.value)
        {
            maxCell = i;
            maxVal = value.value;
        }
    }

    return maxCell;
};

Bot.prototype.firstEvalFunc = function(grid)
{
    var maxCell = this.findCornerTile(grid);
    var xModifier = this.cornerCo[maxCell].x == 0 ? 1 : -1;
    var yModifier = this.cornerCo[maxCell].y == 0 ? 1 : -1;
    var x, countX;
    var y, countY;
    var totalValue = 0;
    var processed = 0;

    for(y = this.cornerCo[maxCell].y, countY = 0; countY < 4; y += 1 * yModifier, countY++)
    {
        for(x = this.cornerCo[maxCell].x, countX = 0; countX < 4; x += 1 * xModifier, countX++)
        {
            var cell = grid.cellContent({x: x, y: y});
            if(cell)
            {                
                var xCell = grid.cellContent({x: x + xModifier, y: y});
                var yCell = grid.cellContent({x: x, y: y + yModifier});
                
                if(xCell)
                {
                    if(cell.value >= xCell.value)
                    {
                        totalValue += xCell.value / cell.value * this.euclidGrids[maxCell][y][x];
                    }
                    else
                    {
                        totalValue -= xCell.value / cell.value * this.euclidGrids[maxCell][y][x];
                    }
                    processed++;
                }

                if(yCell)
                {
                    if(cell.value >= yCell.value)
                    {
                        totalValue += yCell.value / cell.value * this.euclidGrids[maxCell][y][x];
                    }
                    else
                    {
                        totalValue -= yCell.value / cell.value * this.euclidGrids[maxCell][y][x];
                    }
                    processed++;
                }
            }
        }
    }

    return totalValue;
};

Bot.prototype.secondEvalFunct = function(grid, cell, value)
{
    var tile = grid.cellContent(cell);

    var cornerCell = this.findCornerTile(grid);
    var xModifier = this.cornerCo[maxCell].x == 0 ? 1 : -1;
    var yModifier = this.cornerCo[maxCell].y == 0 ? 1 : -1;

    var score = 0;

    var euclidValue = this.euclidGrids[cornerCell][cell.x][cell.y];

    for(var i = 0; i < 4; i++)
    {
        var vector = this.getVector(i);
        var nextTile = grid.cellContent({x: cell.x + vector.x, y: cell.y + vector.y});
        if(nextTile)
        {
            if(vector.x != 0)
            {
                var scoreModifier = vector.x == xModifier ? 1 : -1;
                score += tile / nextTile * scoreModifier * euclidValue;
            }
            else
            {
                var scoreModifier = vector.y == yModifier ? 1 : -1;
                score += tile / nextTile * scoreModifier * euclidValue;
            }
        }
    }

    return score;
}   

Bot.prototype.minMax = function(grid, currentDepth, maxDepth)
{
    //console.log("cd " + currentDepth);
    //console.log("md " + maxDepth);
    if(currentDepth == maxDepth + 1)
    {
        return {score: this.firstEvalFunc(grid)};
    }

    if(currentDepth % 2 == 0)
    {
        var moves = [];
        for(var i = 0; i < 4; i++)
        {
            var newGridObject = this.createNextGrid(grid, i);
            if(newGridObject.moved && this.movesAvailable(newGridObject.grid))
            {
                var value = this.minMax(newGridObject.grid, currentDepth + 1, maxDepth);
                var emptyTiles = newGridObject.grid.availableCells().length;
                var totalScore = newGridObject.merged * (1 - emptyTiles / 16) * 2 + value.score;
                var newMove = {score : totalScore, move : i};
                moves.push(newMove);
            }
            
        }
        if(moves.length > 0)
        {
            moves.sort(function(a,b) {return b.score - a.score});
            return moves[0];
        }
        else
        {
            return {score: -Number.MAX_SAFE_INTEGER, move: 0};
        }
        
    }
    else
    {
        //TODO: avaibleCells
        var moves = [];
        var oldGrid = grid.serialize();
        for(var y = 0; y < 4; y++)
        {
            for(var x = 0; x < 4; x++)
            {
                var cell = grid.cellContent({x: x, y: y});
                if(cell == null)
                {
                    var newGrid = new Grid(oldGrid.size, oldGrid.cells);
                    newGrid.insertTile(new Tile({x: x, y: y}, 2));
                    if(this.movesAvailable(newGrid))
                    {
                        var value = this.minMax(newGrid, currentDepth + 1, maxDepth);
                        moves.push({score: value.score});
                    }

                    newGrid = new Grid(oldGrid.size, oldGrid.cells);
                    newGrid.insertTile(new Tile({x: x, y: y}, 4));
                    if(this.movesAvailable(newGrid))
                    {
                        var value = this.minMax(newGrid, currentDepth + 1, maxDepth);
                        moves.push({score: value.score});
                    }
                }
            }
        }

        if(moves.length > 0)
        {
            moves.sort(function(a,b) {return a.score - b.score});
            return moves[0];
        }
        else
        {
            return {score: Number.MAX_SAFE_INTEGER};
        }
    }
}
