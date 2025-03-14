const gameCells = document.querySelectorAll('.gamecell');
const resetGameboardButton = document.querySelector('.resetGameboard');
const resetScoresButton = document.querySelector('.resetScores')

const namesDialog = document.querySelector('.names-dialog');
const namesDialogButton = namesDialog.querySelector('button');

const Player = (name, symbol) => {
    let score = 0

    const getSymbol = () => symbol;
    const getName = () => name;
    const getScore = () => score
    const incrementScore = () => score++
    const clearScore = () => {score = 0}
    return {getSymbol, getName, getScore, incrementScore, clearScore};
}

//Inicialization of Players
namesDialog.showModal();
namesDialogButton.addEventListener('click', (event) => {
    const form = namesDialog.querySelector('form');
    const player1Name = form.querySelector('#name1');
    const player2Name = form.querySelector('#name2');
    if (form.checkValidity()) {
        event.preventDefault(); // Don't want to submit this form
        const player1 = Player(player1Name.value, 'X');
        const player2 = Player(player2Name.value, 'O');

        namesDialog.close();
        gameInitialization(player1, player2);
    } 
});

//Game Initialization after player names being chosen
function gameInitialization(player1, player2) {
    const gameBoard = (() => {
        let gameBoardArray = [null, null, null, null, null, null, null, null, null];
    
        const addToArray = (symbol, position) => {
            gameBoardArray[position] = symbol;
        }
    
        const clearArray = () => {
            gameBoardArray = [null, null, null, null, null, null, null, null, null];
        }
    
        const getGameBoardRows = () => {
            const copyGameArray = [...gameBoardArray];
            const res = [];
            for (let i = 0; i < gameBoardArray.length / 3; i++) {
                res.push(copyGameArray.splice(0, 3));
            }
            return res;
        }
    
        const getGameBoardColumns = () => {
            const copyGameArray = [...gameBoardArray];
            const res = [[],[],[]];
            for (let i = 0; i < gameBoardArray.length; i++) {
                if (i % 3 === 0) {
                    res[0].push(copyGameArray[i]);
                } else if (i % 3 === 1) {
                    res[1].push(copyGameArray[i]);
                } else {
                    res[2].push(copyGameArray[i]);
                }
            }
            return res;
        }
    
        const getGameBoardDiagonals = () => {
            const copyGameArray = [...gameBoardArray];
            const diagonal1 = [copyGameArray[0], copyGameArray[4], copyGameArray[8]];
            const diagonal2 = [copyGameArray[2], copyGameArray[4], copyGameArray[6]];
            return [diagonal1, diagonal2];
        }
    
        const areItemsOfArrayEqual = (arr) => {
            const res = {
                areItemsEqual: null,
                winnerSymbol: ''
            };
            for (let i = 0; i < arr.length - 1; i++) {
                if (arr[i] !== arr[i + 1] || arr[i] === null) {
                    res.areItemsEqual = false;
                    return res;
                }
            }
            res.areItemsEqual = true;
            res.winnerSymbol = arr[0];
            return res;
        } 
    
        const checkWinner = () => {
            const gameRows = getGameBoardRows();
            const gameColumns = getGameBoardColumns();
            const gameDiagonals = getGameBoardDiagonals();
            const gameCombinations = [...gameRows, ...gameColumns, ...gameDiagonals];
    
            const result = {
                hasSomeoneWon: false,
                tie: false,
                winnerSymbol: '',
            };
            
            //Checks if there is a winner
            for (let i = 0; i < gameCombinations.length; i++) {
                const localRes = areItemsOfArrayEqual(gameCombinations[i]);
                if (localRes.areItemsEqual) {
                    result.hasSomeoneWon = true;
                    result.winnerSymbol = localRes.winnerSymbol;
                    return result;
                };
            }
    
            //Checks tie
            if (!gameBoardArray.includes(null)) {
                result.tie = true;
                return result;
            }
    
            return result;
        }
    
        return {addToArray, clearArray, checkWinner};
    
    })();

    const displayController = (() => {
        const playerTurnTitle = document.querySelector('.turns');
        const player1ScoreTitle = document.getElementById('player1');
        const player1Score = document.getElementById('player1-score');
        const player2ScoreTitle = document.getElementById('player2');
        const player2Score = document.getElementById('player2-score');
        const winnerDialog = document.querySelector('.result-dialog');
        const winnerDialogMessage = winnerDialog.querySelector('h1');
    
        // Close dialog when click outside form
        winnerDialog.addEventListener('click', (event) => {
            if (event.target === winnerDialog) {
                winnerDialog.close();
            }
        });
        
        const addPlayerSymbol = (target, symbol) => {
            target.textContent = symbol;
        }
    
        const changePlayerTurnTitle = (message) => {
            playerTurnTitle.textContent = message;
        }

        const showPlayerScoreTitle = () => {
            player1ScoreTitle.textContent = `${player1.getName()}:`
            player2ScoreTitle.textContent = `${player2.getName()}:`
        }

        const updateScores = () => {
            player1Score.textContent = player1.getScore();
            player2Score.textContent = player2.getScore();
        }
    
        const showResultDialog = (message) => {
            winnerDialogMessage.textContent = message;
            winnerDialog.showModal();
        }

        const cleanScoreboard = () => {
            player1.clearScore()
            player2.clearScore()            
        }
    
        const cleanGameboard = () => {
            gameCells.forEach(cell => {cell.textContent = ''})
        }
    
        return {addPlayerSymbol, changePlayerTurnTitle, showPlayerScoreTitle, updateScores, showResultDialog, cleanGameboard, cleanScoreboard};
        
    })();
    
    const game = ((firstPlayer, secondPlayer) => {

        let currentPlayer = firstPlayer;
        let gameEnded = false;
    
        //Initialization of PlayerTurnTitle
        displayController.changePlayerTurnTitle(`${currentPlayer.getName()}'s Turn`);
        displayController.showPlayerScoreTitle();
    
    
        const makePlayerMove = (cell, player) => {
            if(cell.textContent !== '') return true;
    
            displayController.addPlayerSymbol(cell, player.getSymbol() );
            gameBoard.addToArray(player.getSymbol(), cell.dataset.position);
            return false;
        }
    
        const parseSymbolToPlayer = (symbol, player1, player2) => {
            switch (symbol) {
                case player1.getSymbol():
                    return player1;
        
                case player2.getSymbol():
                    return player2;
    
                default:
                    throw new Error('Invalid symbol provided');
            }
        }
    
        const processGameResult = (player1, player2) => {
            const res = {gameEnded: false};
            
            const winnerObj = gameBoard.checkWinner();
            if (winnerObj.hasSomeoneWon) {
                const winnerPlayer = parseSymbolToPlayer(winnerObj.winnerSymbol, player1, player2);
                const message = `${winnerPlayer.getName()} Wins!`;
                displayController.showResultDialog(message);
                winnerPlayer.incrementScore();
                displayController.updateScores();
                res.gameEnded = true;
            }
            else if (winnerObj.tie) {
                const message = `It's a Tie`;
                displayController.showResultDialog(message);
                res.gameEnded = true;
            }
    
            return res;
        }
    
        const changePlayerTurn = () => {
            currentPlayer = currentPlayer === firstPlayer ? secondPlayer : firstPlayer;
            const message = gameEnded ? 'Game End' : `${currentPlayer.getName()}'s Turn`;
            displayController.changePlayerTurnTitle(message);
        }
    
        const doPlayerTurn = function(e) {
            if(gameEnded) return;
            
            const isCellTaken = makePlayerMove(e.target, currentPlayer);
            if(isCellTaken) return;
    
            const result = processGameResult(firstPlayer, secondPlayer);
            gameEnded = result.gameEnded;
            changePlayerTurn();
        }
    
        const cleanGame = function() {
            displayController.cleanGameboard();
            gameBoard.clearArray();
            displayController.changePlayerTurnTitle(`${currentPlayer.getName()}'s Turn`);
            
            gameEnded = false;
        }

        const cleanScores = function() {
            displayController.cleanScoreboard()
            displayController.updateScores()
            game.cleanGame()
        }
    
        return {doPlayerTurn, cleanGame, cleanScores};
    
    })(player1, player2);
        
    resetGameboardButton.addEventListener('click', game.cleanGame);
    resetScoresButton.addEventListener('click', game.cleanScores);
    
    gameCells.forEach(cell => {
        cell.addEventListener('click', game.doPlayerTurn);
    });
}
