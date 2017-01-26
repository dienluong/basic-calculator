const calcProto = {
  display() {},
  operation() {},
  plusminus() {},
  decimal() {},
  digit() {},
  clearEntry() {},
  clearAll() {}
};


function calcFactory(spec) {
  const DISPLAY = '#display';
  let gEntriesArray  = [];
  let gHasDecimal    = false;
  let gLastNumber    = null;  // gLastNumber is null at startup and after CA and CE
  let gLastOp        = "";
  let gLastEntryType = "digit"; // digit or operation

  let calcObj = Object.create(calcProto);


  // Set or get display area text
  display(target, str) {
    var container = $(target);
    if (str === undefined)
      return container.text() || "";
    else
      container.text(str);
  }

  operationPressed(display) {
    // if no digits entered previously, do nothing.
    if (gLastNumber === null)
      return display;

    gLastOp = e.target.textContent;
    gLastEntryType = 'operation';
    return display;
  }

  plusminusPressed(display) {
    if (gLastNumber === null)
      return display;

    gLastNumber *= -1;
    return display[0] === '-' ? display.slice(1): '-' + display;
  }

  decimalPressed(display) {
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
  }

  digitPresssed(display) {
    if (gLastEntryType === 'operation') {
      if (gLastOp && gLastNumber !== null) {
        gEntriesArray.push(gLastNumber);
        gEntriesArray.push(gLastOp);
      }
      display = e.target.textContent;
      gHasDecimal = false;
    } // last entry was a digit so keep appending to number.
    else {
      if (Number(display) === 0 && !gHasDecimal)
        //prevents leading zero
        display = e.target.textContent;
      else
        display = display + e.target.textContent;
    }

    gLastNumber = Number(display);
    gLastOp = "";
    gLastEntryType = 'digit';
    return display;
  }

  clearEntryPressed(display) {
    if (gLastNumber !== null) {
      gLastNumber = null;
      gHasDecimal = false;
      gLastEntryType = "digit";
      gLastOp = "";
      display = "";
    }

    return display;
  }

  clearAllPressed(display) {
    display = clearEntryPressed(display);
    gEntriesArray = [];
    return display;
  }



  return calcObj;
}
