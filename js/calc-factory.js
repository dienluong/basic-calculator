'use strict';

function calcFactory(spec) {
  const DISPLAY = document.querySelector(spec.display);
  const BUTTONS = document.querySelector(spec.buttons);
  const MULTIPLICATION = '\u00D7';
  const DIVISION       = '\u00F7';
  const PLUS_MINUS     = '\u00B1';
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

    addToEntriesArray (entry) {
      gEntriesArray.push(entry);
    },

    clearEntriesArray () {
      gEntriesArray = [];
    },

    getEntriesArray () {
      return gEntriesArray.slice();
    },

    setLastOp (op) {
      gLastOp = op;
      return gLastOp;
    },

    getLastOp () {
      return gLastOp;
    },

    setLastNumber (nb) {
      gLastNumber = nb;
    },

    getLastNumber () {
      return gLastNumber;
    },

    setLastEntryType (type) {
      gLastEntryType = type;
    },

    getLastEntryType () {
      return gLastEntryType;
    },

    setHasDecimal (has) {
      gHasDecimal = has;
    },

    getHasDecimal () {
      return gHasDecimal;
    },

    // Set and get display area text
    updateDisplay (target, str) {
        var container = $(target);
        if (str !== undefined)
          container.text(str);

        return container.text();
    },

    operation (display, op) {
      // if no digits entered previously, do nothing.
      if (gLastNumber === null)
        return display;

      if (gLastOp !== op) {
        // If diff op key pressed, then switch to that op
        $(`button:contains(${gLastOp})`).removeClass('active');
        gLastOp = op;
        gLastEntryType = 'operation';
      }
      else { // If op key pressed was already active, then deactivate it and go back to "digit entry mode".
        gLastOp = "";
        gLastEntryType = 'digit';
      }

      $(`button:contains(${op})`).toggleClass('active');
      return display;
    },

    plusminus (display) {
      $(`button:contains(${gLastOp})`).removeClass('active');
      if (gLastNumber === null || gLastNumber === 0)
        return display;

      gLastNumber *= -1;
      gLastEntryType = "digit";
      gLastOp = "";
      return display[0] === '-' ? display.slice(1): '-' + display;
    },

    decimal (display) {
      $(`button:contains(${gLastOp})`).removeClass('active');
      if (gLastEntryType === 'operation') {
        if (gLastOp && gLastNumber !== null) {
          gEntriesArray.push(gLastNumber);
          gEntriesArray.push(gLastOp);
        }
        display = "0.";
        gHasDecimal = true;
      }
      else { // last key pressed was not an operation key, then...
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
      }
      gLastNumber = Number(display);
      gLastOp = "";
      gLastEntryType = "digit";
      return display;
    },

    digit (display, dgt) {
      $(`button:contains(${gLastOp})`).removeClass('active');
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

      $(`button:contains(${gLastOp})`).removeClass('active');
      return ""; // returns "" as display
    },

    clearAll (display) {
      if (gLastNumber !== null) {
        gLastNumber = null;
        gHasDecimal = false;
        gLastEntryType = "digit";
        gLastOp = "";
      }

      $(`button:contains(${gLastOp})`).removeClass('active');
      gEntriesArray = [];
      return ""; // returns "" as display
    },

    calculate (equation) {
      console.log(equation);
      // Loop thru operations stored in the array.
      for(var i = 1; i < equation.length-1; i += 2) {
        // Turn number on right to a negative number if operation is a substraction
        // 1 - 2 * 3 =>  1 + (-2) * 3
        if (equation[i] === '-') {
          equation[i+1] *= -1;
          equation[i] = '+';
          continue;
        }
        else // If operation is not multiplication, nor division, skip to next operation
        if (equation[i] === '+') {
          continue;
        }

        // If operation is division, then invert the 2nd number to make the operation a multiplication
        if (equation[i] === DIVISION) {
          equation[i+1] = 1 / equation[i+1];
        }

        // Do multiplication of numbers on the left and on the right
        equation[i+1] = equation[i-1] * equation[i+1];

        // Put result in rigt slot,
        // Put zero on the left and change operation to +
        // So we have [0][+][result]
        equation[i-1] = 0;
        equation[i] = '+';
        console.log(equation);
      }

      // Now our array should only have + operations
      let sum = equation[0];
      for(i = 2; i < equation.length; i += 2) {
        sum += equation[i];
      }

      return sum;
    },

    equals (display) {
      $(`button:contains(${gLastOp})`).removeClass('active');
      let finalResult = null;

      // If empty, nothing to do
      if (!gEntriesArray.length)
        return display;

      if (gLastNumber !== null)
        gEntriesArray.push(gLastNumber);

      // If entries contain at least one operation, then do calculation
      if (gEntriesArray.length >= 3) {
        finalResult = this.calculate(gEntriesArray);
      }
      else
        finalResult = gEntriesArray[0];

      display = finalResult.toString();
      gEntriesArray   = [];
      gLastNumber     = finalResult;
      gLastEntryType  = "digit";
      gLastOp         = "";
      gHasDecimal     = (finalResult % 1 !== 0);
      return display;
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
                      nextDisplay = this.equals(currentDisplay);
                      break;
            case '+': //addition
            case '-': //substraction
            case DIVISION: //division
            case MULTIPLICATION: //multiplication
                      nextDisplay = this.operation(currentDisplay, e.target.textContent);
                      break;
            case PLUS_MINUS: //toggle +/-
                      nextDisplay = this.plusminus(currentDisplay);
                      break;
            case '.': //decimal
                      nextDisplay = this.decimal(currentDisplay);
                      break;
            default:  //digit key
                      nextDisplay = this.digit(currentDisplay, e.target.textContent);
          }

          if(nextDisplay === 'Infinity' || nextDisplay === '-Infinity') {
            alert('Result is Infinity. Resetting calculator. Press OK to continue...');
            nextDisplay = this.clearAll("");
          }

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
