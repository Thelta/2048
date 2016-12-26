function Bot()
{
    this.size = 4;
    this.euclidGrids = [];  //Her bir köşe için her noktanın öklit uzaklıkları
    this.cornerCo = [{x:0,y:0}, {x:0,y:3}, {x:3,y:0}, {x:3,y:3}];   //köşeler
    for(var i = 0; i < 4; i++)  //euclidGrids hesaplanması
    {
        var cornerX = this.cornerCo[i].x, cornerY = this.cornerCo[i].y;
        this.euclidGrids[i] = [[],[],[],[]];
        for(var y = 0; y < 4; y++)
        {
            for(var x = 0; x < 4; x++)
            {
                var diffX = 4 - Math.abs(cornerX - x), diffY = 4 - Math.abs(cornerY - y);
                this.euclidGrids[i][y][x] = Math.sqrt(diffX * diffX + diffY * diffY);
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

//En büyük değerli köşeyi bul
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

//Evaluation fonksiyonu
Bot.prototype.firstEvalFunc = function(grid)
{
    var maxCell = this.findCornerTile(grid);
    var xModifier = this.cornerCo[maxCell].x == 0 ? 1 : -1;
    var yModifier = this.cornerCo[maxCell].y == 0 ? 1 : -1;
    var x, countX;
    var y, countY;
    var totalValue = 0;

    //Tablodaki her değer için
    for(y = this.cornerCo[maxCell].y, countY = 0; countY < 4; y += 1 * yModifier, countY++)
    {
        for(x = this.cornerCo[maxCell].x, countX = 0; countX < 4; x += 1 * xModifier, countX++)
        {
            var cell = grid.cellContent({x: x, y: y});
            if(cell)
            {                
                var xCell = grid.cellContent({x: x + xModifier, y: y}); //Değerin sağındaki değer
                var yCell = grid.cellContent({x: x, y: y + yModifier}); //Değerin yukarısındaki değer
                
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
                }
            }
        }
    }

    return totalValue;
};

Bot.prototype.minMax = function(grid, currentDepth, maxDepth)
{
    if(currentDepth == maxDepth + 1)    //Eğer max derinliğe ulaşılmışsa
    {
        return {score: this.firstEvalFunc(grid)};   //Tablonun değerini hesapla
    }

    if(currentDepth % 2 == 0)   //Max seçimi
    {
        var moves = [];
        for(var i = 0; i < 4; i++)  //Her hareket için
        {
            var newGridObject = this.createNextGrid(grid, i);  //O hareket için grid yarat
            if(newGridObject.moved && this.movesAvailable(newGridObject.grid))  //eğer hareket olduysa ve oyun kaybetme durumu oluşmadıysa
            {
                var value = this.minMax(newGridObject.grid, currentDepth + 1, maxDepth);    //min değerini al
                var emptyTiles = newGridObject.grid.availableCells().length;
                var totalScore = newGridObject.merged * (1 - emptyTiles / 16) * 2 + value.score; //scoru hesapla
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
                if(cell == null)    //Eğer boş noktaysa
                {
                    var newGrid = new Grid(oldGrid.size, oldGrid.cells);
                    newGrid.insertTile(new Tile({x: x, y: y}, 2));  //2 değerini yerleştir
                    if(this.movesAvailable(newGrid))
                    {
                        var value = this.minMax(newGrid, currentDepth + 1, maxDepth); //maxı seç
                        moves.push({score: value.score, place: {x: x, y: y}, value: 2});
                    }
                    else
                    {
                        //var value = this.minMax(newGrid, currentDepth + 1, maxDepth);
                        moves.push({score: -Number.MAX_SAFE_INTEGER, place: {x: x, y: y}});
                    }

                    newGrid = new Grid(oldGrid.size, oldGrid.cells);
                    newGrid.insertTile(new Tile({x: x, y: y}, 4)); //4 değerini yerleştir
                    if(this.movesAvailable(newGrid))
                    {
                        var value = this.minMax(newGrid, currentDepth + 1, maxDepth); //maxı seç
                        moves.push({score: value.score, place: {x: x, y: y}, value: 4});
                    }
                    else
                    {
                        //var value = this.minMax(newGrid, currentDepth + 1, maxDepth);
                        moves.push({score: -Number.MAX_SAFE_INTEGER, place: {x: x, y: y}});
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
