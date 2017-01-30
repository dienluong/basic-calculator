'use strict';

function calcFactory(spec) {
  const DISPLAY = document.querySelector(spec.display);
  const BUTTONS = document.querySelector(spec.buttons);
  let gEntriesArray  = [];
  let gHasDecimal    = false;
  let gLastNumber    = null;  // gLastNumber is null at startup and after CA and CE
  let gLastOp        = "";
  let gLastEntryType = "digit"; // digit or operation

  const Calculator = {
    init () {
      if (!BUTTONS)
        throw new Error("Invalid initialization parameter: buttons.");
      if (!DISPLAY)
        throw new Error("Invalid initialization parameter: display.");
      $(BUTTONS).off('click.calculator', this.buttonPressHandler.bind(this));
      $(BUTTONS).on('click.calculator', this.buttonPressHandler.bind(this));
      // BUTTONS.removeEventListener('click', this.buttonPressHandler.bind(this));
      // BUTTONS.addEventListener("click", this.buttonPressHandler.bind(this));
    },

    // Set or get display area text
    updateDisplay (target, str) {
      var container = $(target);
      if (str === undefined)
        return container.text() || "";
      else
        container.text(str);
    },

    operation (display, op) {
      // if no digits entered previously, do nothing.
      if (gLastNumber === null)
        return display;

      gLastOp = op;
      gLastEntryType = 'operation';
      return display;
    },

    plusminus (display) {
      if (gLastNumber === null)
        return display;

      gLastNumber *= -1;
      return display[0] === '-' ? display.slice(1): '-' + display;
    },

    decimal (display) {
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
      gLastOp = "";
      gLastEntryType = "digit";
      return display;
    },

    digit (display, dgt) {
      if (gLastEntryType === 'operation') {
        if (gLastOp && gLastNumber !== null) {
          gEntriesArray.push(gLastNumber);
          gEntriesArray.push(gLastOp);
        }
        display = dgt;
        gHasDecimal = false;
      } // last entry was a digit so keep appending to number.
      else {
        if (Number(display) === 0 && !gHasDecimal)
          //prevents leading zero
          display = dgt;
        else
          display = display + dgt;
      }

      gLastNumber = Number(display);
      gLastOp = "";
      gLastEntryType = 'digit';
      return display;
    },

    clearEntry (display) {
      if (gLastNumber !== null) {
        gLastNumber = null;
        gHasDecimal = false;
        gLastEntryType = "digit";
        gLastOp = "";
      }
      return ""; // returns "" as display
    },

    clearAll (display) {
      if (gLastNumber !== null) {
        gLastNumber = null;
        gHasDecimal = false;
        gLastEntryType = "digit";
        gLastOp = "";
      }
      gEntriesArray = [];
      return ""; // returns "" as display
    },

    buttonPressHandler (e) {
        var nextDisplay = "";
        var currentDisplay = this.updateDisplay(DISPLAY);
        if (e.target.tagName === 'BUTTON') {
          switch (e.target.textContent) {
            case 'CE': nextDisplay = this.clearEntry(currentDisplay);
                      break;
            case 'AC': nextDisplay = this.clearAll(currentDisplay);
                      break;
            case '=': //calculate final result and display it
                      break;
            case '+': //addition
            case '-': //substraction
            case '\u00F7': //division
            case '\u00D7': //multiplication
                      nextDisplay = this.operation(currentDisplay, e.target.textContent);
                      break;
            case '\u00b1': //toggle +/-
                      nextDisplay = this.plusminus(currentDisplay);
                      break;
            case '.': //decimal
                      nextDisplay = this.decimal(currentDisplay);
                      break;
            default:  //last entry was an operation, then save the current number and operation
                      nextDisplay = this.digit(currentDisplay, e.target.textContent);
          }
          console.log("Entries: ", gEntriesArray);
          console.log("Last entry, number, op: ", gLastEntryType + " / " + gLastNumber + " / " + gLastOp);
          this.updateDisplay(DISPLAY, nextDisplay);
        }
        e.stopPropagation();
    }
  };

  var calcObj = Object.create(Calculator);
  try {
    calcObj.init();
  }
  catch (err) {
    window.alert(err);
  }
  return calcObj;
}
