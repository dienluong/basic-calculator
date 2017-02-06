/* eslint-env jasmine */
/* global loadFixtures, calcFactory */
describe('calculator', function () {
  const BUTTONS = 'div#buttons';
  const DISPLAY = 'pre#display';
  const PLUS_MINUS = '\u00B1';
  const MULTIPLICATION = '\u00D7';
  const DIVISION = '\u00F7';
  jasmine.getFixtures().fixturesPath = 'spec/html/fixtures';

  beforeAll(function() {
    this.initData = {display: DISPLAY, buttons: BUTTONS};
  });

  beforeEach(function() {
    loadFixtures('calculator-fixture.html');
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
      $('button:contains("0")').trigger('click');
      expect($(DISPLAY)).toHaveText('0');
      $('button:contains("AC")').trigger('click');
      $('button:contains("9")').trigger('click');
      expect($(DISPLAY)).toHaveText('9');
      $('button:contains("CE")').trigger('click');
      $('button:contains("0")').trigger('click');
      expect($(DISPLAY)).toHaveText('0');
      done();
    });

    it('appends digit to current displayed number', function(done) {
      $('button:contains("1")').trigger('click');
      $('button:contains("0")').trigger('click');
      expect($(DISPLAY)).toHaveText('10');
      // Appends even after plus-minus pressed
      $(`button:contains(${PLUS_MINUS})`).trigger('click');
      $('button:contains("2")').trigger('click');
      expect($(DISPLAY)).toHaveText('-102');
      // Appends even after decimal-point pressed
      $('button:contains(".")').trigger('click');
      $('button:contains("3")').trigger('click');
      expect($(DISPLAY)).toHaveText('-102.3');
      done();
    });

    it('appends digit to displayed result, after = pressed', function(done) {
      $('button:contains("1")').trigger('click');
      $('button:contains("0")').trigger('click');
      $(`button:contains(${MULTIPLICATION})`).trigger('click');
      $('button:contains("2")').trigger('click');
      $('button:contains("0")').trigger('click');
      $('button:contains("=")').trigger('click');
      $('button:contains("5")').trigger('click');
      expect($(DISPLAY)).toHaveText('2005');
      expect(this.calculator.getLastNumber()).toBe(2005);
      done();
    });

    it('does not display leading zero when followed by non-zero digit', function(done) {
      $('button:contains("0")').trigger('click');
      expect($(DISPLAY)).toHaveText('0');
      $('button:contains("0")').trigger('click');
      expect($(DISPLAY)).toHaveText('0');
      $('button:contains("5")').trigger('click');
      expect($(DISPLAY)).toHaveText('5');
      done();
    });

    it('saves last number and op, clears display and displays digit, when digit pressed after an op key', function(done) {
      $('button:contains("2")').trigger('click');
      $('button:contains("3")').trigger('click');
      $('button:contains("+")').trigger('click');
      $('button:contains("4")').trigger('click');
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
      $('button:contains("-")').trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      expect($('button')).not.toBeMatchedBy('button[class="active"]');
      $('button:contains("+")').trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      expect($('button')).not.toBeMatchedBy('button[class="active"]');
      $(`button:contains(${DIVISION})`).trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      expect($('button')).not.toBeMatchedBy('button[class="active"]');
      $(`button:contains(${MULTIPLICATION})`).trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      expect($('button')).not.toBeMatchedBy('button[class="active"]');
      expect($('button')).not.toHaveClass('active'); // should be the same as above expect()
      expect(this.calculator.getLastEntryType()).toBe('digit');
      done();
    });

    it('displays nothing and does not highlight op key, when pressed after AC key', function(done) {
      $('button:contains("4")').trigger('click');
      $('button:contains("-")').trigger('click');
      $('button:contains("2")').trigger('click');
      $('button:contains("AC")').trigger('click');
      $('button:contains("+")').trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      expect($('button')).not.toBeMatchedBy('button[class="active"]');
      expect(this.calculator.getLastOp()).toBe('');
      expect(this.calculator.getLastEntryType()).toBe('digit');
      done();
    });

    it('displays nothing and does not highlight op key, when pressed after CE key', function(done) {
      $('button:contains("4")').trigger('click');
      $('button:contains("-")').trigger('click');
      $('button:contains("2")').trigger('click');
      $('button:contains("CE")').trigger('click');
      $(`button:contains(${MULTIPLICATION})`).trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      expect($('button')).not.toBeMatchedBy('button[class="active"]');
      expect($('button')).not.toHaveClass('active');
      expect(this.calculator.getLastNumber()).toBeNull();
      expect(this.calculator.getLastOp()).toBe('');
      expect(this.calculator.getLastEntryType()).toBe('digit');
      done();
    });

    it('saves pressed op key as current op, highlights op key, if following digit key', function(done) {
      $('button:contains("6")').trigger('click');
      $(`button:contains(${DIVISION})`).trigger('click');
      expect($(DISPLAY)).toHaveText('6');
      expect(this.calculator.getLastOp()).toBe(DIVISION);
      expect(this.calculator.getLastNumber()).toBe(6);
      expect($(`button:contains(${DIVISION})`)).toHaveClass("active");
      expect($(`button:not(:contains(${DIVISION}))`)).not.toHaveClass("active");
      expect(this.calculator.getLastEntryType()).toBe('operation');
      done();
    });

    it('resets previous active op key, set current active op key or toggles if pressing the same op key', function(done) {
      // Pressed 7, division, multiplication
      $('button:contains("7")').trigger('click');
      $(`button:contains(${DIVISION})`).trigger('click');
      expect(this.calculator.getLastOp()).toBe(DIVISION);
      expect($(`button:contains(${DIVISION})`)).toHaveClass("active");
      expect($(`button:not(:contains(${DIVISION}))`)).not.toHaveClass("active");
      expect(this.calculator.getLastEntryType()).toBe('operation');
      $(`button:contains(${MULTIPLICATION})`).trigger('click');
      // Resets division op key and sets multiplication op key
      expect($(DISPLAY)).toHaveText('7');
      expect(this.calculator.getLastOp()).toBe(MULTIPLICATION);
      expect($(`button:not(:contains(${MULTIPLICATION}))`)).not.toHaveClass("active");
      expect($(`button:contains(${MULTIPLICATION})`)).toHaveClass("active");
      expect(this.calculator.getLastEntryType()).toBe('operation');
      // Toggles..
      $(`button:contains(${MULTIPLICATION})`).trigger('click');
      expect(this.calculator.getLastOp()).toBe("");
      expect($('button')).not.toBeMatchedBy('button[class="active"]');
      // Should return to digits entry mode...
      expect(this.calculator.getLastEntryType()).toBe('digit');
      $('button:contains(".")').trigger('click');
      $('button:contains("7")').trigger('click');
      expect($(DISPLAY)).toHaveText('7.7');
      // Finally, op key highlighted
      $("button:contains('+')").trigger('click');
      expect(this.calculator.getLastOp()).toBe("+");
      expect($("button:not(:contains('+'))")).not.toHaveClass('active');
      expect($("button:contains('+')")).toHaveClass("active");

      done();
    });

    it('saves pressed op key as current op, highlights op key, if following plus-minus key', function(done) {
      // Pressed 8, +/-, -
      $('button:contains("8")').trigger('click');
      $(`button:contains(${PLUS_MINUS})`).trigger('click');
      $('button:contains("-")').trigger('click');
      expect($(DISPLAY)).toHaveText('-8');
      expect(this.calculator.getLastOp()).toBe("-");
      expect($('button:contains("-")')).toHaveClass("active");
      expect($('button:not(:contains("-"))')).not.toHaveClass("active");
      expect(this.calculator.getLastEntryType()).toBe('operation');
      done();
    });

    it('saves pressed op key as current op, highlights op key, if following decimal-point key', function(done) {
      $('button:contains("9")').trigger('click');
      $('button:contains(".")').trigger('click');
      $('button:contains("+")').trigger('click');
      expect($(DISPLAY)).toHaveText('9.');
      expect(this.calculator.getLastOp()).toBe("+");
      expect($('button:contains("+")')).toHaveClass("active");
      expect($('button:not(:contains("+"))')).not.toHaveClass("active");
      expect(this.calculator.getLastEntryType()).toBe('operation');
      done();
    });

    it('saves pressed op key as current op, highlights op key, if following = key', function(done) {
      $('button:contains("9")').trigger('click');
      $(`button:contains(${DIVISION})`).trigger('click');
      $('button:contains("2")').trigger('click');
      $('button:contains("=")').trigger('click');
      $('button:contains("-")').trigger('click');
      expect(this.calculator.getLastOp()).toBe("-");
      expect($('button:contains("-")')).toHaveClass("active");
      expect($('button:not(:contains("-"))')).not.toHaveClass("active");
      expect(this.calculator.getLastEntryType()).toBe('operation');
      expect($(DISPLAY)).toHaveText('4.5');
      done();
    });
  });

  describe('plus-minus key', function() {
    it('displays nothing when pressed after CE, AC or at fresh start (blank display)', function() {
      $(`button:contains(${PLUS_MINUS})`).trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      $(`button:contains(${PLUS_MINUS})`).trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      $('button:contains("0")').trigger('click');
      $('button:contains("AC")').trigger('click');
      $(`button:contains(${PLUS_MINUS})`).trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      $('button:contains("1")').trigger('click');
      $('button:contains("CE")').trigger('click');
      $(`button:contains(${PLUS_MINUS})`).trigger('click');
      expect($(DISPLAY)).toBeEmpty();
    });

    it('toggles negative sign on displayed none-zero number, if pressed after digit/op/decimal/plus-minus key', function() {
      // Pressed 0, 1, +/-
      $('button:contains("0")').trigger('click');
      $('button:contains("1")').trigger('click');
      $(`button:contains(${PLUS_MINUS})`).trigger('click');
      expect($(DISPLAY)).toHaveText("-1");
      // Toggles negative sign
      $(`button:contains(${PLUS_MINUS})`).trigger('click');
      expect($(DISPLAY)).toHaveText("1");
      // Toggles after op key
      $(`button:contains(${MULTIPLICATION})`).trigger('click');
      $(`button:contains(${PLUS_MINUS})`).trigger('click');
      expect($(DISPLAY)).toHaveText("-1");
      // Toggles after decimal-point key
      $('button:contains(".")').trigger('click');
      $(`button:contains(${PLUS_MINUS})`).trigger('click');
      expect($(DISPLAY)).toHaveText("1.");
      $('button:contains("2")').trigger('click');
      $(`button:contains(${PLUS_MINUS})`).trigger('click');
      expect($(DISPLAY)).toHaveText("-1.2");
      expect(this.calculator.getLastEntryType()).toBe('digit');
    });

    it('does nothing if displayed number/result is zero', function() {
      $('button:contains("0")').trigger('click');
      $(`button:contains(${PLUS_MINUS})`).trigger('click');
      expect($(DISPLAY)).toHaveText("0");
      $('button:contains("3")').trigger('click');
      $('button:contains("-")').trigger('click');
      $('button:contains("3")').trigger('click');
      $('button:contains("=")').trigger('click');
      expect($(DISPLAY)).toHaveText("0");
      $(`button:contains(${PLUS_MINUS})`).trigger('click');
      expect($(DISPLAY)).toHaveText("0");
    });

    it('toggles negative sign on displayed non-zero result, if pressed after = key', function() {
      $('button:contains("0")').trigger('click');
      $('button:contains("4")').trigger('click');
      $(`button:contains(${MULTIPLICATION})`).trigger('click');
      $('button:contains("6")').trigger('click');
      $('button:contains("=")').trigger('click');
      $(`button:contains(${PLUS_MINUS})`).trigger('click');
      expect($(DISPLAY)).toHaveText("-24");
      expect(this.calculator.getLastEntryType()).toBe('digit');
    });
  });

  describe('decimal-point key', function() {
    it('displays "0." when pressed after CE or AC, or at fresh start (blank display)', function() {
      $('button:contains(".")').trigger('click');
      expect($(DISPLAY)).toHaveText("0.");
      $('button:contains("5")').trigger('click');
      $('button:contains("CE")').trigger('click');
      $('button:contains(".")').trigger('click');
      expect($(DISPLAY)).toHaveText("0.");
      $('button:contains("6")').trigger('click');
      $('button:contains("AC")').trigger('click');
      $('button:contains(".")').trigger('click');
      expect($(DISPLAY)).toHaveText("0.");
    });

    it('toggles decimal-point if current number ends with one or doesn\'t have one; otherwise does nothing', function() {
      $('button:contains(".")').trigger('click');
      expect($(DISPLAY)).toHaveText("0.");
      expect(this.calculator.getLastEntryType()).toBe('digit');
      // Toggles
      $('button:contains(".")').trigger('click');
      expect($(DISPLAY)).toHaveText("0");
      $('button:contains("1")').trigger('click');
      $('button:contains(".")').trigger('click');
      expect($(DISPLAY)).toHaveText("1.");
      // Toggles for negative numbers too
      $(`button:contains(${PLUS_MINUS})`).trigger('click');
      $('button:contains(".")').trigger('click');
      expect($(DISPLAY)).toHaveText("-1");
      expect(this.calculator.getLastEntryType()).toBe('digit');
      // Does nothing if number already has decimal-point
      $('button:contains(".")').trigger('click');
      $('button:contains("2")').trigger('click');
      $('button:contains(".")').trigger('click');
      expect($(DISPLAY)).toHaveText("-1.2");
      expect(this.calculator.getLastEntryType()).toBe('digit');
    });

    it('saves current number and op, and displays "0." when pressed after op key', function() {
      $('button:contains("0")').trigger('click');
      $('button:contains("3")').trigger('click');
      $('button:contains("4")').trigger('click');
      $('button:contains(".")').trigger('click');
      $(`button:contains(${DIVISION})`).trigger('click');
      $('button:contains(".")').trigger('click');
      expect(this.calculator.getEntriesArray()[0]).toBe(34.0);
      expect(this.calculator.getEntriesArray()[1]).toBe('\u00F7');
      expect($(DISPLAY)).toHaveText("0.");
      expect(this.calculator.getLastEntryType()).toBe('digit');
    });

    it('toggles decimal-point if result ends with one or does not already have one, when pressed after = key', function() {
      $('button:contains("6")').trigger('click');
      $(`button:contains(${DIVISION})`).trigger('click');
      $('button:contains("2")').trigger('click');
      $('button:contains("=")').trigger('click');
      $('button:contains(".")').trigger('click');
      // Toggles decimal point at end of number
      expect($(DISPLAY)).toHaveText("3.");
      $('button:contains(".")').trigger('click');
      expect($(DISPLAY)).toHaveText("3");
      $(`button:contains(${DIVISION})`).trigger('click');
      $('button:contains("2")').trigger('click');
      $('button:contains("=")').trigger('click');
      // Does nothing because result is already a fractional number
      expect(this.calculator.getLastEntryType()).toBe('digit');
      $('button:contains(".")').trigger('click');
      expect($(DISPLAY)).toHaveText("1.5");
      $('button:contains(".")').trigger('click');
      expect($(DISPLAY)).toHaveText("1.5");
    });

  });

  describe('CE key', function() {
    it('does nothing when pressed at fresh start (blank display)', function() {
      $('button:contains("CE")').trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      expect(this.calculator.getLastNumber()).toBeNull();
    });

    it('does nothing when pressed after AC key or CE key', function() {
      $('button:contains("AC")').trigger('click');
      $('button:contains("CE")').trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      $('button:contains("CE")').trigger('click');
      $('button:contains("CE")').trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      expect(this.calculator.getLastNumber()).toBeNull();
      expect(this.calculator.getLastEntryType()).toBe('digit');
    });

    it('clears display, active op and current number when pressed after digit key', function() {
      $('button:contains("5")').trigger('click');
      $('button:contains(".")').trigger('click');
      $(`button:contains(${PLUS_MINUS})`).trigger('click');
      $('button:contains("6")').trigger('click');
      $(`button:contains(${DIVISION})`).trigger('click');
      // The test itself:
      $('button:contains(".")').trigger('click');
      $('button:contains("7")').trigger('click');
      $('button:contains("CE")').trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      expect(this.calculator.getLastNumber()).toBeNull();
      expect(this.calculator.getHasDecimal()).toBe(false);
      expect(this.calculator.getLastOp()).toBe("");
      expect(this.calculator.getLastEntryType()).toBe('digit');
      expect($('button')).not.toBeMatchedBy('button[class="active"]');
    });

    it('clears display, active op and current number when pressed after op key', function() {
      $('button:contains("0")').trigger('click');
      $('button:contains("8")').trigger('click');
      $('button:contains(".")').trigger('click');
      $(`button:contains(${PLUS_MINUS})`).trigger('click');
      $('button:contains("9")').trigger('click');
      // The test itself:
      $(`button:contains("+")`).trigger('click');
      $('button:contains("CE")').trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      expect(this.calculator.getLastNumber()).toBeNull();
      expect(this.calculator.getHasDecimal()).toBe(false);
      expect(this.calculator.getLastOp()).toBe("");
      expect(this.calculator.getLastEntryType()).toBe('digit');
      expect($('button')).not.toBeMatchedBy('button[class="active"]');
    });

    it('clears display, active op and current number when pressed after plus-minus key', function() {
      $('button:contains("1")').trigger('click');
      $('button:contains(".")').trigger('click');
      $('button:contains("0")').trigger('click');
      // The test itself:
      $(`button:contains(${PLUS_MINUS})`).trigger('click');
      $('button:contains("CE")').trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      expect(this.calculator.getLastNumber()).toBeNull();
      expect(this.calculator.getHasDecimal()).toBe(false);
      expect(this.calculator.getLastOp()).toBe("");
      expect(this.calculator.getLastEntryType()).toBe('digit');
      expect($('button')).not.toBeMatchedBy('button[class="active"]');
    });

    it('clears display, active op and current number when pressed after decimal-point key', function() {
      $('button:contains("0")').trigger('click');
      $('button:contains("0")').trigger('click');
      $('button:contains("2")').trigger('click');
      $(`button:contains(${PLUS_MINUS})`).trigger('click');
      $(`button:contains(${PLUS_MINUS})`).trigger('click');
      // The test itself:
      $('button:contains(".")').trigger('click');
      $('button:contains("CE")').trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      expect(this.calculator.getLastNumber()).toBeNull();
      expect(this.calculator.getHasDecimal()).toBe(false);
      expect(this.calculator.getLastOp()).toBe("");
      expect(this.calculator.getLastEntryType()).toBe('digit');
      expect($('button')).not.toBeMatchedBy('button[class="active"]');
    });

    it('clears displayed result, active op and decimal, when pressed after = key', function() {
      $('button:contains("3")').trigger('click');
      $(`button:contains(${PLUS_MINUS})`).trigger('click');
      $('button:contains("+")').trigger('click');
      $('button:contains("2")').trigger('click');
      $(`button:contains(${PLUS_MINUS})`).trigger('click');
      $('button:contains("=")').trigger('click');
      // The test itself:
      $('button:contains("CE")').trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      expect(this.calculator.getLastNumber()).toBeNull();
      expect(this.calculator.getHasDecimal()).toBe(false);
      expect(this.calculator.getLastOp()).toBe("");
      expect(this.calculator.getLastEntryType()).toBe('digit');
      expect($('button')).not.toBeMatchedBy('button[class="active"]');
    });
  });

  describe('AC key', function() {
    it('resets everything when pressed right after start-up', function() {
      // AC resets everything right after start-up.
      $('button:contains("AC")').trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      expect($('button')).not.toBeMatchedBy('button[class="active"]');
      expect(this.calculator.getLastNumber()).toBeNull();
      expect(this.calculator.getLastOp()).toBe("");
      expect(this.calculator.getEntriesArray()).toEqual([]);
      expect(this.calculator.getHasDecimal()).toBe(false);
      expect(this.calculator.getLastEntryType()).toBe("digit");
    });

    it('resets everything when pressed in the middle of inputting numbers and operations', function() {
      $('button:contains("0")').trigger('click');
      $('button:contains("1")').trigger('click');
      $('button:contains(".")').trigger('click');
      $('button:contains("2")').trigger('click');
      $(`button:contains(${PLUS_MINUS})`).trigger('click');
      $('button:contains("0")').trigger('click');
      $('button:contains("-")').trigger('click');
      $('button:contains("3")').trigger('click');
      $('button:contains(".")').trigger('click');
      if (this.calculator.getEntriesArray()[0] !== -1.2 && this.calculator.getEntriesArray()[1] !== '-') {
        fail('Set-up failed');
      }
      // AC resets everything when pressed during input of numbers and operation.
      $('button:contains("AC")').trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      expect($('button')).not.toBeMatchedBy('button[class="active"]');
      expect(this.calculator.getLastNumber()).toBeNull();
      expect(this.calculator.getLastOp()).toBe("");
      expect(this.calculator.getEntriesArray()).toEqual([]);
      expect(this.calculator.getHasDecimal()).toBe(false);
      expect(this.calculator.getLastEntryType()).toBe("digit");
    });

    it('resets everything when pressed after = key', function() {
      $('button:contains("8")').trigger('click');
      $('button:contains("-")').trigger('click');
      $('button:contains("9")').trigger('click');
      $('button:contains("=")').trigger('click');
      $('button:contains("AC")').trigger('click');
      // AC resets everything, after = pressed and calculation done
      expect($(DISPLAY)).toBeEmpty();
      expect($('button')).not.toBeMatchedBy('button[class="active"]');
      expect(this.calculator.getLastNumber()).toBeNull();
      expect(this.calculator.getLastOp()).toBe("");
      expect(this.calculator.getEntriesArray()).toEqual([]);
      expect(this.calculator.getHasDecimal()).toBe(false);
      expect(this.calculator.getLastEntryType()).toBe("digit");
    });
  });

  describe('= key', function() {
    it('does nothing when pressed at fresh start (blank display)', function() {
      $('button:contains("=")').trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      expect(this.calculator.getEntriesArray()).toEqual([]);
      expect(this.calculator.getLastOp()).toBe("");
      expect(this.calculator.getLastNumber()).toBeNull();
      expect(this.calculator.getLastEntryType()).toBe("digit");
      expect(this.calculator.getHasDecimal()).toBe(false);
      expect($('button')).not.toBeMatchedBy('button[class="active"]');
    });

    it('starts calculation and displays result, when pressed after digit/plus-minus/decimal key', function() {
      $('button:contains(".")').trigger('click');
      $('button:contains("1")').trigger('click');
      $('button:contains("2")').trigger('click');
      $('button:contains("0")').trigger('click');
      $('button:contains("-")').trigger('click');
      $(`button:contains(${PLUS_MINUS})`).trigger('click');
      $('button:contains("-")').trigger('click');
      $('button:contains("0")').trigger('click');
      $('button:contains("3")').trigger('click');
      $('button:contains(".")').trigger('click');
      $('button:contains("=")').trigger('click');
      expect($(DISPLAY)).toHaveText("-3.12");
      expect(this.calculator.getLastNumber()).toBe(-3.12);
      $('button:contains("AC")').trigger('click');
      $('button:contains("5")').trigger('click');
      $(`button:contains(${DIVISION})`).trigger('click');
      $('button:contains("5")').trigger('click');
      $(`button:contains(${PLUS_MINUS})`).trigger('click');
      $('button:contains("=")').trigger('click');
      expect($(DISPLAY)).toHaveText("-1");
      expect(this.calculator.getLastNumber()).toBe(-1);
      $('button:contains("AC")').trigger('click');
      $('button:contains("6")').trigger('click');
      $(`button:contains(${MULTIPLICATION})`).trigger('click');
      $('button:contains("7")').trigger('click');
      $('button:contains("=")').trigger('click');
      expect($(DISPLAY)).toHaveText("42");
      expect(this.calculator.getLastNumber()).toBe(42);
      expect(this.calculator.getLastEntryType()).toBe('digit');
      expect($('button')).not.toBeMatchedBy('button[class="active"]');
    });

    it('discards last active op, starts calculation and displays result, when pressed after op key', function() {
      $('button:contains("4")').trigger('click');
      $('button:contains("1")').trigger('click');
      $('button:contains(".")').trigger('click');
      $(`button:contains(${PLUS_MINUS})`).trigger('click');
      $('button:contains("0")').trigger('click');
      $('button:contains("6")').trigger('click');
      $(`button:contains(${DIVISION})`).trigger('click');
      $('button:contains("2")').trigger('click');
      $('button:contains(".")').trigger('click');
      $('button:contains("0")').trigger('click');
      $(`button:contains(${PLUS_MINUS})`).trigger('click');
      $(`button:contains(${MULTIPLICATION})`).trigger('click');
      $('button:contains("=")').trigger('click');
      expect($(DISPLAY)).toHaveText("20.53");
      expect(this.calculator.getLastNumber()).toBe(20.53);
      expect(this.calculator.getLastOp()).toBe("");
      expect(this.calculator.getLastEntryType()).toBe('digit');
      expect($('button')).not.toBeMatchedBy('button[class="active"]');
    });

    it('starts calculations and displays result, when pressed after CE key', function() {
      $('button:contains("0")').trigger('click');
      $(`button:contains(${PLUS_MINUS})`).trigger('click');
      $('button:contains("1")').trigger('click');
      $('button:contains("2")').trigger('click');
      $('button:contains(".")').trigger('click');
      $('button:contains("-")').trigger('click');
      $('button:contains("-")').trigger('click');
      $('button:contains("+")').trigger('click');
      $('button:contains(".")').trigger('click');
      $('button:contains("0")').trigger('click');
      $('button:contains("3")').trigger('click');
      $('button:contains("-")').trigger('click');
      $('button:contains("2")').trigger('click');
      $('button:contains("CE")').trigger('click');
      $('button:contains("=")').trigger('click');
      expect($(DISPLAY)).toHaveText("12.03");
      expect(this.calculator.getLastNumber()).toBe(12.03);
      expect(this.calculator.getLastEntryType()).toBe('digit');
      $('button:contains("+")').trigger('click');
      $('button:contains("4")').trigger('click');
      $('button:contains("CE")').trigger('click');
      $('button:contains("=")').trigger('click');
      expect($(DISPLAY)).toHaveText("12.03");
      expect(this.calculator.getLastNumber()).toBe(12.03);
      expect(this.calculator.getLastEntryType()).toBe('digit');
    });

    it('does nothing when pressed after AC', function() {
      $('button:contains("5")').trigger('click');
      $(`button:contains(${MULTIPLICATION})`).trigger('click');
      $('button:contains("2")').trigger('click');
      $('button:contains("=")').trigger('click');
      $('button:contains(".")').trigger('click');
      $('button:contains("5")').trigger('click');
      $('button:contains("-")').trigger('click');
      expect($(DISPLAY)).toHaveText('10.5');
      expect(this.calculator.getLastNumber()).toBe(10.5);
      $('button:contains("AC")').trigger('click');
      $('button:contains("=")').trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      expect(this.calculator.getLastNumber()).toBeNull();
      expect(this.calculator.getLastEntryType()).toBe('digit');
    });

    it('does nothing when pressed after = key', function() {
      $('button:contains("5")').trigger('click');
      $(`button:contains(${DIVISION})`).trigger('click');
      $('button:contains("2")').trigger('click');
      $('button:contains("=")').trigger('click');
      $('button:contains("-")').trigger('click');
      $('button:contains(".")').trigger('click');
      $('button:contains("5")').trigger('click');
      $('button:contains("=")').trigger('click');
      expect($(DISPLAY)).toHaveText('2');
      expect(this.calculator.getLastNumber()).toBe(2);
      $('button:contains("=")').trigger('click');
      expect($(DISPLAY)).toHaveText('2');
      expect(this.calculator.getLastNumber()).toBe(2);
      expect(this.calculator.getLastEntryType()).toBe('digit');
    });
  });

  describe('calculates', function () {
    it('(-1) + 2 correctly', function() {
      $('button:contains("1")').trigger('click');
      $(`button:contains(${PLUS_MINUS})`).trigger('click');
      $('button:contains("+")').trigger('click');
      $('button:contains("2")').trigger('click');
      $('button:contains("=")').trigger('click');
      expect($(DISPLAY)).toHaveText('1');
      expect(this.calculator.getLastNumber()).toBe(1);
    });

    it('3 - (-4) correctly', function() {
      $('button:contains("3")').trigger('click');
      $('button:contains("-")').trigger('click');
      $('button:contains("4")').trigger('click');
      $(`button:contains(${PLUS_MINUS})`).trigger('click');
      $('button:contains("=")').trigger('click');
      expect($(DISPLAY)).toHaveText('7');
      expect(this.calculator.getLastNumber()).toBe(7);
    });


    it('5 x 6 correctly', function() {
      $('button:contains("5")').trigger('click');
      $(`button:contains(${MULTIPLICATION})`).trigger('click');
      $('button:contains("6")').trigger('click');
      $('button:contains("=")').trigger('click');
      expect($(DISPLAY)).toHaveText("30");
      expect(this.calculator.getLastNumber()).toBe(30);
    });

    it('7 / 2 correctly', function() {
      $('button:contains("7")').trigger('click');
      $(`button:contains(${DIVISION})`).trigger('click');
      $('button:contains("2")').trigger('click');
      $('button:contains("=")').trigger('click');
      expect($(DISPLAY)).toHaveText("3.5");
      expect(this.calculator.getLastNumber()).toBe(3.5);
    });

    it('1 + 2 - 3 correctly', function() {
      $('button:contains("1")').trigger('click');
      $('button:contains("+")').trigger('click');
      $('button:contains("2")').trigger('click');
      $('button:contains("-")').trigger('click');
      $('button:contains("3")').trigger('click');
      $('button:contains("=")').trigger('click');
      expect($(DISPLAY)).toHaveText("0");
      expect(this.calculator.getLastNumber()).toBe(0);
    });

    it('5 x 4 / 2 correctly', function() {
      $('button:contains("5")').trigger('click');
      $(`button:contains(${MULTIPLICATION})`).trigger('click');
      $('button:contains("4")').trigger('click');
      $(`button:contains(${DIVISION})`).trigger('click');
      $('button:contains("2")').trigger('click');
      $('button:contains("=")').trigger('click');
      expect($(DISPLAY)).toHaveText("10");
      expect(this.calculator.getLastNumber()).toBe(10);
    });

    it('8 + 9 x 2 correctly', function() {
      $('button:contains("8")').trigger('click');
      $('button:contains("+")').trigger('click');
      $('button:contains("9")').trigger('click');
      $(`button:contains(${MULTIPLICATION})`).trigger('click');
      $('button:contains("2")').trigger('click');
      $('button:contains("=")').trigger('click');
      expect($(DISPLAY)).toHaveText("26");
      expect(this.calculator.getLastNumber()).toBe(26);
    });

    it('10 - 1 / 2 correctly', function() {
      $('button:contains("1")').trigger('click');
      $('button:contains("0")').trigger('click');
      $('button:contains("-")').trigger('click');
      $('button:contains("1")').trigger('click');
      $(`button:contains(${DIVISION})`).trigger('click');
      $('button:contains("2")').trigger('click');
      $('button:contains("=")').trigger('click');
      expect($(DISPLAY)).toHaveText("9.5");
      expect(this.calculator.getLastNumber()).toBe(9.5);
    });

    it('4 x 2 - 16 correctly', function() {
      $('button:contains("4")').trigger('click');
      $(`button:contains(${MULTIPLICATION})`).trigger('click');
      $('button:contains("2")').trigger('click');
      $('button:contains("-")').trigger('click');
      $('button:contains("1")').trigger('click');
      $('button:contains("6")').trigger('click');
      $('button:contains("=")').trigger('click');
      expect($(DISPLAY)).toHaveText("-8");
      expect(this.calculator.getLastNumber()).toBe(-8);
    });

    it('14 / 7 + 8 correctly', function() {
      $('button:contains("1")').trigger('click');
      $('button:contains("4")').trigger('click');
      $(`button:contains(${DIVISION})`).trigger('click');
      $('button:contains("7")').trigger('click');
      $('button:contains("+")').trigger('click');
      $('button:contains("8")').trigger('click');
      $('button:contains("=")').trigger('click');
      expect($(DISPLAY)).toHaveText("10");
      expect(this.calculator.getLastNumber()).toBe(10);
    });
  });

  describe('active operation key', function() {
    it('resets when digit/plus-minus/equals/CE/AC key is pressed', function() {
      $('button:contains("9")').trigger('click');
      $(`button:contains(${DIVISION})`).trigger('click');
      expect($(`button:contains(${DIVISION})`)).toHaveClass('active');

      $('button:contains("1")').trigger('click');
      // Active op resets when digit key pressed
      expect($('button')).not.toBeMatchedBy('button[class="active"]');
      expect(this.calculator.getLastOp()).toBe("");
      expect(this.calculator.getLastEntryType()).toBe("digit");

      $(`button:contains(${MULTIPLICATION})`).trigger('click');
      expect($(`button:contains(${MULTIPLICATION})`)).toHaveClass('active');
      $(`button:contains(${PLUS_MINUS})`).trigger('click');
      // Active op resets when plus-minus key pressed
      expect($('button')).not.toBeMatchedBy('button[class="active"]');
      expect(this.calculator.getLastOp()).toBe("");
      expect(this.calculator.getLastEntryType()).toBe("digit");

      $('button:contains("+")').trigger('click');
      expect($("button:contains('+')")).toHaveClass('active');
      $('button:contains("=")').trigger('click');
      // Active op resets when = key pressed
      expect($('button')).not.toBeMatchedBy('button[class="active"]');
      expect(this.calculator.getLastOp()).toBe("");
      expect(this.calculator.getLastEntryType()).toBe("digit");

      $('button:contains("-")').trigger('click');
      expect($("button:contains('-')")).toHaveClass('active');
      $('button:contains("CE")').trigger('click');
      // Active op resets when CE key pressed
      expect($('button')).not.toBeMatchedBy('button[class="active"]');
      expect(this.calculator.getLastOp()).toBe("");
      expect(this.calculator.getLastEntryType()).toBe("digit");

      $('button:contains("0")').trigger('click');
      $(`button:contains(${DIVISION})`).trigger('click');
      expect($(`button:contains(${DIVISION})`)).toHaveClass('active');
      $('button:contains("AC")').trigger('click');
      // Active op resets when AC key pressed
      expect($('button')).not.toBeMatchedBy('button[class="active"]');
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
      $('button:contains("2")').trigger('click');
      $(`button:contains(${DIVISION})`).trigger('click');
      $('button:contains("0")').trigger('click');
      $('button:contains("=")').trigger('click');
      expect(window.alert).toHaveBeenCalled();
      expect($(DISPLAY)).toBeEmpty();
      expect($('button')).not.toHaveClass('active');
      expect($('button')).not.toBeMatchedBy('button[class="active"]');
      $('button:contains("3")').trigger('click');
      $(`button:contains(${PLUS_MINUS})`).trigger('click');
      $(`button:contains(${DIVISION})`).trigger('click');
      $('button:contains("0")').trigger('click');
      $('button:contains("=")').trigger('click');
      expect(window.alert).toHaveBeenCalled();
      expect($(DISPLAY)).toBeEmpty();
      expect($('button')).not.toHaveClass('active');
      expect($('button')).not.toBeMatchedBy('button[class="active"]');
    });
  });

  describe('upon encountering NaN result (e.g. 0 / 0 operation)', function() {
    beforeEach(function() {
      // Sets up spy...
      spyOn(window, 'alert');
    });

    it('alerts and resets', function() {
      $('button:contains("0")').trigger('click');
      $(`button:contains(${DIVISION})`).trigger('click');
      $('button:contains("0")').trigger('click');
      $('button:contains("=")').trigger('click');
      expect(window.alert).toHaveBeenCalled();
      expect($(DISPLAY)).toBeEmpty();
      expect($('button')).not.toHaveClass('active');
      expect($('button')).not.toBeMatchedBy('button[class="active"]');
      $('button:contains("0")').trigger('click');
      $(`button:contains(${DIVISION})`).trigger('click');
      $('button:contains("0")').trigger('click');
      $(`button:contains(${PLUS_MINUS})`).trigger('click');
      $('button:contains("=")').trigger('click');
      expect(window.alert).toHaveBeenCalled();
      expect($(DISPLAY)).toBeEmpty();
      expect($('button')).not.toHaveClass('active');
      expect($('button')).not.toBeMatchedBy('button[class="active"]');
    });
  });
});
