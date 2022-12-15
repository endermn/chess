"use strict";
// ! en passant not working
const squareSize = 70;
const boardTopx = 450;
const boardTopy = 80;
let selectedPiece = null;
let position = null;
let index = 0;
const canvas = document.getElementById("canvasChessboard");
const ctx = canvas.getContext("2d");
const image = document.getElementById("pieces");
let board = new Array(8);
let legalMoves = [];
let kingMoved = [false, false];
let enPassantMoved = false;
const knightOffsets = [
  [-2, -1],
  [-2, 1],
  [2, -1],
  [2, 1],
  [1, 2],
  [1, -2],
  [-1, 2],
  [-1, -2],
];
const pawnOffSets = [
  [1, 0],
  [-1, 0],
];
const bishopOffSets = [
  [-1, -1],
  [1, 1],
  [-1, 1],
  [1, -1],
];
const kingOffSets = [
  [-1, -1],
  [-1, 1],
  [-1, 0],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];
for (let i = 0; i < board.length; i++) board[i] = new Array(8);
board[0] = [
  w("rook"),
  w("knight"),
  w("bishop"),
  w("king"),
  w("queen"),
  w("bishop"),
  w("knight"),
  w("rook"),
];
board[7] = [
  b("rook"),
  b("knight"),
  b("bishop"),
  b("king"),
  b("queen"),
  b("bishop"),
  b("knight"),
  b("rook"),
];
for (let i = 0; i < board[0].length; i++) {
  board[1][i] = w("pawn");
  board[6][i] = b("pawn");
  for (let j = 2; j < 6; j++) {
    board[j][i] = null;
  }
}
drawChessboard();
function drawChessboard() {
  const xS = {
    king: 0,
    queen: 200,
    rook: 800,
    knight: 600,
    bishop: 400,
    pawn: 1000,
  };
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      ctx.fillStyle = (x + y) % 2 == 0 ? "bisque" : "darkseagreen";
      let xOffset = boardTopx + x * squareSize;
      let yOffset = boardTopy + y * squareSize;
      ctx.fillRect(xOffset, yOffset, squareSize, squareSize);
      if (board[y][x] != null) {
        ctx.drawImage(
          image,
          xS[board[y][x].kind],
          board[y][x].color * 200,
          200,
          200,
          boardTopx + squareSize * x,
          boardTopy + squareSize * y,
          squareSize,
          squareSize
        );
      }
    }
  }

  ctx.strokeStyle = "black";
  ctx.strokeRect(boardTopx, boardTopy, squareSize * 8, squareSize * 8);
}
function bot() {
  index = turn ? 0 : 1;
  let amountOfKings = 0;
  let kingCheck = false;
  if (kingMoved[index]) kingCheck = true;
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board.length; x++) {
      if (board[y][x] == null) continue;
      if (board[y][x].kind == "king") amountOfKings++;
      if (!board[y][x].color)
        for (let i = 0; i < board.length; i++) {
          for (let j = 0; j < board.length; j++) {
            if (i < 8 && i > -1 && j < 8 && j > -1)
              if (isLegal({ y: i, x: j }, { x: x, y: y }))
                legalMoves.push({
                  positionX: j,
                  positionY: i,
                  pieceX: x,
                  pieceY: y,
                });
            if (!kingCheck && kingMoved[index]) kingMoved[index] = false;
          }
        }
    }
  }
  if (amountOfKings < 2) {
    alert("checkmate");
    resetGame();
  }

  let randomMove = Math.floor(Math.random() * legalMoves.length);
  if (castle[turn] == "right") {
    if (
      board[legalMoves[randomMove].pieceY][legalMoves[randomMove].pieceX + 4] !=
      null
    )
      if (
        board[legalMoves[randomMove].pieceY][legalMoves[randomMove].pieceX + 4]
          .kind == "rook"
      )
        board[legalMoves[randomMove].positionY][
          legalMoves[randomMove].positionX - 1
        ] =
          board[legalMoves[randomMove].pieceY][
            legalMoves[randomMove].pieceX + 4
          ];
    board[legalMoves[randomMove].pieceY][legalMoves[randomMove].pieceX + 4] =
      null;
    castle[turn] = "";
  } else if (castle[turn] == "left") {
    if (
      board[legalMoves[randomMove].pieceY][legalMoves[randomMove].pieceX - 3] !=
      null
    )
      if (
        board[legalMoves[randomMove].pieceY][legalMoves[randomMove].pieceX - 3]
          .kind == "rook"
      )
        board[legalMoves[randomMove].positionY][
          legalMoves[randomMove].positionX + 1
        ] =
          board[legalMoves[randomMove].pieceY][
            legalMoves[randomMove].pieceX - 3
          ];
    board[legalMoves[randomMove].pieceY][legalMoves[randomMove].pieceX - 3] =
      null;
    castle[turn] = "";
  }
  if (
    board[legalMoves[randomMove].pieceY][legalMoves[randomMove].pieceX].kind ==
    "king"
  )
    kingMoved[index] = true;
  if (
    board[legalMoves[randomMove].pieceY][legalMoves[randomMove].pieceX].kind ==
      "pawn" &&
    legalMoves[randomMove].positionY == 7
  )
    board[legalMoves[randomMove].pieceY][legalMoves[randomMove].pieceX].kind =
      "queen";
  if (
    board[legalMoves[randomMove].pieceY][legalMoves[randomMove].pieceX].kind ==
      "pawn" &&
    enPassantMoved
  ) {
    enPassant = legalMoves[randomMove].positionX;
    enPassantMoved = false;
  }
  board[legalMoves[randomMove].positionY][legalMoves[randomMove].positionX] =
  board[legalMoves[randomMove].pieceY][legalMoves[randomMove].pieceX];
  board[legalMoves[randomMove].pieceY][legalMoves[randomMove].pieceX] = null;
  clearBoard(canvas, ctx);
  drawChessboard();
  turn = !turn;
  legalMoves = [];
}
canvas.addEventListener("click", function () {
  if (turn)
    if (selectedPiece == null) {
      selectedPiece = selectPiece(mousePosition());
      ctx.fillStyle = "rgba(221, 246, 238, 0.5)";
      ctx.fillRect(
        selectedPiece.x * squareSize + boardTopx,
        selectedPiece.y * squareSize + boardTopy,
        squareSize,
        squareSize
      );
    } else {
      position = selectPiece(mousePosition());
      clearBoard(canvas, ctx);
      drawChessboard();
      if (
        position != null &&
        (position.x != selectedPiece.x || position.y != selectedPiece.y)
      ) {
        if (board[selectedPiece.y][selectedPiece.x] != null)
          if (board[selectedPiece.y][selectedPiece.x].color) {
            if (isLegal(position, selectedPiece)) {
              if (castle[turn] == "right") {
                if (board[selectedPiece.y][selectedPiece.x + 4] != null)
                  if (
                    board[selectedPiece.y][selectedPiece.x + 4].kind == "rook"
                  )
                    board[position.y][position.x - 1] =
                      board[selectedPiece.y][selectedPiece.x + 4];
                board[selectedPiece.y][selectedPiece.x + 4] = null;
                castle[turn] = "";
              } else if (castle[turn] == "left") {
                if (board[selectedPiece.y][selectedPiece.x - 3] != null)
                  if (
                    board[selectedPiece.y][selectedPiece.x - 3].kind == "rook"
                  )
                    board[position.y][position.x + 1] =
                      board[selectedPiece.y][selectedPiece.x - 3];
                board[selectedPiece.y][selectedPiece.x - 3] = null;
                castle[turn] = "";
              }
              if (enPassantMoved) enPassant = position.x;
              if (
                tookEnPassant &&
                board[selectedPiece.y][selectedPiece.x].color
              ) {
                if (enPassant == position.x)
                  board[position.y + 1][position.x] =
                    board[selectedPiece.y][selectedPiece.x];
                board[position.y + 1][position.x] = null;
                board[position.y][position.x] =
                  board[selectedPiece.y][selectedPiece.x];
                board[selectedPiece.y][selectedPiece.x] = null;
                enPassant = null;
                enPassantMoved = false;
                tookEnPassant = false;
                clearBoard(canvas, ctx);
                drawChessboard();
              } else if (
                tookEnPassant &&
                !board[selectedPiece.y][selectedPiece.x].color
              ) {
                if (enPassant == position.x)
                  board[position.y - 1][position.x] =
                    board[selectedPiece.y][selectedPiece.x];
                board[position.y - 1][position.x] = null;
                board[position.y][position.x] =
                  board[selectedPiece.y][selectedPiece.x];
                board[selectedPiece.y][selectedPiece.x] = null;
                enPassant = null;
                enPassantMoved = false;
                tookEnPassant = false;
                clearBoard(canvas, ctx);
                drawChessboard();
              } else {
                board[position.y][position.x] =
                  board[selectedPiece.y][selectedPiece.x];
                if (board[selectedPiece.y][selectedPiece.x].kind == "pawn")
                  if (position.y == 0 || position == 7) {
                    let promoted;
                    while (true) {
                      promoted = prompt(
                        "What would you like to promote to"
                      ).toLocaleLowerCase();
                      if (
                        promoted == "knight" ||
                        promoted == "rook" ||
                        promoted == "queen" ||
                        promoted == "bishop"
                      )
                        break;
                    }
                    board[position.y][position.x].kind = promoted;
                  }
                board[selectedPiece.y][selectedPiece.x] = null;
                clearBoard(canvas, ctx);
                drawChessboard();
              }
              turn = !turn;
            }
          }
      }
      selectedPiece = null;
      position = null;
      if (legal) delay(500).then(() => bot());
    }
});
let turn = false;
function w(kind) {
  return { kind: kind, color: false };
}
function b(kind) {
  return { kind: kind, color: true };
}
function selectPiece(mousePos) {
  let x = Math.floor((mousePos[0] - boardTopx) / squareSize);
  let y = Math.floor((mousePos[1] - boardTopy) / squareSize);
  if (x >= 0 && x < 8 && y >= 0 && y < 8) return { x: x, y: y };
}
function clearBoard(canvas, ctx) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
function mousePosition() {
  const e = window.event;
  return [e.clientX, e.clientY];
}
let enPassant = null;
let turnCounter = 0;
let tookEnPassant = false;
let castle = ["", ""];
let legal = false;
function isLegal(position, selectedPiece) {
  legal = false;
  index = turn ? (index = 0) : 1;
  if (turnCounter == 2) {
    enPassant = null;
    turnCounter = 0;
  }
  if (board[selectedPiece.y][selectedPiece.x] != null) {
    if (board[selectedPiece.y][selectedPiece.x].kind == "knight") {
      if (
        board[position.y][position.x] == null ||
        board[position.y][position.x].color !=
          board[selectedPiece.y][selectedPiece.x].color
      )
        for (let i = 0; i < knightOffsets.length; i++) {
          if (
            position.y == selectedPiece.y + knightOffsets[i][0] &&
            position.x == selectedPiece.x + knightOffsets[i][1]
          ) {
            legal = true;
          }
        }
    }
    if (board[selectedPiece.y][selectedPiece.x].kind == "pawn") {
      if(board[selectedPiece.y][selectedPiece.x].color){
      if (enPassant != null) {
        if (
          selectedPiece.x == enPassant + 1 ||
          selectedPiece.x == enPassant - 1
        ) {
          if (
            (position.y == 2 && position.x == enPassant)
          ) {
            legal = true;
            tookEnPassant = true;
          }
        }
      }
    }else{
      if (enPassant != null) {
        if (
          selectedPiece.x == enPassant + 1 ||
          selectedPiece.x == enPassant - 1
        ) {
          if (
            (position.y == 5 && position.x == enPassant)
          ) {
            legal = true;
            tookEnPassant = true;
          }
        }
      }
    }
      // taking
      if (!board[selectedPiece.y][selectedPiece.x].color) {
        if (position.x != selectedPiece.x)
          if (
            board[selectedPiece.y + 1][selectedPiece.x + 1] != null ||
            board[selectedPiece.y + 1][selectedPiece.x - 1] != null
          )
            if (
              position.y <= selectedPiece.y + 1 &&
              !(
                position.x > selectedPiece.x + 1 ||
                position.x < selectedPiece.x - 1
              )
            )
              if (
                board[position.y][position.x] != null &&
                position.y - selectedPiece.y < 2
              )
                if (
                  board[selectedPiece.y][selectedPiece.x].color !=
                  board[position.y][position.x].color
                )
                  legal = true;
      } else if (board[selectedPiece.y][selectedPiece.x].color) {
        if (position.x != selectedPiece.x)
          if (
            board[selectedPiece.y - 1][selectedPiece.x + 1] != null ||
            board[selectedPiece.y - 1][selectedPiece.x - 1] != null
          )
            if (
              position.y <= selectedPiece.y + 1 &&
              !(position.y > selectedPiece.y - 1) &&
              !(
                position.x > selectedPiece.x + 1 ||
                position.x < selectedPiece.x - 1
              )
            )
              if (
                board[position.y][position.x] != null &&
                selectedPiece.y - position.y < 2
              )
                if (
                  board[selectedPiece.y][selectedPiece.x].color !=
                  board[position.y][position.x].color
                ) {
                  legal = true;
                }
      }
      // moving
      if (
        board[selectedPiece.y + 1][selectedPiece.x] == null &&
        position.y != selectedPiece.y - 1 &&
        !board[selectedPiece.y][selectedPiece.x].color
      ) {
        if (position.y > selectedPiece.y)
          for (let i = 0; i < pawnOffSets.length; i++) {
            if (
              position.y == selectedPiece.y + pawnOffSets[i][0] &&
              position.x == selectedPiece.x &&
              position.y != selectedPiece.y - pawnOffSets[i][0]
            )
            legal = true;
            if (board[position.y][position.x] == null)
              if (
                position.y == selectedPiece.y + 2 &&
                position.x == selectedPiece.x &&
                (selectedPiece.y == 1 || selectedPiece.y == 6)
              ) {
                enPassantMoved = true;
                legal = true;
              }
          }
      } else if (
        board[selectedPiece.y - 1][selectedPiece.x] == null &&
        board[selectedPiece.y][selectedPiece.x].color &&
        position.y != selectedPiece.y + 1 &&
        selectedPiece.y != 0
      )
        if (position.y < selectedPiece.y){
          for (let i = 0; i < pawnOffSets.length; i++) {
            if (
              position.y == selectedPiece.y + pawnOffSets[i][0] &&
              position.x == selectedPiece.x &&
              position.y != selectedPiece.y - pawnOffSets[i][0]
            ) {
              legal = true;
            }
            if (board[position.y][position.x] == null)
              if (
                position.y == selectedPiece.y - 2 &&
                position.x == selectedPiece.x &&
                (selectedPiece.y == 1 || selectedPiece.y == 6)
              ) {
                legal = true;
                enPassantMoved = true;
              }
          }}
    }
    if (board[selectedPiece.y][selectedPiece.x].kind == "bishop") {
      let deltaX = position.x > selectedPiece.x ? 1 : -1;
      let deltaY = position.y > selectedPiece.y ? 1 : -1;
      let selX = selectedPiece.x;
      let selY = selectedPiece.y;
      while (true) {
        selX += deltaX;
        selY += deltaY;
        if (selX >= 8 || selX < 0 || selY >= 8 || selY < 0) break;
        const dstPiece = board[selY][selX];
        if (dstPiece != null) {
          legal =
            selX == position.x &&
            selY == position.y &&
            dstPiece.color != board[selectedPiece.y][selectedPiece.x].color;
          break;
        }
        if (selX == position.x && selY == position.y) {
          legal = true;
          break;
        }
      }
    }
    if (board[selectedPiece.y][selectedPiece.x].kind == "rook") {
      let deltaX = position.x > selectedPiece.x ? 1 : -1;
      let deltaY = position.y > selectedPiece.y ? 1 : -1;
      let selX = selectedPiece.x;
      let selY = selectedPiece.y;
      while (true) {
        if (position.y == selectedPiece.y) selX += deltaX;
        if (position.x == selectedPiece.x) selY += deltaY;

        if (selX >= 8 || selX < 0 || selY >= 8 || selY < 0) break;
        const dstPiece = board[selY][selX];
        if (dstPiece != null) {
          legal =
            ((selX == selectedPiece.x && selY == position.y) ||
              (selX == position.x && selectedPiece.y == position.y)) &&
            dstPiece.color != board[selectedPiece.y][selectedPiece.x].color;
          break;
        }
        if (selX == position.x && selY == position.y) {
          legal = true;
          break;
        }
      }
    }
    if (board[selectedPiece.y][selectedPiece.x].kind == "queen") {
      let deltaX = position.x > selectedPiece.x ? 1 : -1;
      let deltaY = position.y > selectedPiece.y ? 1 : -1;
      let selX = selectedPiece.x;
      let selY = selectedPiece.y;
      if (position.y == selectedPiece.y || position.x == selectedPiece.x) {
        while (true) {
          if (position.y == selectedPiece.y) selX += deltaX;
          if (position.x == selectedPiece.x) selY += deltaY;
          if (selX >= 8 || selX < 0 || selY >= 8 || selY < 0) break;
          const dstPiece = board[selY][selX];
          if (dstPiece != null) {
            legal =
              ((selX == selectedPiece.x && selY == position.y) ||
                (selX == position.x && selectedPiece.y == position.y)) &&
              dstPiece.color != board[selectedPiece.y][selectedPiece.x].color;
            break;
          }
          if (selX == position.x && selY == position.y) {
            legal = true;
            break;
          }
        }
      } else {
        while (true) {
          selX += deltaX;
          selY += deltaY;
          if (selX >= 8 || selX < 0 || selY >= 8 || selY < 0) break;
          const dstPiece = board[selY][selX];
          if (dstPiece != null) {
            legal =
              selX == position.x &&
              selY == position.y &&
              dstPiece.color != board[selectedPiece.y][selectedPiece.x].color;
            break;
          }
          if (selX == position.x && selY == position.y) {
            legal = true;
            break;
          }
        }
      }
    }
    if (board[selectedPiece.y][selectedPiece.x].kind == "king") {
      // MOVING
      if (
        board[position.y][position.x] == null ||
        board[position.y][position.x].color !=
          board[selectedPiece.y][selectedPiece.x].color
      )
        for (let i = 0; i < kingOffSets.length; i++) {
          if (
            position.y == selectedPiece.y + kingOffSets[i][0] &&
            position.x == selectedPiece.x + kingOffSets[i][1]
          ) {
            legal = true;
            kingMoved[index] = true;
            console.log(
              position.y,
              position.x,
              selectedPiece.y,
              selectedPiece.x
            );
          }
        }

      // CASTLING
      if (!kingMoved[index])
        if (
          (board[position.y][position.x] ==
            board[selectedPiece.y][selectedPiece.x + 2] &&
            position.y == 7 &&
            turn) ||
          (board[position.y][position.x] ==
            board[selectedPiece.y][selectedPiece.x + 2] &&
            position.y == 0 &&
            !turn)
        ) {
          if (position.x > selectedPiece.x)
            if (board[selectedPiece.y][selectedPiece.x + 4] != null)
              if (board[selectedPiece.y][selectedPiece.x + 4].kind == "rook")
                if (board[selectedPiece.y][selectedPiece.x + 1] == null)
                  if (board[selectedPiece.y][selectedPiece.x + 3] == null)
                    if (board[selectedPiece.y][selectedPiece.x + 2] == null) {
                      legal = true;
                      castle[turn] = "right";
                      kingMoved[index] = true;
                    }
        } else if (
          (board[position.y][position.x] ==
            board[selectedPiece.y][selectedPiece.x - 2] &&
            position.y == 7 &&
            turn) ||
          (board[position.y][position.x] ==
            board[selectedPiece.y][selectedPiece.x - 2] &&
            position.y == 0 &&
            !turn)
        ) {
          if (position.x < selectedPiece.x)
            if (board[selectedPiece.y][selectedPiece.x - 3] != null)
              if (board[selectedPiece.y][selectedPiece.x - 3].kind == "rook")
                if (board[selectedPiece.y][selectedPiece.x - 1] == null)
                  if (board[selectedPiece.y][selectedPiece.x - 2] == null) {
                    legal = true;
                    castle[turn] = "left";
                    kingMoved[index] = true;
                  }
        }
    }
  }
  turnCounter++;
  return legal;
}
function resetGame() {
  selectedPiece = null;
  position = null;
  index = 0;
  board = new Array(8);
  legalMoves = [];
  kingMoved = [false, false];
  enPassantMoved = false;
  for (let i = 0; i < board.length; i++) board[i] = new Array(8);
  board[0] = [
    w("rook"),
    w("knight"),
    w("bishop"),
    w("king"),
    w("queen"),
    w("bishop"),
    w("knight"),
    w("rook"),
  ];
  board[7] = [
    b("rook"),
    b("knight"),
    b("bishop"),
    b("king"),
    b("queen"),
    b("bishop"),
    b("knight"),
    b("rook"),
  ];
  for (let i = 0; i < board[0].length; i++) {
    board[1][i] = w("pawn");
    board[6][i] = b("pawn");
    for (let j = 2; j < 6; j++) {
      board[j][i] = null;
    }
  }
  drawChessboard();
  bot();
}
