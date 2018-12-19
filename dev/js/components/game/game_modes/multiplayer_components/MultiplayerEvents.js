const MULT_START = "MULT_START";
const MULT_COMP_START = "MULT_COMP_START";

const STATE_CHANGE = "STATE_CHANGE";

const SERVER_CONNECTED = 1;
const SERVER_LOADING = 2;
const SERVER_DATA_LOADED = 11;
const SERVER_START_INPUT = 12;
const SERVER_FINISH_INPUT = 13;
const SERVER_INPUTTED_LINE = 14;
const SERVER_START_GAME = 15;
const SERVER_PLAYER_SUCCESS = 17;
const SERVER_PLAYER_FAILURE = 18;
const SERVER_FINISH_GAME = 16;
const SERVER_ENEMY_LEFT = 8;
const SERVER_STATUS_SUCCESS = "success";
const SERVER_STATUS_FAILURE = "failure";

const LINE_ENEMY_CREATE = "LINE_ENEMY_CREATE";
const LINE_FINISH_INPUT = "LINE_FINISH_INPUT";
const LINE_REFRESH = "LINE_REFRESH";

const PLAYER_SUCCESS = "PLAYER_SUCCESS";
const PLAYER_FAILURE = "PLAYER_FAILURE";

export {
    MULT_START,
    MULT_COMP_START,

    STATE_CHANGE,

    SERVER_CONNECTED,
    SERVER_LOADING,
    SERVER_DATA_LOADED,
    SERVER_START_INPUT,
    SERVER_FINISH_INPUT,
    SERVER_INPUTTED_LINE,
    SERVER_START_GAME,
    SERVER_PLAYER_SUCCESS,
    SERVER_PLAYER_FAILURE,
    SERVER_FINISH_GAME,
    SERVER_ENEMY_LEFT,
    SERVER_STATUS_SUCCESS,
    SERVER_STATUS_FAILURE,

    LINE_ENEMY_CREATE,
    LINE_FINISH_INPUT,
    LINE_REFRESH,

    PLAYER_SUCCESS,
    PLAYER_FAILURE
};