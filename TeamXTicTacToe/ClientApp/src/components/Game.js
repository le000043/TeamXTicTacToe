import React from 'react';

// import the pictures used as pieces on board
import blank from '../img/blank.png';
import './Game.css';
import Scoreboard from './Scoreboard';

class Square extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let piece = <img className="blankPiece" src={blank} alt="empty" />
        if (this.props.value) {
            piece = this.props.value === "X" ?
                <img className="player1" src={require('../img/' + this.props.tokenX + '.png')} alt="X" />
                : <img className="player2" src={require('../img/' + this.props.tokenO + '.png')} alt="O" />
        }

        return (
            <button className="squareInGame" data-pro={this.props.value} data-win={this.props.win} onClick={this.props.onClick}>
                {piece}
            </button>
        );
    }
}

class Board extends React.Component {

    renderSquare(i) {
        let win = false;

        if (this.props.winningLine && this.props.winningLine.includes(i)) {
            win = true;
        }

        return (
            <Square
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
                win={win}
                tokenX={this.props.tokenX}
                tokenO={this.props.tokenO}
            />
        );
    }


    render() {
        return (
            <div>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        );
    }
}

export class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
            }],
            stepNumber: 0,
            xIsNext: true,
            player1Score: [{
                win: 0,
                loss: 0,
                draw: 0
            }],
            player2Score: [{
                win: 0,
                loss: 0,
                draw: 0
            }],
            winner: null,
            winningLine: null
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();

        if (this.state.winner || squares[i]) {
            return;
        }

        squares[i] = this.state.xIsNext ? "X" : "O"
        const result = calculateWinner(squares);
        let winner = null;
        let winningLine = null;
        if (result) {
            console.log("Winner is " + result.winner);
            winner = result.winner;
            winningLine = result.match;
            this.props.updatePlayers(winner);
        }

        this.setState({
            history: history.concat([
                {
                    squares: squares
                }
            ]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
            winner: winner,
            winningLine: winningLine
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];

        const moves = history.map((step, move) => {
            const desc = move ?
                'Go to move #' + move :
                'Go to game start';
            return (
                <li key={move}>
                    <button className="move" onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            );
        });

        let status;
        if (this.state.winner) {
            status = 'Winner: ' + this.state.winner;
            if (this.state.winner === "X") {
                let arr = this.state.player1Score.slice();
                arr[0].win++;
                this.setState({player1Score: arr});
            }
            else if (this.state.winner === "O") {
                let arr = this.state.player2Score.slice();
                arr[0].win++;
                this.setState({player2Score: arr});

            }
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'Player 1' : 'Player 2');
        }

        return (
            <div className="game">
                <Scoreboard win={this.state.player1Score} loss="" draw="" playerName={this.props.player1} playerShape="X" />
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        //passing down the winning line info for highlighting winningLine
                        winningLine={this.state.winningLine}
                        onClick={(i) => this.handleClick(i)}
                        tokenX={this.props.tokenX}
                        tokenO={this.props.tokenO}
                    />
                    <div className="game-info">
                        <div className="status">{status}</div>
                        <ol>{moves}</ol>
                    </div>
                </div>
                <Scoreboard win="" loss="" draw="" playerName={this.props.player2} playerShape="O" />
            </div>
        );
    }
}

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            console.log("WIN")
            return { winner: squares[a], match: lines[i] };
        }
    }
    //check for draw
    for (let i = 0; i < squares.length; i++) {
        if (squares[i] !== "X" && squares[i] !== "O")
            return null;
    }
    console.log("DRAW")
    return { winner: "D", match: null };
}

