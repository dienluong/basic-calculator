$(function () {
  const DISPLAY = '#display';
  let gEntriesArray  = [];
  let gHasDecimal    = false;
  let gLastNumber    = null;  // gLastNumber is null at startup and after CA and CE
  let gLastOp        = "";
  let gLastEntryType = "digit"; // digit or operation

  // Set or get display area text
  function display(target, str) {
    var container = $(target);
    if (str === undefined)
      return container.text() || "";
    else
      container.text(str);
  }


  function buttonPress(e) {
    function operationPressed(display) {
      // if no digits entered previously, do nothing.
      if (gLastNumber === null)
        return display;

      gLastOp = e.target.textContent;
      gLastEntryType = 'operation';
      return display;
    }

    function plusminusPressed(display) {
      if (gLastNumber === null)
        return display;

      gLastNumber *= -1;
      return display[0] === '-' ? display.slice(1): '-' + display;
    }

    function decimalPressed(display) {
      // no current number
      if (gLastNumber === null) {
        display = "0.";
        gHasDecimal = true;
      }
      else { // number has no decimal
        if (!gHasDecimal) {
          display = display + '.';
          gHasDecimal = true;
        }
        else { //if number ends with decimal, then toggle, otherwise do nothing
          if (display[display.length-1] === '.') {
            display = display.substr(0, display.length-1);
            gHasDecimal = false;
          }
        }
      }
      gLastNumber = Number(display);
      gLastEntryType = "digit";
      return display;
    }

    function digitPresssed(display) {
      if (gLastEntryType === 'operation') {
        if (gLastOp && gLastNumber !== null) {
          gEntriesArray.push(gLastNumber);
          gEntriesArray.push(gLastOp);
        }
        display = e.target.textContent;
        gLastOp = "";
        gHasDecimal = false;
      } // last entry was a digit so keep appending to number.
      else {
        display = display + e.target.textContent;
      }

      gLastNumber = Number(display);
      gLastEntryType = 'digit';
      return display;
    }

    var nextDisplay = "";
    var currentDisplay = display(DISPLAY);
    if (e.target.tagName === 'BUTTON') {
      switch (e.target.textContent) {
        case 'CE': nextDisplay = "";
                  gLastEntryType = "digit";
                  gLastNumber = null;
                  gLastOp = "";
                  gHasDecimal = false;
                  break;
        case 'AC': //clear all
                  break;
        case '=': //calculate final result and display it
                  break;
        case '+': //addition
        case '-': //substraction
        case '\u00F7': //division
        case '\u00D7': //multiplication
                  nextDisplay = operationPressed(currentDisplay);
                  break;
        case '\u00b1': //toggle +/-
                  nextDisplay = plusminusPressed(currentDisplay);
                  break;
        case '.': //decimal
                  nextDisplay = decimalPressed(currentDisplay);
                  break;
        default:  //last entry was an operation, then save the current number and operation
                  nextDisplay = digitPresssed(currentDisplay);
      }
      console.log("Entries: ", gEntriesArray);
      console.log("Last entry, number, op: ", gLastEntryType + " / " + gLastNumber + " / " + gLastOp);
      display(DISPLAY, nextDisplay);
    }
    e.stopPropagation();
  }

  $('div#buttons').on('click', buttonPress);
  // document.querySelector('div#buttons').addEventListener("click", buttonPress);
});
