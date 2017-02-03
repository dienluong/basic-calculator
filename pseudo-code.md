Digit
Operation
PlusMinus
Decimal Point
equal
AC
CE


Digit:
  xBeginning: append digit (to blank), display digit.
  xFollowing digit: append digit to current number, display number; if following zero, remove zero before displaying.
  xFollowing plusminus:  " "
  xFollowing decimal:  " "
  xFollowing op:  add current number and op to master array, clear display & number, append digit (to blank), display digit
  xFollowing equal: append digit to result
  xFollowing AC: Same as beginning
  xFollowing CE: Same as beginning


Operation: !!!! TO BE REVISED
  xBeginning: do nothing
  xFollowing digit: save as current op
  xFollowing op: reset previous active op and activate current op, or toggles op
  xFollowing plusminus: " "
  xFollowing decimal: " "
  xFollowing equal: save as current op
  Following AC: do nothing
  Following CE: do nothing

PlusMinus:
  xBeginning: do nothing
  xFollowing digit: toggle sign of current number, display
    xDisplayed number is 0: do nothing
  xFollowing op:  " "
  xFollowing plusminus: " "
  xFollowing decimal: " "
  xFollowing equal: toggle sign of result (= current number), display
  xFollowing AC: do nothing
  xFollowing CE: do nothing

Decimal Point:
  xBeginning: add to current number (0), display
  xFollowing digit: if no decimal yet, then add to current number, display; otherwise, do nothing
  xFollowing plusminus: " "
  xFollowing op: saves current number and op, then displays "0."
  xFollowing decimal: if current number ends with decimal, then toggle decimal point, display; 
                      if current number is "0.", remove decimal point;
                      otherwise, nothing.
  xFollowing equal: if no decimal yet, add to result, display
  xFollowing AC: add to current number (0), display
  xFollowing CE: add to current number (0), display

Equal:
  xBeginning: do nothing
  xFollowing digit: save last number entered, calculate, display result, save result as current number
  xFollowing plusminus: " "
  xFollowing decimal: " " 
  xFollowing op: discard last op entry, save last number entered, calculate and display result, save result as current number
  xFollowing CE: discard last op, starts calculation and display result, save result as current number
  *** Do calculations only if there are at least two numbers and one op entered.
  xFollowing AC: do nothing
  xFollowing equal: do nothing

AC:
  xBeginning: do nothing
  xFollowing digit: reset everything
  xFollowing op: " "
  xFollowing plusminus: " "
  xFollowing decimal: " " 
  xFollowing equal: " "
  xFollowing CE: " "
  xFollowing AC: " "

CE:
  xBeginning: do nothing
  xFollowing digit: clear current number, decimal, display and active op
  xFollowing op: clear current number, decimal, display and active op
  xFollowing plusminus: " "
  xFollowing decimal: " " 
  xFollowing equal: clear result (= current number), current op, decimal, clear display
  Following CE: do nothing
  Following AC: do nothing

xCalculations:
  -1 + 2 = 1
  3 - (-4) = 7
  5 x 6 = 30
  7 / 2 = 3.5
  1 + 2 - 3 = 0
  5 x 4 / 2 = 10
  8 + 9 x 2 = 26
  10 - 1 / 2 = 9.5
  4 x 2 - 16 = -8
  14 / 7 + 8 = 10

Active Op key resets when:
  when digit key pressed
  when plusminus key pressed
  when equals key pressed
  when AC key pressed
  when CE key pressed

Digit mode VS Operation mode

Division by zero
