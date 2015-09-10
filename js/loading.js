var $ = require(`${__dirname}/lib/jquery-1.11.2.min.js`);

function loadGame() {
    $('#paper').remove();
    $('#content').load('ajax/game.html');
}

function loadStart() {
    $('#paper').remove();
    $('#content').load('ajax/start.html');
}

function loadScores() {
    $('#paper').remove();
    $('#content').load('ajax/scores.html');
}

function loadDeath() {
    $('#paper').remove();
    $('#content').load('ajax/death.html');
}

$(function() {
  loadGame();
});
