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
  Following equal: idem to Beginning
            AC: " "
  Following CE: " "


Operation:
  xBeginning: do nothing
  xFollowing digit: save as current op
  xFollowing op:  " "
  xFollowing plusminus: " "
  xFollowing decimal: " "
  Following equal: save as current op
  Following AC: do nothing
  Following CE: do nothing

PlusMinus:
  xBeginning: do nothing
  xFollowing digit: toggle sign of current number, display
  xFollowing op:  " "
  xFollowing plusminus: " "
  xFollowing decimal: " "
  Following equal: toggle sign of result (= current number), display
  Following AC: do nothing
  Following CE: do nothing

Decimal Point:
  xBeginning: add to current number (0), display
  xFollowing digit: if no decimal yet, then add to current number, display; otherwise, do nothing
  xFollowing plusminus: " "
  xFollowing op: saves current number and op, then displays "0."
  xFollowing decimal: if current number ends with decimal, then toggle decimal point, display; 
                      if current number is "0.", remove decimal point;
                      otherwise, nothing.
  Following equal: if no decimal yet, add to result, display
  Following AC: add to current number (0), display
  Following CE: add to current number (0), display

Equal:
  Beginning: do nothing
  Following digit: process master array, calculate, display result, save result as current number
  Following plusminus: " "
  Following decimal: " " 
  Following op: discard last op entry, add current number to master array, process, calculate and display result.
  Following CE: " "
  Following equal: do nothing
  Following AC: do nothing

AC:
  Beginning: do nothing
  Following digit: reset everything
  Following op: " "
  Following plusminus: " "
  Following decimal: " " 
  Following equal: " "
  Following CE: " "
  Following AC: " "

CE:
  xBeginning: do nothing
  xFollowing digit: clear current number, decimal, clear current display
  xFollowing op: clear current number, decimal, display and active op
  Following plusminus: " "
  Following decimal: " " 
  Following equal: clear result (= current number), current op, decimal, clear display
  Following CE: do nothing
  Following AC: do nothing
