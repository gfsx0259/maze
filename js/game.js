
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var maze = function(board, size){
    this.init(board, size);
    this.drawPath();
};

maze.prototype = {
    config: {},
    field: [],
    init: function (board, size) {
        this.config = {
            fieldElement: board,
            size: size
        };
        // render and create map
        for (var i = 0; i < this.config.size; i++) {
            var row = [];
            for (var j = 0; j < this.config.size; j++) {
                row.push(-1);
                this.config.fieldElement.append($('<div>', {
                    class: 'rectangle',
                    id: 'cell-' + i + '-' + j
                }));
            }
            this.field.push(row);
            this.config.fieldElement.append($('<div>', {
                class: 'clearfix'
            }));
        }
        // render wall cells
        this.generateWall(this.getWallCellsCount(this.config.size));
    },
    getWallCellsCount:function(size){
        return parseInt(size + size / 2);
    },
    generateWall: function(count){
        this.dumpField();

        // for testing
        var debug = [
            [3,2],
            [0,3],
            [2,4],
            [4,4],
            [4,2]
        ];

        for(var i in debug){
            var cell = debug[i];
            this.addClass(cell[0], cell[1], 'wall');
            this.field[cell[0]][cell[1]] = -2;
        }

        //while(count){
        //    var x = getRandomInt(0, this.config.size - 1);
        //    var y = getRandomInt(0, this.config.size - 1);
        //    if(this.field[x][y]==-1){
        //        this.addClass(x, y, 'wall');
        //        this.field[x][y] = -2;
        //        count-=1;
        //    }
        //
        //}
        this.dumpField();
    },
    dumpField:function(){
        console.info(JSON.parse(JSON.stringify(this.field)).join('\n'));
    },
    addClass:function(x, y, className){
        $('#cell-' + x + '-' + y).addClass(className);
    },
    drawPath: function(){
        this.config.start = [1, 1];
        this.config.finish = [4, 0];
        this.field[this.config.start[0]][this.config.start[1]] = 0;// Begin from start
        this.drawStep(0);
    },
    drawStep:function(step){

        var continueDrawing = false;

        for (var x = 0; x < this.config.size; x++)
            for (var y = 0; y < this.config.size; y++)
            {
                if (this.field[x][y] == step) {
                    // top
                    if (y - 1 >= 0 && this.field[x][y - 1] != -2 && this.field[x][y - 1] == -1){
                        this.field[x][y - 1] = step + 1;
                        continueDrawing = true;
                    }
                    // bottom
                    if (y + 1 < this.config.size && this.field[x][y + 1] != -2 && this.field[x][y + 1] == -1){
                        this.field[x][ y + 1] = step + 1;
                        continueDrawing = true;
                    }
                    // left
                    if (x - 1 >= 0 && this.field[x - 1][y] != -2 && this.field[x - 1][y] == -1){
                        this.field[x - 1][y] = step + 1;
                        continueDrawing = true;
                    }
                    // right
                    if (x + 1 < this.config.size && this.field[x + 1][ y] != -2 && this.field[x + 1][ y] == -1){
                        this.field[x + 1][y] = step + 1;
                        continueDrawing = true;
                    }
                }
            }

        this.dumpField();
        // if path has been found or we can say exactly that it's not possible
        if(this.field[this.config.finish[0]][this.config.finish[1]] != -1 || !continueDrawing){
            this.renderPath(step);
            return false;
        }

        this.drawStep(++step);
    },
    renderPath:function(step){
        var currentCell = this.config.finish;

        var shifts =  [[0, 1], [1, 0], [0, -1], [-1, 0]];
        while(step >= 0){
            for(var i in shifts){
                var shift = shifts[i];
                var verifiableCell = [currentCell[0] + shift[0], currentCell[1] + shift[1]];
                if(this.field[verifiableCell[0]][verifiableCell[1]] == step){
                    currentCell = verifiableCell;
                    this.addClass(currentCell[0],currentCell[1],'path');
                    step--;
                    break;
                }
            }
        }
    }
};

$(document).ready(function(){
    new maze($('#maze-field'), 5);
});
