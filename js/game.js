
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var maze = function(size){

    var fieldElement = $('#maze-field');
    var coordinates = [];
    var that = this;

    this.init(fieldElement, size);

    $('#maze-control-restart').click(function() {
        coordinates = [];
        that.init(fieldElement, parseInt($('#maze-control-number').val()));
    });

    fieldElement.on({
        mouseenter: function(){
            if($(this).hasClass('wall')){
                $(this).addClass('unavailable');
            }else{
                $(this).addClass('active');
            }
        },
        mouseleave: function(){
            $(this).removeClass('active unavailable');
        },
        click:function(){
            if($(this).hasClass('wall') || coordinates.length == 2){
                return false;
            }
            //if it's start
            if(!coordinates.length){
                coordinates.push(that.parseCoords(this));
                $(this).addClass('start');
            }else{
                //if it's finish
                coordinates.push(that.parseCoords(this));
                $(this).addClass('finish');
                that.setConfig(coordinates);
                that.drawPath();
            }
        }
    }, '.rectangle');

};

maze.prototype = {
    config: {},
    field: [],
    setConfig: function(coordinates){
        this.config.start = coordinates[0];
        this.config.finish = coordinates[1];
    },
    parseCoords: function(element) {
        var cell_attributes = element.id.split('-');
        return [parseInt(cell_attributes[1]), parseInt(cell_attributes[2])];
    },
    init: function (board, size) {

        this.config = {
            fieldElement: board,
            size: size
        };
        this.config.fieldElement.html('');
        this.field = [];
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
        console.log(this.field);
        // render wall cells
        this.generateWall(this.getWallCellsCount(this.config.size));
    },
    getWallCellsCount:function(size){
        return parseInt(size + size / 2);
    },
    generateWall: function(count){
        this.dumpField();

         //for testing
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
            console.log(this.field);
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

        // if we can say exactly that it's not possible
        if(!continueDrawing){
            alert('Путь не может быть проложен');
            return false;
        }
        // if path has been found
        if(this.field[this.config.finish[0]][this.config.finish[1]] != -1){
            this.renderPath(step);
            return false;
        }
        this.drawStep(++step);
    },
    renderPath:function(step){

        var currentCell = this.config.finish;
        this.addClass(currentCell[0],currentCell[1],'path');
        var trace = [currentCell];

        var shifts =  [[0, 1], [1, 0], [0, -1], [-1, 0]];
        while(step >= 0){
            for(var i in shifts){
                var shift = shifts[i];
                var verifiableCell = [currentCell[0] + shift[0], currentCell[1] + shift[1]];
                if(verifiableCell[0] >= 0 && verifiableCell[0] < this.config.size  && verifiableCell[1] >= 0 && verifiableCell[1] < this.config.size){
                    if(this.field[verifiableCell[0]][verifiableCell[1]] == step){

                        console.log(trace[trace.length-1]);

                        this.addClass(verifiableCell[0],verifiableCell[1],'path');
                        currentCell = verifiableCell;
                        trace.push(currentCell);
                        step--;
                        break;
                    }
                }
            }
        }
        this.detectTurns(trace.reverse());

    },
    detectTurns:function(path){
        for(var i in path){
            var className = [];

            var currentCell, previousCell, nextCell = null;

            currentCell = path[i];
            if(parseInt(i)-1>0) {
                previousCell = path[parseInt(i) - 1];
            }

            if(parseInt(i)+1<path.length) {
                nextCell = path[parseInt(i) + 1];
            }

            if(previousCell && nextCell){
                if(previousCell[0]<currentCell[0] && nextCell[1]>currentCell[1]){
                    console.log('turn bottom right');
                }
                if(previousCell[0]<currentCell[0] && nextCell[1]<currentCell[1]){
                    console.log('turn bottom left');
                }
                if(previousCell[0]>currentCell[0] && nextCell[1]>currentCell[1]){
                    console.log('turn top right');
                }
                if(previousCell[0]>currentCell[0] && nextCell[1]<currentCell[1]){
                    console.log('turn top left');
                }
            }

            if(parseInt(i)+1<path.length){
                var nextCell = path[parseInt(i)+1];
                if(currentCell[0]>nextCell[0]){
                    console.info('top');
                }
                if(currentCell[0]<nextCell[0]){
                    console.info('bottom');
                }

                if(currentCell[1]>nextCell[1]){
                    console.info('left');
                }
                if(currentCell[1]<nextCell[1]){
                    console.info('right');
                }

            }






        }
        console.log(path);
    }

};

$(document).ready(function(){
   new maze(parseInt($('#maze-control-number').val()));
});
