import {MAX_LINE_POINTS_LENGTH, RPS} from "../../configs/config";
import LogicCircle from "../../models/Circle/LogicCircle";
import {
    CIRCLE_DROP,
    LEVEL_COMPLETE,
    LEVEL_EVENT,
    LEVEL_FAILED, LEVEL_LOAD,
    LEVEL_RELOAD, LEVEL_START, LEVEL_STOP, LINE_ADD_POINT, LINE_DROP,
    LINE_GO, LINE_INPUT,
    LINE_UPDATED
} from "../single_components/Events";
import LogicLine from "../../models/Line/LogicLine";
import Multiplayer from "../Multiplayer";
import {
    LINE_ENEMY_CREATE,
    LINE_FINISH_INPUT,
    MULT_COMP_START,
    PLAYER_FAILURE,
    PLAYER_SUCCESS
} from "./MultiplayerEvents";
import Point from "../../models/Point/Point";


export default class MultiplayerLogic {
    constructor(game) {
        this._game = game;

        this._reconDelay = 1000 / RPS;

        this._stop = true;

        this._walls = [];
        this._player = {
            circles: [],
            circlesNum: 0,
            line: null,
            stepsToDeath: MAX_LINE_POINTS_LENGTH
        };
        this._enemy = {
            circles: [],
            circlesNum: 0,
            line: null,
            stepsToDeath: MAX_LINE_POINTS_LENGTH
        };
    }

    init() {
        this._game.on(MULT_COMP_START, this.start.bind(this), false);
        this._game.on(LEVEL_LOAD, this.loadLevel.bind(this), false);
        this._game.on(LEVEL_STOP, this.stop.bind(this), false);

        this._game.on(LINE_INPUT, this.startLineInput.bind(this), false);
        this._game.on(LINE_ADD_POINT, this.addPointInLine.bind(this), false);
        this._game.on(LINE_FINISH_INPUT, this.finishLineInput.bind(this), false);
        this._game.on(LINE_ENEMY_CREATE, this.createEnemyLine.bind(this), false);
        this._game.on(LINE_DROP, this.dropLine.bind(this), false);

        this._game.on(CIRCLE_DROP, this.dropCircle.bind(this), false);
    }

    doGameProcessing() {
        if (this._player.line) {
            this._player.stepsToDeath--;
            if (!this._player.line.step() || this._player.stepsToDeath === 0) {
                console.log("LINE_DROP player");
                console.log("STD:", this._player.stepsToDeath);
                this._game.emit(LINE_DROP, "player");
                this._game.emit(PLAYER_FAILURE);
            } else {
                this._game.emit(LINE_UPDATED, {playerLine: this._player.line.copyLine()});
            }
        }

        if (this._enemy.line) {
            this._enemy.stepsToDeath--;
            if (!this._enemy.line.step() || this._enemy.stepsToDeath === 0) {
                console.log("LINE_DROP enemy");
                console.log("STD:", this._enemy.stepsToDeath);
                this._game.emit(LINE_DROP, "enemy");
            } else {
                this._game.emit(LINE_UPDATED, {enemyLine: this._enemy.line.copyLine()});
            }
        }

        this.checkCollision();
    }

    reckon() {
        switch (this._game.state) {
            case Multiplayer.STATES.GAME_PROCESSING:
                this.doGameProcessing();
                break;
            case Multiplayer.STATES.INPUTTING_LINE:
            case Multiplayer.STATES.PRESENTATION_PLAYERS:
            case Multiplayer.STATES.WAITING_SERVER:
            case Multiplayer.STATES.WAITING_PLAYERS:
            case Multiplayer.STATES.GAME_PREVIEW:
            case Multiplayer.STATES.END_SUCCESS:
            case Multiplayer.STATES.END_FAILURE:
                break;
        }
    }

    loopCallback() {
        if (!this._stop) {
            this.reckon();
            window.setTimeout(this.loopCallback.bind(this), this._reconDelay);
        }
    }

    start() {
        if (this._stop) {
            this._stop = false;
            this.loopCallback();
        }
    }

