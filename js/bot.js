function Bot()
{
    this.euclidGrids = [];
    this.cornerCo = [{x:0,y:0}, {x:0,y:3}, {x:3,y:0}, {x:3,y:3}];
    for(var i = 0; i < 4; i++)
    {
        var cornerX = this.edgeCo[i].x, cornerY = this.edgeCo[i].y;
        this.euclidGrids[i] = [[],[],[],[]];
        for(var y = 0; y < 4; y++)
        {
            for(var x = 0; x < 4; x++)
            {
                var diffX = 4 - cornerX + x, diffY = 4 - cornerY + y;
                this.euclidGrids[i][x][y] = Math.sqrt(diffX * diffX + diffY * diffY);
            }
        }
    }    
}

Bot.prototype.firstEvalFunc = function(grid)
{
    var totalValue = 0;

    var maxCell = 0;
    var maxVal = 0;
    for(var i = 0; i < this.cornerCo.length; i++)
    {
        var val = grid.cellContent(cornerCo[i]);
        if(val && maxVal < val)
        {
            maxCell = i;
            maxVal = val;
        }
    }

    var xModifier = cornerCo[maxCell].x == 0 ? 1 : -1;
    var yModifier = cornerCo[maxCell].y == 0 ? 1 : -1;
    var x, countX;
    var y, countY;

    for(y = cornerCo[maxCell].y, countY = 0; countY < 4; y += 1 * yModifier, countY++)
    {
        for(x = cornerCo[maxCell].x, countX = 0; countX < 4; x += 1 * xModifier, countX++)
        {
            var cell = grid.cellContent({x: x, y: y});
            if(cell)
            {                
                var xCell = grid.cellContent({x: x + xModifier, y: y});
                var yCell = grid.cellContent({x: x, y: y + yModifier});
                
                if(xCell)
                {
                    if(cell == xCell)
                    {
                        totalValue += cell * (this.euclidGrids[maxCell][y][x] + this.euclidGrids[maxCell][y][x + xModifier]);
                    }
                    if(cell >= xCell)
                    {
                        totalValue += cell * this.euclidGrids[maxCell][y][x];
                    }
                    else
                    {
                        totalValue -= cell * this.euclidGrids[maxCell][y][x];
                    }
                }

                if(yCell)
                {
                    if(cell == yCell)
                    {
                        totalValue += cell * (this.euclidGrids[maxCell][y][x] + this.euclidGrids[maxCell][y + yModifier][x]);
                    }
                    if(cell > yCell)
                    {
                        totalValue += cell * this.euclidGrids[maxCell][y][x];
                    }
                    else
                    {
                        totalValue -= cell * this.euclidGrids[maxCell][y][x];
                    }
                }
            }
        }
    }

    return totalValue;
};
