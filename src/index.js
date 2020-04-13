import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    // function componennt that only contains a render method and accepts props without having to worry about state
    // It accepts a function passed to it as a prop to define what it does when you click on it as well as a value defined in the constructor of the topmost parent (null and then X or O)
    return (
        <button className="square" onClick={props.onClick}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    // no need constructor because we are accessing square prop from parent as well as onClick function from parent.
    // Here, we define the renderSquare method to define how we will render the child squares and what will get passed to each
    renderSquare(i) {
        return <Square 
            value={this.props.squares[i]}
            onClick={() => this.props.onClick(i)} 
        />;
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

class Game extends React.Component {
    constructor(props) {
        super(props)
        // initializing this history as an array of squares. When accessing it, it will contain step(array of squares at current time), move(the current move number that you're at)
        this.state = {
            history: [{
                squares: Array(9).fill(null),
            }],
            xIsNext: true,
        };
    }

    handleClick(i) {
        const history = this.state.history;
        const current = history[history.length - 1];
        const squares = current.squares.slice(); // creating copy of array. better for immutability for re-rendering and detecting changes and ease of other function like time travel
        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        // updating our history and concatenating instead of pushing to our original array: this doesn't mutate original array
        this.setState({
            history: history.concat([{
                squares: squares,
            }]),
            xIsNext: !this.state.xIsNext,
        });
    }

    render() {
        const history = this.state.history;
        const current = history[history.length - 1];
        const winner = calculateWinner(current.squares);
        
        const moves = history.map((step, move) => {
            // if move is not 0, then description will describe the move. Otherwise say go to game start.
            // moves RERENDERS EVERYTIME history gets updated in setState().
            // remember, history is an access point of: step -> state of squares, move -> which # move you are at.
            const desc = move ?
                'Go to move #' + move :
                'Go to game start';
            return (
                // when rendering a list, each list item needs a key
                // usually, it must be a key/id that is unique between components and their siblings
                // you MUST have proper keys when building dynamic lists. if no key is specified, react will warn, and use array index as key by default
                // this is generally probelmatic when trying to re-order a list items or inserting/removing list items
                // here, our moves are never re-ordered, deleted, or inserted so its safe to use index as key
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            );
        });

        let status;
        if (winner) {
            status = 'Winner: ' + winner;
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }

        // rendering board and passing down state of squares and function as props
        // onClick is a keyword for buttons to handle clicks. handeClick() is our own defined function above.
        return (
        <div className="game">
            <div className="game-board">
            <Board 
                squares = {current.squares}
                onClick = {(i) => this.handleClick(i)}
            />
            </div>
            <div className="game-info">
            <div>{status}</div>
            <ol>{moves}</ol>
            </div>
        </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);

// helper function to calculate the winner
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
        return squares[a];
        }
    }
    return null;
}

