GameCtrl.Game = function (game) {

    //        When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    this.game;                //        a reference to the currently running game
    this.add;                //        used to add sprites, text, groups, etc
    this.camera;        //        a reference to the game camera
    this.cache;                //        the game cache
    this.input;                //        the global input manager (you can access this.input.keyboard, this.input.mouse, as well from it)
    this.load;                //        for preloading assets
    this.math;                //        lots of useful common math operations
    this.sound;                //        the sound manager - add a sound, play one, set-up markers, etc
    this.stage;                //        the game stage
    this.time;                //        the clock
    this.tweens;        //        the tween manager
    this.world;                //        the game world
    this.particles;        //        the particle manager
    this.physics;        //        the physics manager
    this.rnd;                //        the repeatable random number generator



};

GameCtrl.Game.prototype = {

    create: function () {


        this.game.stage.backgroundColor = '#333555';
        var NUMBER_OF_PEOPLE = 6;
        this.people = this.game.add.group();
        for(i = 0; i < NUMBER_OF_PEOPLE; i++) {
            x = this.game.rnd.integerInRange(32, this.game.width - 32);
            y = this.game.rnd.integerInRange(32, this.game.height - 32);
            var person = this.game.add.sprite(x, y, 'zombie');
            person.anchor.setTo(0.5, 0.5);
            this.people.add(person);
        }

        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.player = this.add.sprite(this.game.width/2,100,'player');
        this.player.anchor.setTo(0.5,0.5)
        this.game.physics.enable(this.player,Phaser.Physics.ARCADE);
        this.game.directions = [{name:'left', x : -1 , y:0},
            {name:'right', x : 1 , y:0},
            {name:'top', y : -1 , x:0},
            {name:'bottom', y : 1 , x:0}]
        this.player.speed=60;
        this.bitmap = this.game.add.bitmapData(this.game.width, this.game.height);
        this.bitmap.context.fillStyle = 'rgb(255, 255, 255)';
        this.bitmap.context.strokeStyle = 'rgb(255, 255, 255)';
        this.game.add.image(0, 0, this.bitmap);
        this.bitmap2 = this.game.add.bitmapData(this.game.width, this.game.height);
        this.bitmap2.context.fillStyle = 'rgb(255, 255, 255)';
        this.bitmap2.context.strokeStyle = 'rgb(255, 255, 255)';
        var lightBitmap = this.game.add.image(0, 0, this.bitmap2);
        lightBitmap.blendMode = Phaser.blendModes.MULTIPLY;
        this.rayBitmap = this.game.add.bitmapData(this.game.width, this.game.height);
        this.rayBitmapImage = this.game.add.image(0, 0, this.rayBitmap);
        this.rayBitmapImage.visible = true;


        var NUMBER_OF_WALLS = 4;
        this.walls = this.game.add.group();
        var i, x, y;
        for(i = 0; i < NUMBER_OF_WALLS; i++) {
            x = i * this.game.width/NUMBER_OF_WALLS + 50;
            y = this.game.rnd.integerInRange(50, this.game.height - 200);
            var img = this.game.add.sprite(x, y, 'brick')
            img.scale.setTo(this.randomNumber(1,3), this.randomNumber(1,3));
            this.game.physics.enable(img, Phaser.Physics.ARCADE);
            img.body.immovable = true;
            this.walls.add(img)

        }
        this.game.physics.enable(this.walls, Phaser.Physics.ARCADE);




        this.player.body.collideWorldBounds = true;
        this.player.body.bounce.y = 0.8;
        this.player.body.bounce.x = 0.8;
        this.game.startPoint = {};
        this.game.input.onDown.add(function(pointer) {
            this.game.startPoint.x = pointer.clientX;
            this.game.startPoint.y = pointer.clientY;
            console.log(this.game.startPoint)
        }.bind(this), this);

        this.game.input.onUp.add(function(pointer) {

            this.player.body.velocity.x=0
            this.player.body.velocity.y=0
        }.bind(this), this);

    },
    toggleRays : function() {
        // Toggle the visibility of the rays when the pointer is clicked
        if (this.rayBitmapImage.visible) {
            this.rayBitmapImage.visible = false;
        } else {
            this.rayBitmapImage.visible = true;
        }
    },
    update: function () {


        this.bitmap2.context.fillStyle = 'rgb(100, 100, 100)';
        this.bitmap2.context.fillRect(0, 0, this.game.width, this.game.height);

        // An array of the stage corners that we'll use later
        var stageCorners = [
            new Phaser.Point(0, 0),
            new Phaser.Point(this.game.width, 0),
            new Phaser.Point(this.game.width, this.game.height),
            new Phaser.Point(0, this.game.height)
        ];

        // Ray casting!
        // Cast rays through the corners of each wall towards the stage edge.
        // Save all of the intersection points or ray end points if there was no intersection.
        var points = [];
        var ray = null;
        var intersect;
        var i;
        this.walls.forEach(function(wall) {
            // Create a ray from the light through each corner out to the edge of the stage.
            // This array defines points just inside of each corner to make sure we hit each one.
            // It also defines points just outside of each corner so we can see to the stage edges.
            var corners = [
                new Phaser.Point(wall.x+0.1, wall.y+0.1),
                new Phaser.Point(wall.x-0.1, wall.y-0.1),

                new Phaser.Point(wall.x-0.1 + wall.width, wall.y+0.1),
                new Phaser.Point(wall.x+0.1 + wall.width, wall.y-0.1),

                new Phaser.Point(wall.x-0.1 + wall.width, wall.y-0.1 + wall.height),
                new Phaser.Point(wall.x+0.1 + wall.width, wall.y+0.1 + wall.height),

                new Phaser.Point(wall.x+0.1, wall.y-0.1 + wall.height),
                new Phaser.Point(wall.x-0.1, wall.y+0.1 + wall.height)
            ];

            // Calculate rays through each point to the edge of the stage
            for(i = 0; i < corners.length; i++) {
                var c = corners[i];

                // Here comes the linear algebra.
                // The equation for a line is y = slope * x + b
                // b is where the line crosses the left edge of the stage
                var slope = (c.y - this.player.y) / (c.x - this.player.x);
                var b = this.player.y - slope * this.player.x;

                var end = null;

                if (c.x === this.player.x) {
                    // Vertical lines are a special case
                    if (c.y <= this.player.y) {
                        end = new Phaser.Point(this.player.x, 0);
                    } else {
                        end = new Phaser.Point(this.player.x, this.game.height);
                    }
                } else if (c.y === this.player.y) {
                    // Horizontal lines are a special case
                    if (c.x <= this.player.x) {
                        end = new Phaser.Point(0, this.player.y);
                    } else {
                        end = new Phaser.Point(this.game.width, this.player.y);
                    }
                } else {
                    // Find the point where the line crosses the stage edge
                    var left = new Phaser.Point(0, b);
                    var right = new Phaser.Point(this.game.width, slope * this.game.width + b);
                    var top = new Phaser.Point(-b/slope, 0);
                    var bottom = new Phaser.Point((this.game.height-b)/slope, this.game.height);

                    // Get the actual intersection point
                    if (c.y <= this.player.y && c.x >= this.player.x) {
                        if (top.x >= 0 && top.x <= this.game.width) {
                            end = top;
                        } else {
                            end = right;
                        }
                    } else if (c.y <= this.player.y && c.x <= this.player.x) {
                        if (top.x >= 0 && top.x <= this.game.width) {
                            end = top;
                        } else {
                            end = left;
                        }
                    } else if (c.y >= this.player.y && c.x >= this.player.x) {
                        if (bottom.x >= 0 && bottom.x <= this.game.width) {
                            end = bottom;
                        } else {
                            end = right;
                        }
                    } else if (c.y >= this.player.y && c.x <= this.player.x) {
                        if (bottom.x >= 0 && bottom.x <= this.game.width) {
                            end = bottom;
                        } else {
                            end = left;
                        }
                    }
                }

                // Create a ray
                ray = new Phaser.Line(this.player.x, this.player.y, end.x, end.y);

                // Check if the ray intersected the wall
                intersect = this.getWallIntersection(ray);
                if (intersect) {
                    // This is the front edge of the light blocking object
                    points.push(intersect);
                } else {
                    // Nothing blocked the ray
                    points.push(ray.end);
                }
            }
        }, this);

        // Shoot rays at each of the stage corners to see if the corner
        // of the stage is in shadow. This needs to be done so that
        // shadows don't cut the corner.
        for(i = 0; i < stageCorners.length; i++) {
            ray = new Phaser.Line(this.player.x, this.player.y,
                stageCorners[i].x, stageCorners[i].y);
            intersect = this.getWallIntersection(ray);
            if (!intersect) {
                // Corner is in light
                points.push(stageCorners[i]);
            }
        }

        // Now sort the points clockwise around the light
        // Sorting is required so that the points are connected in the right order.
        //
        // This sorting algorithm was copied from Stack Overflow:
        // http://stackoverflow.com/questions/6989100/sort-points-in-clockwise-order
        //
        // Here's a pseudo-code implementation if you want to code it yourself:
        // http://en.wikipedia.org/wiki/Graham_scan
        var center = { x: this.player.x, y: this.player.y };
        points = points.sort(function(a, b) {
            if (a.x - center.x >= 0 && b.x - center.x < 0)
                return 1;
            if (a.x - center.x < 0 && b.x - center.x >= 0)
                return -1;
            if (a.x - center.x === 0 && b.x - center.x === 0) {
                if (a.y - center.y >= 0 || b.y - center.y >= 0)
                    return 1;
                return -1;
            }

            // Compute the cross product of vectors (center -> a) x (center -> b)
            var det = (a.x - center.x) * (b.y - center.y) - (b.x - center.x) * (a.y - center.y);
            if (det < 0)
                return 1;
            if (det > 0)
                return -1;

            // Points a and b are on the same line from the center
            // Check which point is closer to the center
            var d1 = (a.x - center.x) * (a.x - center.x) + (a.y - center.y) * (a.y - center.y);
            var d2 = (b.x - center.x) * (b.x - center.x) + (b.y - center.y) * (b.y - center.y);
            return 1;
        });

        // Connect the dots and fill in the shape, which are cones of light,
        // with a bright white color. When multiplied with the background,
        // the white color will allow the full color of the background to
        // shine through.
        this.bitmap2.context.beginPath();
        this.bitmap2.context.fillStyle = 'rgb(255, 255, 255)';
        this.bitmap2.context.moveTo(points[0].x, points[0].y);
        for(var j = 0; j < points.length; j++) {
            this.bitmap2.context.lineTo(points[j].x, points[j].y);
        }
        this.bitmap2.context.closePath();
        this.bitmap2.context.fill();

        // Draw each of the rays on the rayBitmap
        this.rayBitmap.context.clearRect(0, 0, this.game.width, this.game.height);
        this.rayBitmap.context.beginPath();
        this.rayBitmap.context.strokeStyle = 'rgb(255, 255, 255)';
        this.rayBitmap.context.fillStyle = 'rgb(255, 255, 255)';
        this.rayBitmap.context.moveTo(points[0].x, points[0].y);
        for(var k = 0; k < points.length; k++) {
            this.rayBitmap.context.moveTo(this.player.x, this.player.y);
            this.rayBitmap.context.lineTo(points[k].x, points[k].y);
            this.rayBitmap.context.fillRect(points[k].x-2, points[k].y-2, 4, 4);
        }
        this.rayBitmap.context.stroke();

        // This just tells the engine it should update the texture cache
        this.bitmap2.dirty = true;
        this.rayBitmap.dirty = true;
        this.rayBitmapImage.visible = false;
        
        
        this.game.physics.arcade.collide(this.player, this.walls);
        this.walls.forEach(function(wall) {
            this.people.forEach(function(person) {
                if (person.overlap(wall)) {
                    if (wall.width > wall.height) {
                        person.y += 64;
                    } else {
                        person.x += 64;
                    }
                }
            }, this);
        }, this);
        this.bitmap.context.clearRect(0, 0, this.game.width, this.game.height);

        this.listenSwipe(this.game,function(direction){
            if(this.player.direction!=direction){
                //this.player.last_change={x : Math.round(this.player.x), y : Math.round(this.player.y) , direction : direction}
                //this.player.direction = direction;
                this.player.body.velocity.x = direction.x;
                this.player.body.velocity.y = direction.y;
            }
        }.bind(this))



        //this.game.directions.forEach(function(d){
        //    if(this.player.direction == d.name){
        //        this.player.body.velocity.x = this.player.speed * d.x;
        //        this.player.body.velocity.y = this.player.speed * d.y;
        //    }
        //}.bind(this))

        this.people.forEach(function(person) {
            var ray = new Phaser.Line(person.x, person.y, this.player.x, this.player.y);
            var intersect = this.getWallIntersection(ray);
            if (intersect) {
                person.tint = 0xffffff;
            } else {
                person.tint = 0xffaaaa;
                console.log()
                //this.bitmap.context.beginPath();
                //this.bitmap.context.moveTo(person.x, person.y);
                //this.bitmap.context.lineTo(this.player.x, this.player.y);
                //this.bitmap.context.stroke();
            }
        }, this);

        this.bitmap.dirty = true;

    },
    render: function(){

    },
    quitGame: function (pointer) {
        this.game.state.start('MainMenu');
    },
    randomNumber: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    listenSwipe: function (game,callback) {
        var eventDuration;
        var endPoint = {};
        var direction;
        var minimum = {
            duration: 10,
            distance: 10
        }

        if (game.input.activePointer.isDown){
            console.log([game.startPoint.x, game.input.activePointer.x])
            console.log([game.startPoint.y, game.input.activePointer.y])
            direction = '';

            endPoint.x = game.input.activePointer.x;
            endPoint.y = game.input.activePointer.y;

            // Check direction
            if (endPoint.x - game.startPoint.x > minimum.distance) {
                direction = 'right';
            }
            if (game.startPoint.x - endPoint.x > minimum.distance) {
                direction = 'left';
            }
            if (endPoint.y - game.startPoint.y > minimum.distance) {
                direction = 'bottom';
            }
            if (game.startPoint.y - endPoint.y > minimum.distance) {
                direction = 'top';
            }

            var speed = { x:endPoint.x-game.startPoint.x, y:endPoint.y - game.startPoint.y}

            //if (direction) {
            //    callback(direction);
            //}
            callback(speed)
        }

        //game.input.is.add(function(pointer) {
        //
        //    direction = '';
        //
        //        endPoint.x = pointer.clientX;
        //        endPoint.y = pointer.clientY;
        //
        //        // Check direction
        //        if (endPoint.x - startPoint.x > minimum.distance) {
        //            direction = 'right';
        //        } else if (startPoint.x - endPoint.x > minimum.distance) {
        //            direction = 'left';
        //        } else if (endPoint.y - startPoint.y > minimum.distance) {
        //            direction = 'bottom';
        //        } else if (startPoint.y - endPoint.y > minimum.distance) {
        //            direction = 'top';
        //        }
        //
        //
        //        if (direction) {
        //            callback(direction);
        //        }
        //
        //}, this);
    },
    getWallIntersection : function(ray) {
    var distanceToWall = Number.POSITIVE_INFINITY;
    var closestIntersection = null;

    this.walls.forEach(function(wall) {
        var lines = [
            new Phaser.Line(wall.x, wall.y, wall.x + wall.width, wall.y),
            new Phaser.Line(wall.x, wall.y, wall.x, wall.y + wall.height),
            new Phaser.Line(wall.x + wall.width, wall.y,
                wall.x + wall.width, wall.y + wall.height),
            new Phaser.Line(wall.x, wall.y + wall.height,
                wall.x + wall.width, wall.y + wall.height)
        ];
        for(var i = 0; i < lines.length; i++) {
            var intersect = Phaser.Line.intersects(ray, lines[i]);
            if (intersect) {
                // Find the closest intersection
                distance =
                    this.game.math.distance(ray.start.x, ray.start.y, intersect.x, intersect.y);
                if (distance < distanceToWall) {
                    distanceToWall = distance;
                    closestIntersection = intersect;
                }
            }
        }
    }, this);

    return closestIntersection;
}

};