    stop() {
        this._stop = true;
    }

    loadLevel(level) {
        this._walls = [];
        this._player.circles = [];
        this._player.circlesNum = 0;
        this._enemy.circles = [];
        this._enemy.circlesNum = 0;

        level.circles.forEach((circle) => {
            this.addCircle(circle);
        });
    }

    addCircle(circle) {
        if (circle !== undefined) {
            if (circle.type === "goal") {
                this._player.circles[circle.num] = new LogicCircle(circle);
                this._player.circlesNum++;
                this._enemy.circles[circle.num] = new LogicCircle(circle);
                this._enemy.circlesNum++;
            } else if (circle.type === "wall") {
                this._walls[circle.num] = new LogicCircle(circle);
            }
        }
    }

    dropCircle({player, num}) {
        if (player === "player") {
            delete this._player.circles[num];
            this._player.circlesNum--;
            if (this._player.circlesNum === 0) {
                this._game.emit(PLAYER_SUCCESS);
                this._game.emit(LINE_DROP, "player");
            }
        } else {
            delete this._enemy.circles[num];
            this._enemy.circlesNum--;
            if (this._enemy.circlesNum === 0) {
                this._game.emit(LINE_DROP, "enemy");
            }
        }
    }

    startLineInput(point) {
        if (this._stop) {
            return;
        }

        this._player.line = new LogicLine(point, this._game.window);
        this._inputting = true;
    }

    finishLineInput() {
        if (!this._inputting) {
            return;
        }
        this._inputting = false;
        this._player.line.finishLine();
    }

    addPointInLine(point) {
        if (!this._inputting) {
            return;
        }

        this._player.line.addPoint(point.copy());
        this._game.emit(LINE_UPDATED, {playerLine: this._player.line.copyLine()});

        this.checkCollision();
    }

    dropLine(player) {
        if (player === "player") {
            this._player.line = null;
            this._player.stepsToDeath = MAX_LINE_POINTS_LENGTH;
        } else {
            this._enemy.line = null;
            this._player.stepsToDeath = MAX_LINE_POINTS_LENGTH;
        }
    }

    checkCollision() {
        if (this._player.line === null && this._enemy.line === null) {
            return;
        }

        if (this._player.circlesNum > 0 && this._player.line) {
            this.checkCollisionGroup("player", this._walls, this._player.line);
            this.checkCollisionGroup("player", this._player.circles, this._player.line);
        }
        if (this._enemy.circlesNum > 0 && this._enemy.line) {
            this.checkCollisionGroup("enemy", this._walls, this._enemy.line);
            this.checkCollisionGroup("enemy", this._enemy.circles, this._enemy.line);
        }
    }

    checkCollisionGroup(player, circles, line) {
        circles.forEach((circle) => {
            this.checkIntersection(player, line, circle);
        });
    }

    checkIntersection(player, line, circle) {
        if (line && circle.
            isIntersectedWithSegment(line.getLastLine())) {
            switch (circle.type) {
                case "wall":
                    this._game.emit(LINE_DROP, player);
                    console.log("LINE_DROP", player, "wall");
                    if (player === "player") {
                        this._game.emit(PLAYER_FAILURE);
                    }
                    break;
                case "goal":
                    console.log("CIRCLE_DROP", player, circle.num);
                    if (this._game._state !== Multiplayer.STATES.INPUTTING_LINE) {
                        this._game.emit(CIRCLE_DROP, {player: player, num: circle.num});
                    }
                    break;
                default:
                    break;
            }
            if (this._inputting) {
                this._game.emit(LINE_FINISH_INPUT);
            }
        }
    }

    createEnemyLine(line) {
        if (!line) {
            return;
        }
        this._enemy.line = new LogicLine(new Point(line.base_point.x, line.base_point.y),
            this._game.window);
        line.points.forEach((point) => {
            this._enemy.line.addPoint(new Point(point.x, point.y), true);
        });

        this._enemy.line.finishLine();

        this._game.emit(LINE_UPDATED, {enemyLine: this._enemy.line.copyLine()});
    }
}