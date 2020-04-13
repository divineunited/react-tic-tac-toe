import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    // this is a function component that only contains a render method and accepts props without having to worry about state
    // It accepts a method passed to it as a prop to define what it does when you click on it as well as a value defined in the constructor of the topmost parent (null and then X or O)
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
    // every class needs a render function. what will it return?
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
    // constructor (init) created here to manage the state that gets passed down to children
    constructor(props) {
        super(props)
        // initializing this history as an array of squares. When accessing it, it will contain step(array of squares at current time), move(the current move number that you're at)
        // stepNumber used to allow time travel and keeps track of history
        // also creating a boolean to switch between X and O
        this.state = {
            history: [{
                squares: Array(9).fill(null),
            }],
            stepNumber: 0,
            xIsNext: true,
        };
    }

    // method that handles how a click behaves for each square and gets passed down as a prop to the children
    handleClick(i) {
        // making copy of history array and slicing it from beginning of history (0) to the stepnumber we choose for our time travel (allowing us to delete future history that is incorrect when we time travel)
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        // slice() is creating copy of array at this point in time. immutability is better for re-rendering and detecting changes and ease of other function like time travel
        const squares = current.squares.slice(); 
        // make sure that if we have a winner or that a square is already clicked on, a click returns nothing (does nothing) - return exits the function
        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        // turnary statement to render that square with either an X or an O
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        // updating our state - add history by concatenating instead of pushing to our original array: this doesn't mutate original array; setting the current stepnumber to the updated length of history, also alternating the X or O
        this.setState({
            history: history.concat([{
                squares: squares,
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        });
    }

    // jumpTo method to move to a specific time in history, update stepnumber, and set xIsNext to true if number that we're changin stepNumber to is even
    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    render() {
        // const or let is only within the scope of the brackets, so need to redefine const history again in this method
        const history = this.state.history;
        // rendering currently selected move according to stepNumber
        const current = history[this.state.stepNumber]; 
        const winner = calculateWinner(current.squares);
        
        // moves is an array of html lists (dynamic html list)  that call a function "jumpTo(move)" with a description describing the move number based on an evergrowing history array
        // map function in JS allows us to modify the elements in a particular way and returned in a seperate array called moves
        // it takes in an argument of a callback function in order to manipulate your data - here using ES6 arrow function syntax
        // under the hood, .map behaves as a for loop iterating over each element of an array modifying the elements as needed and then pushing the modified elements into new array
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
                // this is generally problematic when trying to re-order a list items or inserting/removing list items
                // here, our moves are never re-ordered, deleted, or inserted so its safe to use index as key
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            );
        });

        // here we use let because even though it's scoped within the render bracket (just like const), we can reassign status, so we use let (const doesnt allow reassignment) - recall var is globally scoped within the class.
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

// Mount React to our Root HTML page
ReactDOM.render(
    <Game />,
    document.getElementById('root')
);

// helper function to calculate the winner - doesn't render any htnl, just returns an X, O or nothing.
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

