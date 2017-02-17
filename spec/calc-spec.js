/* eslint-env jasmine */
/* global loadFixtures, calcFactory */
describe('calculator', function () {
  const BUTTONS = 'div#keyPanel';
  const DISPLAY = 'pre#display';
  const INPUT_HISTORY = '#inputList';
  const PLUS_MINUS = '\u00B1';
  const MULTIPLICATION = '\u00D7';
  const DIVISION = '\u00F7';
  jasmine.getFixtures().fixturesPath = 'spec/html/fixtures';

  beforeAll(function() {
    this.initData = {display: DISPLAY, inputList: INPUT_HISTORY, buttons: BUTTONS};
    // Caching jQuery selectors
  });

  beforeEach(function() {
    loadFixtures('calculator-fixture.html');
    this.key0 = $('button:contains("0")');
    this.key1 = $('button:contains("1")');
    this.key2 = $('button:contains("2")');
    this.key3 = $('button:contains("3")');
    this.key4 = $('button:contains("4")');
    this.key5 = $('button:contains("5")');
    this.key6 = $('button:contains("6")');
    this.key7 = $('button:contains("7")');
    this.key8 = $('button:contains("8")');
    this.key9 = $('button:contains("9")');
    this.keyAC = $('button:contains("AC")');
    this.keyCE = $('button:contains("CE")');
    this.keyEqual = $('button:contains("=")');
    this.keyPlusMinus = $(`button:contains(${PLUS_MINUS})`);
    this.keyAdd = $('button:contains("+")');
    this.keySub = $('button:contains("-")');
    this.keyMult = $(`button:contains(${MULTIPLICATION})`);
    this.keyDiv = $(`button:contains(${DIVISION})`);
    this.keyDecimal = $('button:contains(".")');
    this.allButtons = $('#keyPanel').find('button');
    if(this.allButtons.length === 0)
      throw new Error("Error executing beforeEach");
    // The unit to test
    this.calculator = calcFactory(this.initData);
  });

  describe('initialization', function() {
    it('sets up click handler for buttons', function() {
      expect($(BUTTONS)).toHandle('click');
    });

    it('enters digit input mode', function() {
      expect(this.calculator.getLastEntryType()).toBe('digit');
    });
  });

  describe('digit key', function () {
    it('displays digit when pressed after AC, CE or at fresh start (blank display)', function(done) {
      this.key0.trigger('click');
      expect($(DISPLAY)).toHaveText('0');
      this.keyAC.trigger('click');
      this.key9.trigger('click');
      expect($(DISPLAY)).toHaveText('9');
      this.keyCE.trigger('click');
      this.key0.trigger('click');
      expect($(DISPLAY)).toHaveText('0');
      done();
    });

    it('appends digit to current displayed number', function(done) {
      this.key1.trigger('click');
      this.key0.trigger('click');
      expect($(DISPLAY)).toHaveText('10');
      // Appends even after plus-minus pressed
      this.keyPlusMinus.trigger('click');
      this.key2.trigger('click');
      expect($(DISPLAY)).toHaveText('-102');
      // Appends even after decimal-point pressed
      this.keyDecimal.trigger('click');
      this.key3.trigger('click');
      expect($(DISPLAY)).toHaveText('-102.3');
      done();
    });

    it('appends digit to displayed result, after = pressed', function(done) {
      this.key1.trigger('click');
      this.key0.trigger('click');
      this.keyMult.trigger('click');
      this.key2.trigger('click');
      this.key0.trigger('click');
      this.keyEqual.trigger('click');
      this.key5.trigger('click');
      expect($(DISPLAY)).toHaveText('2005');
      expect(this.calculator.getLastNumber()).toBe(2005);
      done();
    });

    it('does not display leading zero when followed by non-zero digit', function(done) {
      this.key0.trigger('click');
      expect($(DISPLAY)).toHaveText('0');
      this.key0.trigger('click');
      expect($(DISPLAY)).toHaveText('0');
      this.key5.trigger('click');
      expect($(DISPLAY)).toHaveText('5');
      done();
    });

    it('saves last number and op, clears display and displays digit, when digit pressed after an op key', function(done) {
      this.key2.trigger('click');
      this.key3.trigger('click');
      this.keyAdd.trigger('click');
      this.key4.trigger('click');
      //saves last number and op
      expect(this.calculator.getEntriesArray()[0]).toBe(23);
      expect(this.calculator.getEntriesArray()[1]).toBe('+');
      //clears and displays digit pressed after op
      expect($(DISPLAY)).toHaveText('4');
      expect(this.calculator.getLastNumber()).toBe(4);
      expect(this.calculator.getLastEntryType()).toBe("digit");
      expect(this.calculator.getLastOp()).toBe("");
      done();
    });
  });

  describe('operation key', function () {
    it('displays nothing and op key not highlighted when pressed at fresh start (blank display)', function(done) {
      this.keySub.trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      expect(this.allButtons).not.toBeMatchedBy('button[class="active"]');
      this.keyAdd.trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      expect(this.allButtons).not.toBeMatchedBy('button[class="active"]');
      this.keyDiv.trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      expect(this.allButtons).not.toBeMatchedBy('button[class="active"]');
      this.keyMult.trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      expect(this.allButtons).not.toBeMatchedBy('button[class="active"]');
      expect(this.allButtons).not.toHaveClass('active'); // should be the same as above expect()
      expect(this.calculator.getLastEntryType()).toBe('digit');
      done();
    });

    it('displays nothing and does not highlight op key, when pressed after AC key', function(done) {
      this.key4.trigger('click');
      this.keySub.trigger('click');
      this.key2.trigger('click');
      this.keyAC.trigger('click');
      this.keyAdd.trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      expect(this.allButtons).not.toBeMatchedBy('button[class="active"]');
      expect(this.calculator.getLastOp()).toBe('');
      expect(this.calculator.getLastEntryType()).toBe('digit');
      done();
    });

    it('displays nothing and does not highlight op key, when pressed after CE key', function(done) {
      this.key4.trigger('click');
      this.keySub.trigger('click');
      this.key2.trigger('click');
      this.keyCE.trigger('click');
      this.keyMult.trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      expect(this.allButtons).not.toBeMatchedBy('button[class="active"]');
      expect(this.allButtons).not.toHaveClass('active');
      expect(this.calculator.getLastNumber()).toBeNull();
      expect(this.calculator.getLastOp()).toBe('');
      expect(this.calculator.getLastEntryType()).toBe('digit');
      done();
    });

    it('saves pressed op key as current op, highlights op key, if following digit key', function(done) {
      this.key6.trigger('click');
      this.keyDiv.trigger('click');
      expect($(DISPLAY)).toHaveText('6');
      expect(this.calculator.getLastOp()).toBe(DIVISION);
      expect(this.calculator.getLastNumber()).toBe(6);
      expect(this.keyDiv).toHaveClass("active");
      expect($(`button:not(:contains(${DIVISION}))`)).not.toHaveClass("active");
      expect(this.calculator.getLastEntryType()).toBe('operation');
      done();
    });

    it('resets previous active op key, set current active op key or toggles if pressing the same op key', function(done) {
      // Pressed 7, division, multiplication
      this.key7.trigger('click');
      this.keyDiv.trigger('click');
      expect(this.calculator.getLastOp()).toBe(DIVISION);
      expect(this.keyDiv).toHaveClass("active");
      expect($(`button:not(:contains(${DIVISION}))`)).not.toHaveClass("active");
      expect(this.calculator.getLastEntryType()).toBe('operation');
      this.keyMult.trigger('click');
      // Resets division op key and sets multiplication op key
      expect($(DISPLAY)).toHaveText('7');
      expect(this.calculator.getLastOp()).toBe(MULTIPLICATION);
      expect($(`button:not(:contains(${MULTIPLICATION}))`)).not.toHaveClass("active");
      expect(this.keyMult).toHaveClass("active");
      expect(this.calculator.getLastEntryType()).toBe('operation');
      // Toggles..
      this.keyMult.trigger('click');
      expect(this.calculator.getLastOp()).toBe("");
      expect(this.allButtons).not.toBeMatchedBy('button[class="active"]');
      // Should return to digits entry mode...
      expect(this.calculator.getLastEntryType()).toBe('digit');
      this.keyDecimal.trigger('click');
      this.key7.trigger('click');
      expect($(DISPLAY)).toHaveText('7.7');
      // Finally, op key highlighted
      this.keyAdd.trigger('click');
      expect(this.calculator.getLastOp()).toBe("+");
      expect($("button:not(:contains('+'))")).not.toHaveClass('active');
      expect($("button:contains('+')")).toHaveClass("active");

      done();
    });

    it('saves pressed op key as current op, highlights op key, if following plus-minus key', function(done) {
      // Pressed 8, +/-, -
      this.key8.trigger('click');
      this.keyPlusMinus.trigger('click');
      this.keySub.trigger('click');
      expect($(DISPLAY)).toHaveText('-8');
      expect(this.calculator.getLastOp()).toBe("-");
      expect(this.keySub).toHaveClass("active");
      expect($('button:not(:contains("-"))')).not.toHaveClass("active");
      expect(this.calculator.getLastEntryType()).toBe('operation');
      done();
    });

    it('saves pressed op key as current op, highlights op key, if following decimal-point key', function(done) {
      this.key9.trigger('click');
      this.keyDecimal.trigger('click');
      this.keyAdd.trigger('click');
      expect($(DISPLAY)).toHaveText('9.');
      expect(this.calculator.getLastOp()).toBe("+");
      expect(this.keyAdd).toHaveClass("active");
      expect($('button:not(:contains("+"))')).not.toHaveClass("active");
      expect(this.calculator.getLastEntryType()).toBe('operation');
      done();
    });

    it('saves pressed op key as current op, highlights op key, if following = key', function(done) {
      this.key9.trigger('click');
      this.keyDiv.trigger('click');
      this.key2.trigger('click');
      this.keyEqual.trigger('click');
      this.keySub.trigger('click');
      expect(this.calculator.getLastOp()).toBe("-");
      expect(this.keySub).toHaveClass("active");
      expect($('button:not(:contains("-"))')).not.toHaveClass("active");
      expect(this.calculator.getLastEntryType()).toBe('operation');
      expect($(DISPLAY)).toHaveText('4.5');
      done();
    });
  });

  describe('plus-minus key', function() {
    it('displays nothing when pressed after CE, AC or at fresh start (blank display)', function() {
      this.keyPlusMinus.trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      this.keyPlusMinus.trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      this.key0.trigger('click');
      this.keyAC.trigger('click');
      this.keyPlusMinus.trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      this.key1.trigger('click');
      this.keyCE.trigger('click');
      this.keyPlusMinus.trigger('click');
      expect($(DISPLAY)).toBeEmpty();
    });

    it('toggles negative sign on displayed none-zero number, if pressed after digit/op/decimal/plus-minus key', function() {
      // Pressed 0, 1, +/-
      this.key0.trigger('click');
      this.key1.trigger('click');
      this.keyPlusMinus.trigger('click');
      expect($(DISPLAY)).toHaveText("-1");
      // Toggles negative sign
      this.keyPlusMinus.trigger('click');
      expect($(DISPLAY)).toHaveText("1");
      // Toggles after op key
      this.keyMult.trigger('click');
      this.keyPlusMinus.trigger('click');
      expect($(DISPLAY)).toHaveText("-1");
      // Toggles after decimal-point key
      this.keyDecimal.trigger('click');
      this.keyPlusMinus.trigger('click');
      expect($(DISPLAY)).toHaveText("1.");
      this.key2.trigger('click');
      this.keyPlusMinus.trigger('click');
      expect($(DISPLAY)).toHaveText("-1.2");
      expect(this.calculator.getLastEntryType()).toBe('digit');
    });

    it('does nothing if displayed number/result is zero', function() {
      this.key0.trigger('click');
      this.keyPlusMinus.trigger('click');
      expect($(DISPLAY)).toHaveText("0");
      this.key3.trigger('click');
      this.keySub.trigger('click');
      this.key3.trigger('click');
      this.keyEqual.trigger('click');
      expect($(DISPLAY)).toHaveText("0");
      this.keyPlusMinus.trigger('click');
      expect($(DISPLAY)).toHaveText("0");
    });

    it('toggles negative sign on displayed non-zero result, if pressed after = key', function() {
      this.key0.trigger('click');
      this.key4.trigger('click');
      this.keyMult.trigger('click');
      this.key6.trigger('click');
      this.keyEqual.trigger('click');
      this.keyPlusMinus.trigger('click');
      expect($(DISPLAY)).toHaveText("-24");
      expect(this.calculator.getLastEntryType()).toBe('digit');
    });
  });

  describe('decimal-point key', function() {
    it('displays "0." when pressed after CE or AC, or at fresh start (blank display)', function() {
      this.keyDecimal.trigger('click');
      expect($(DISPLAY)).toHaveText("0.");
      this.key5.trigger('click');
      this.keyCE.trigger('click');
      this.keyDecimal.trigger('click');
      expect($(DISPLAY)).toHaveText("0.");
      this.key6.trigger('click');
      this.keyAC.trigger('click');
      this.keyDecimal.trigger('click');
      expect($(DISPLAY)).toHaveText("0.");
    });

    it('toggles decimal-point if current number ends with one or doesn\'t have one; otherwise does nothing', function() {
      this.keyDecimal.trigger('click');
      expect($(DISPLAY)).toHaveText("0.");
      expect(this.calculator.getLastEntryType()).toBe('digit');
      // Toggles
      this.keyDecimal.trigger('click');
      expect($(DISPLAY)).toHaveText("0");
      this.key1.trigger('click');
      this.keyDecimal.trigger('click');
      expect($(DISPLAY)).toHaveText("1.");
      // Toggles for negative numbers too
      this.keyPlusMinus.trigger('click');
      this.keyDecimal.trigger('click');
      expect($(DISPLAY)).toHaveText("-1");
      expect(this.calculator.getLastEntryType()).toBe('digit');
      // Does nothing if number already has decimal-point
      this.keyDecimal.trigger('click');
      this.key2.trigger('click');
      this.keyDecimal.trigger('click');
      expect($(DISPLAY)).toHaveText("-1.2");
      expect(this.calculator.getLastEntryType()).toBe('digit');
    });

    it('saves current number and op, and displays "0." when pressed after op key', function() {
      this.key0.trigger('click');
      this.key3.trigger('click');
      this.key4.trigger('click');
      this.keyDecimal.trigger('click');
      this.keyDiv.trigger('click');
      this.keyDecimal.trigger('click');
      expect(this.calculator.getEntriesArray()[0]).toBe(34.0);
      expect(this.calculator.getEntriesArray()[1]).toBe('\u00F7');
      expect($(DISPLAY)).toHaveText("0.");
      expect(this.calculator.getLastEntryType()).toBe('digit');
    });

    it('toggles decimal-point if result ends with one or does not already have one, when pressed after = key', function() {
      this.key6.trigger('click');
      this.keyDiv.trigger('click');
      this.key2.trigger('click');
      this.keyEqual.trigger('click');
      this.keyDecimal.trigger('click');
      // Toggles decimal point at end of number
      expect($(DISPLAY)).toHaveText("3.");
      this.keyDecimal.trigger('click');
      expect($(DISPLAY)).toHaveText("3");
      this.keyDiv.trigger('click');
      this.key2.trigger('click');
      this.keyEqual.trigger('click');
      // Does nothing because result is already a fractional number
      expect(this.calculator.getLastEntryType()).toBe('digit');
      this.keyDecimal.trigger('click');
      expect($(DISPLAY)).toHaveText("1.5");
      this.keyDecimal.trigger('click');
      expect($(DISPLAY)).toHaveText("1.5");
    });

  });

  describe('CE key', function() {
    it('does nothing when pressed at fresh start (blank display)', function() {
      this.keyCE.trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      expect(this.calculator.getLastNumber()).toBeNull();
    });

    it('does nothing when pressed after AC key or CE key', function() {
      this.keyAC.trigger('click');
      this.keyCE.trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      this.keyCE.trigger('click');
      this.keyCE.trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      expect(this.calculator.getLastNumber()).toBeNull();
      expect(this.calculator.getLastEntryType()).toBe('digit');
    });

    it('clears display, active op and current number when pressed after digit key', function() {
      this.key5.trigger('click');
      this.keyDecimal.trigger('click');
      this.keyPlusMinus.trigger('click');
      this.key6.trigger('click');
      this.keyDiv.trigger('click');
      // The test itself:
      this.keyDecimal.trigger('click');
      this.key7.trigger('click');
      this.keyCE.trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      expect(this.calculator.getLastNumber()).toBeNull();
      expect(this.calculator.getHasDecimal()).toBe(false);
      expect(this.calculator.getLastOp()).toBe("");
      expect(this.calculator.getLastEntryType()).toBe('digit');
      expect(this.allButtons).not.toBeMatchedBy('button[class="active"]');
    });

    it('clears display, active op and current number when pressed after op key', function() {
      this.key0.trigger('click');
      this.key8.trigger('click');
      this.keyDecimal.trigger('click');
      this.keyPlusMinus.trigger('click');
      this.key9.trigger('click');
      // The test itself:
      this.keyAdd.trigger('click');
      this.keyCE.trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      expect(this.calculator.getLastNumber()).toBeNull();
      expect(this.calculator.getHasDecimal()).toBe(false);
      expect(this.calculator.getLastOp()).toBe("");
      expect(this.calculator.getLastEntryType()).toBe('digit');
      expect(this.allButtons).not.toBeMatchedBy('button[class="active"]');
    });

    it('clears display, active op and current number when pressed after plus-minus key', function() {
      this.key1.trigger('click');
      this.keyDecimal.trigger('click');
      this.key0.trigger('click');
      // The test itself:
      this.keyPlusMinus.trigger('click');
      this.keyCE.trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      expect(this.calculator.getLastNumber()).toBeNull();
      expect(this.calculator.getHasDecimal()).toBe(false);
      expect(this.calculator.getLastOp()).toBe("");
      expect(this.calculator.getLastEntryType()).toBe('digit');
      expect(this.allButtons).not.toBeMatchedBy('button[class="active"]');
    });

    it('clears display, active op and current number when pressed after decimal-point key', function() {
      this.key0.trigger('click');
      this.key0.trigger('click');
      this.key2.trigger('click');
      this.keyPlusMinus.trigger('click');
      this.keyPlusMinus.trigger('click');
      // The test itself:
      this.keyDecimal.trigger('click');
      this.keyCE.trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      expect(this.calculator.getLastNumber()).toBeNull();
      expect(this.calculator.getHasDecimal()).toBe(false);
      expect(this.calculator.getLastOp()).toBe("");
      expect(this.calculator.getLastEntryType()).toBe('digit');
      expect(this.allButtons).not.toBeMatchedBy('button[class="active"]');
    });

    it('clears displayed result, active op and decimal, when pressed after = key', function() {
      this.key3.trigger('click');
      this.keyPlusMinus.trigger('click');
      this.keyAdd.trigger('click');
      this.key2.trigger('click');
      this.keyPlusMinus.trigger('click');
      this.keyEqual.trigger('click');
      // The test itself:
      this.keyCE.trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      expect(this.calculator.getLastNumber()).toBeNull();
      expect(this.calculator.getHasDecimal()).toBe(false);
      expect(this.calculator.getLastOp()).toBe("");
      expect(this.calculator.getLastEntryType()).toBe('digit');
      expect(this.allButtons).not.toBeMatchedBy('button[class="active"]');
    });
  });

  describe('AC key', function() {
    it('resets everything when pressed right after start-up', function() {
      // AC resets everything right after start-up.
      this.keyAC.trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      expect(this.allButtons).not.toBeMatchedBy('button[class="active"]');
      expect(this.calculator.getLastNumber()).toBeNull();
      expect(this.calculator.getLastOp()).toBe("");
      expect(this.calculator.getEntriesArray()).toEqual([]);
      expect(this.calculator.getHasDecimal()).toBe(false);
      expect(this.calculator.getLastEntryType()).toBe("digit");
    });

    it('resets everything when pressed in the middle of inputting numbers and operations', function() {
      this.key0.trigger('click');
      this.key1.trigger('click');
      this.keyDecimal.trigger('click');
      this.key2.trigger('click');
      this.keyPlusMinus.trigger('click');
      this.key0.trigger('click');
      this.keySub.trigger('click');
      this.key3.trigger('click');
      this.keyDecimal.trigger('click');
      if (this.calculator.getEntriesArray()[0] !== -1.2 && this.calculator.getEntriesArray()[1] !== '-') {
        fail('Set-up failed');
      }
      // AC resets everything when pressed during input of numbers and operation.
      this.keyAC.trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      expect(this.allButtons).not.toBeMatchedBy('button[class="active"]');
      expect(this.calculator.getLastNumber()).toBeNull();
      expect(this.calculator.getLastOp()).toBe("");
      expect(this.calculator.getEntriesArray()).toEqual([]);
      expect(this.calculator.getHasDecimal()).toBe(false);
      expect(this.calculator.getLastEntryType()).toBe("digit");
    });

    it('resets everything when pressed after = key', function() {
      this.key8.trigger('click');
      this.keySub.trigger('click');
      this.key9.trigger('click');
      this.keyEqual.trigger('click');
      this.keyAC.trigger('click');
      // AC resets everything, after = pressed and calculation done
      expect($(DISPLAY)).toBeEmpty();
      expect(this.allButtons).not.toBeMatchedBy('button[class="active"]');
      expect(this.calculator.getLastNumber()).toBeNull();
      expect(this.calculator.getLastOp()).toBe("");
      expect(this.calculator.getEntriesArray()).toEqual([]);
      expect(this.calculator.getHasDecimal()).toBe(false);
      expect(this.calculator.getLastEntryType()).toBe("digit");
    });
  });

  describe('= key', function() {
    it('does nothing when pressed at fresh start (blank display)', function() {
      this.keyEqual.trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      expect(this.calculator.getEntriesArray()).toEqual([]);
      expect(this.calculator.getLastOp()).toBe("");
      expect(this.calculator.getLastNumber()).toBeNull();
      expect(this.calculator.getLastEntryType()).toBe("digit");
      expect(this.calculator.getHasDecimal()).toBe(false);
      expect(this.allButtons).not.toBeMatchedBy('button[class="active"]');
    });

    it('starts calculation and displays result, when pressed after digit/plus-minus/decimal key', function() {
      this.keyDecimal.trigger('click');
      this.key1.trigger('click');
      this.key2.trigger('click');
      this.key0.trigger('click');
      this.keySub.trigger('click');
      this.keyPlusMinus.trigger('click');
      this.keySub.trigger('click');
      this.key0.trigger('click');
      this.key3.trigger('click');
      this.keyDecimal.trigger('click');
      this.keyEqual.trigger('click');
      expect($(DISPLAY)).toHaveText("-3.12");
      expect(this.calculator.getLastNumber()).toBe(-3.12);
      this.keyAC.trigger('click');
      this.key5.trigger('click');
      this.keyDiv.trigger('click');
      this.key5.trigger('click');
      this.keyPlusMinus.trigger('click');
      this.keyEqual.trigger('click');
      expect($(DISPLAY)).toHaveText("-1");
      expect(this.calculator.getLastNumber()).toBe(-1);
      this.keyAC.trigger('click');
      this.key6.trigger('click');
      this.keyMult.trigger('click');
      this.key7.trigger('click');
      this.keyEqual.trigger('click');
      expect($(DISPLAY)).toHaveText("42");
      expect(this.calculator.getLastNumber()).toBe(42);
      expect(this.calculator.getLastEntryType()).toBe('digit');
      expect(this.allButtons).not.toBeMatchedBy('button[class="active"]');
    });

    it('discards last active op, starts calculation and displays result, when pressed after op key', function() {
      this.key4.trigger('click');
      this.key1.trigger('click');
      this.keyDecimal.trigger('click');
      this.keyPlusMinus.trigger('click');
      this.key0.trigger('click');
      this.key6.trigger('click');
      this.keyDiv.trigger('click');
      this.key2.trigger('click');
      this.keyDecimal.trigger('click');
      this.key0.trigger('click');
      this.keyPlusMinus.trigger('click');
      this.keyMult.trigger('click');
      this.keyEqual.trigger('click');
      expect($(DISPLAY)).toHaveText("20.53");
      expect(this.calculator.getLastNumber()).toBe(20.53);
      expect(this.calculator.getLastOp()).toBe("");
      expect(this.calculator.getLastEntryType()).toBe('digit');
      expect(this.allButtons).not.toBeMatchedBy('button[class="active"]');
    });

    it('starts calculations and displays result, when pressed after CE key', function() {
      this.key0.trigger('click');
      this.keyPlusMinus.trigger('click');
      this.key1.trigger('click');
      this.key2.trigger('click');
      this.keyDecimal.trigger('click');
      this.keySub.trigger('click');
      this.keySub.trigger('click');
      this.keyAdd.trigger('click');
      this.keyDecimal.trigger('click');
      this.key0.trigger('click');
      this.key3.trigger('click');
      this.keySub.trigger('click');
      this.key2.trigger('click');
      this.keyCE.trigger('click');
      this.keyEqual.trigger('click');
      expect($(DISPLAY)).toHaveText("12.03");
      expect(this.calculator.getLastNumber()).toBe(12.03);
      expect(this.calculator.getLastEntryType()).toBe('digit');
      this.keyAdd.trigger('click');
      this.key4.trigger('click');
      this.keyCE.trigger('click');
      this.keyEqual.trigger('click');
      expect($(DISPLAY)).toHaveText("12.03");
      expect(this.calculator.getLastNumber()).toBe(12.03);
      expect(this.calculator.getLastEntryType()).toBe('digit');
    });

    it('does nothing when pressed after AC', function() {
      this.key5.trigger('click');
      this.keyMult.trigger('click');
      this.key2.trigger('click');
      this.keyEqual.trigger('click');
      this.keyDecimal.trigger('click');
      this.key5.trigger('click');
      this.keySub.trigger('click');
      expect($(DISPLAY)).toHaveText('10.5');
      expect(this.calculator.getLastNumber()).toBe(10.5);
      this.keyAC.trigger('click');
      this.keyEqual.trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      expect(this.calculator.getLastNumber()).toBeNull();
      expect(this.calculator.getLastEntryType()).toBe('digit');
    });

    it('does nothing when pressed after = key', function() {
      this.key5.trigger('click');
      this.keyDiv.trigger('click');
      this.key2.trigger('click');
      this.keyEqual.trigger('click');
      this.keySub.trigger('click');
      this.keyDecimal.trigger('click');
      this.key5.trigger('click');
      this.keyEqual.trigger('click');
      expect($(DISPLAY)).toHaveText('2');
      expect(this.calculator.getLastNumber()).toBe(2);
      this.keyEqual.trigger('click');
      expect($(DISPLAY)).toHaveText('2');
      expect(this.calculator.getLastNumber()).toBe(2);
      expect(this.calculator.getLastEntryType()).toBe('digit');
    });
  });

  describe('calculates', function () {
    it('(-1) + 2 correctly', function() {
      this.key1.trigger('click');
      this.keyPlusMinus.trigger('click');
      this.keyAdd.trigger('click');
      this.key2.trigger('click');
      this.keyEqual.trigger('click');
      expect($(DISPLAY)).toHaveText('1');
      expect(this.calculator.getLastNumber()).toBe(1);
    });

    it('3 - (-4) correctly', function() {
      this.key3.trigger('click');
      this.keySub.trigger('click');
      this.key4.trigger('click');
      this.keyPlusMinus.trigger('click');
      this.keyEqual.trigger('click');
      expect($(DISPLAY)).toHaveText('7');
      expect(this.calculator.getLastNumber()).toBe(7);
    });


    it('5 x 6 correctly', function() {
      this.key5.trigger('click');
      this.keyMult.trigger('click');
      this.key6.trigger('click');
      this.keyEqual.trigger('click');
      expect($(DISPLAY)).toHaveText("30");
      expect(this.calculator.getLastNumber()).toBe(30);
    });

    it('7 / 2 correctly', function() {
      this.key7.trigger('click');
      this.keyDiv.trigger('click');
      this.key2.trigger('click');
      this.keyEqual.trigger('click');
      expect($(DISPLAY)).toHaveText("3.5");
      expect(this.calculator.getLastNumber()).toBe(3.5);
    });

    it('1 + 2 - 3 correctly', function() {
      this.key1.trigger('click');
      this.keyAdd.trigger('click');
      this.key2.trigger('click');
      this.keySub.trigger('click');
      this.key3.trigger('click');
      this.keyEqual.trigger('click');
      expect($(DISPLAY)).toHaveText("0");
      expect(this.calculator.getLastNumber()).toBe(0);
    });

    it('5 x 4 / 2 correctly', function() {
      this.key5.trigger('click');
      this.keyMult.trigger('click');
      this.key4.trigger('click');
      this.keyDiv.trigger('click');
      this.key2.trigger('click');
      this.keyEqual.trigger('click');
      expect($(DISPLAY)).toHaveText("10");
      expect(this.calculator.getLastNumber()).toBe(10);
    });

    it('8 + 9 x 2 correctly', function() {
      this.key8.trigger('click');
      this.keyAdd.trigger('click');
      this.key9.trigger('click');
      this.keyMult.trigger('click');
      this.key2.trigger('click');
      this.keyEqual.trigger('click');
      expect($(DISPLAY)).toHaveText("26");
      expect(this.calculator.getLastNumber()).toBe(26);
    });

    it('10 - 1 / 2 correctly', function() {
      this.key1.trigger('click');
      this.key0.trigger('click');
      this.keySub.trigger('click');
      this.key1.trigger('click');
      this.keyDiv.trigger('click');
      this.key2.trigger('click');
      this.keyEqual.trigger('click');
      expect($(DISPLAY)).toHaveText("9.5");
      expect(this.calculator.getLastNumber()).toBe(9.5);
    });

    it('4 x 2 - 16 correctly', function() {
      this.key4.trigger('click');
      this.keyMult.trigger('click');
      this.key2.trigger('click');
      this.keySub.trigger('click');
      this.key1.trigger('click');
      this.key6.trigger('click');
      this.keyEqual.trigger('click');
      expect($(DISPLAY)).toHaveText("-8");
      expect(this.calculator.getLastNumber()).toBe(-8);
    });

    it('14 / 7 + 8 correctly', function() {
      this.key1.trigger('click');
      this.key4.trigger('click');
      this.keyDiv.trigger('click');
      this.key7.trigger('click');
      this.keyAdd.trigger('click');
      this.key8.trigger('click');
      this.keyEqual.trigger('click');
      expect($(DISPLAY)).toHaveText("10");
      expect(this.calculator.getLastNumber()).toBe(10);
    });
  });

  describe('active operation key', function() {
    it('resets when digit/plus-minus/equals/CE/AC key is pressed', function() {
      this.key9.trigger('click');
      this.keyDiv.trigger('click');
      expect(this.keyDiv).toHaveClass('active');

      this.key1.trigger('click');
      // Active op resets when digit key pressed
      expect(this.allButtons).not.toBeMatchedBy('button[class="active"]');
      expect(this.calculator.getLastOp()).toBe("");
      expect(this.calculator.getLastEntryType()).toBe("digit");

      this.keyMult.trigger('click');
      expect(this.keyMult).toHaveClass('active');
      this.keyPlusMinus.trigger('click');
      // Active op resets when plus-minus key pressed
      expect(this.allButtons).not.toBeMatchedBy('button[class="active"]');
      expect(this.calculator.getLastOp()).toBe("");
      expect(this.calculator.getLastEntryType()).toBe("digit");

      this.keyAdd.trigger('click');
      expect(this.keyAdd).toHaveClass('active');
      this.keyEqual.trigger('click');
      // Active op resets when = key pressed
      expect(this.allButtons).not.toBeMatchedBy('button[class="active"]');
      expect(this.calculator.getLastOp()).toBe("");
      expect(this.calculator.getLastEntryType()).toBe("digit");

      this.keySub.trigger('click');
      expect(this.keySub).toHaveClass('active');
      this.keyCE.trigger('click');
      // Active op resets when CE key pressed
      expect(this.allButtons).not.toBeMatchedBy('button[class="active"]');
      expect(this.calculator.getLastOp()).toBe("");
      expect(this.calculator.getLastEntryType()).toBe("digit");

      this.key0.trigger('click');
      this.keyDiv.trigger('click');
      expect(this.keyDiv).toHaveClass('active');
      this.keyAC.trigger('click');
      // Active op resets when AC key pressed
      expect(this.allButtons).not.toBeMatchedBy('button[class="active"]');
      expect(this.calculator.getLastOp()).toBe("");
      expect(this.calculator.getLastEntryType()).toBe("digit");
    });
  });

  describe('upon encountering Infinity or -Infinity result', function() {
    beforeEach(function() {
      // Sets up spy...
      spyOn(window, 'alert');
    });

    it('alerts and resets', function() {
      this.key2.trigger('click');
      this.keyDiv.trigger('click');
      this.key0.trigger('click');
      this.keyEqual.trigger('click');
      expect(window.alert).toHaveBeenCalled();
      expect($(DISPLAY)).toBeEmpty();
      expect(this.allButtons).not.toHaveClass('active');
      expect(this.allButtons).not.toBeMatchedBy('button[class="active"]');
      this.key3.trigger('click');
      this.keyPlusMinus.trigger('click');
      this.keyDiv.trigger('click');
      this.key0.trigger('click');
      this.keyEqual.trigger('click');
      expect(window.alert).toHaveBeenCalled();
      expect($(DISPLAY)).toBeEmpty();
      expect(this.allButtons).not.toHaveClass('active');
      expect(this.allButtons).not.toBeMatchedBy('button[class="active"]');
    });
  });

  describe('upon encountering NaN result (e.g. 0 / 0 operation)', function() {
    beforeEach(function() {
      // Sets up spy...
      spyOn(window, 'alert');
    });

    it('alerts and resets', function() {
      this.key0.trigger('click');
      this.keyDiv.trigger('click');
      this.key0.trigger('click');
      this.keyEqual.trigger('click');
      expect(window.alert).toHaveBeenCalled();
      expect($(DISPLAY)).toBeEmpty();
      expect(this.allButtons).not.toHaveClass('active');
      expect(this.allButtons).not.toBeMatchedBy('button[class="active"]');
      this.key0.trigger('click');
      this.keyDiv.trigger('click');
      this.key0.trigger('click');
      this.keyPlusMinus.trigger('click');
      this.keyEqual.trigger('click');
      expect(window.alert).toHaveBeenCalled();
      expect($(DISPLAY)).toBeEmpty();
      expect(this.allButtons).not.toHaveClass('active');
      expect(this.allButtons).not.toBeMatchedBy('button[class="active"]');
    });
  });

  describe('inputs list', function () {
    it('does not append current number, nor op key, when an op key is pressed', function () {
      this.key3.trigger('click');
      this.keySub.trigger('click');
      expect($(INPUT_HISTORY)).toBeEmpty();

      this.keyDecimal.trigger('click');
      // Now input list should not be empty...
      expect($(INPUT_HISTORY)).toContainText('3');
      expect($(INPUT_HISTORY)).toContainText('-');
      this.key4.trigger('click');
      this.keyDiv.trigger('click');
      // but current number is not appended after the op key
      expect($(INPUT_HISTORY)).not.toContainText('4');
      expect($(INPUT_HISTORY)).not.toContainText(DIVISION);
    });

    it('appends current number and op key upon digit key press', function () {
      this.key1.trigger('click');
      this.keyMult.trigger('click');
      this.key2.trigger('click');
      expect($(INPUT_HISTORY)).toContainText('1');
      expect($(INPUT_HISTORY)).toContainText(MULTIPLICATION);
      expect($(INPUT_HISTORY)).not.toContainText('2');
    });

    it('appends current number and op key upon decimal-point key press', function () {
      this.key4.trigger('click');
      this.keyAdd.trigger('click');
      this.keyDecimal.trigger('click');
      expect($(INPUT_HISTORY)).toContainText('4');
      expect($(INPUT_HISTORY)).toContainText('+');
      expect($(INPUT_HISTORY)).not.toContainText('.');
    });

    it('is emptied upon = key press', function () {
      this.key5.trigger('click');
      this.keyDiv.trigger('click');
      this.keyEqual.trigger('click');
      // Inputs not added when list is empty
      expect($(INPUT_HISTORY)).toBeEmpty();
      // expect($(INPUT_HISTORY)).not.toContainText('5');
      // expect($(INPUT_HISTORY)).not.toContainText(DIVISION);
      // expect($(INPUT_HISTORY)).not.toContainText('=');

      this.keyDiv.trigger('click');
      this.key6.trigger('click');
      // Now list should not be empty
      expect($(INPUT_HISTORY)).toContainText('5');
      expect($(INPUT_HISTORY)).toContainText(DIVISION);
      this.keyEqual.trigger('click');
      // List should be empty again
      expect($(INPUT_HISTORY)).toBeEmpty();
    });
  })
});
