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
  });

  describe('digit key', function () {
    it('displays digit when pressed at fresh start (blank display)', function(done) {
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

    it('does not display leading zero when followed by non-zero digit', function(done) {
      $('button:contains("0")').trigger('click');
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
    it('displays nothing when op key pressed at fresh start (blank display)', function(done) {
      $('button:contains("-")').trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      $('button:contains("+")').trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      $(`button:contains(${DIVISION})`).trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      $(`button:contains(${MULTIPLICATION})`).trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      done();
    });

    it('saves pressed op key as current op, highlights op key, if following digit key', function(done) {
      $('button:contains("6")').trigger('click');
      $(`button:contains(${DIVISION})`).trigger('click');
      expect($(DISPLAY)).toHaveText('6');
      expect(this.calculator.getLastOp()).toBe("\u00F7");
      // expect($(`button:contains(${DIVISION})`)).toHaveClass("active");
      done();
    });

    it('saves pressed op key as current op, highlights op key, if following op key', function(done) {
      // Pressed 7, division, multiplication
      $('button:contains("7")').trigger('click');
      $(`button:contains(${DIVISION})`).trigger('click');
      $(`button:contains(${MULTIPLICATION})`).trigger('click');
      expect($(DISPLAY)).toHaveText('7');
      expect(this.calculator.getLastOp()).toBe(MULTIPLICATION);
      // expect($(`button:contains(${MULTIPLICATION})`)).toHaveClass("active");
      done();
    });

    it('saves pressed op key as current op, highlights op key, if following plus-minus key', function(done) {
      // Pressed 8, +/-, -
      $('button:contains("8")').trigger('click');
      $(`button:contains(${PLUS_MINUS})`).trigger('click');
      $('button:contains("-")').trigger('click');
      expect($(DISPLAY)).toHaveText('-8');
      expect(this.calculator.getLastOp()).toBe("-");
      // expect($('button:contains("-")')).toHaveClass("active");
      done();
    });

    it('saves pressed op key as current op, highlights op key, if following decimal-point key', function(done) {
      $('button:contains("9")').trigger('click');
      $('button:contains(".")').trigger('click');
      $('button:contains("+")').trigger('click');
      expect($(DISPLAY)).toHaveText('9.');
      expect(this.calculator.getLastOp()).toBe("+");
      // expect($('button:contains("+")')).toHaveClass("active");
      done();
    });
  });

  describe('plus-minus key', function() {
    it('displays nothing when pressed at fresh start (blank display)', function() {
      $(`button:contains(${PLUS_MINUS})`).trigger('click');
      $(`button:contains(${PLUS_MINUS})`).trigger('click');
      expect($(DISPLAY)).toBeEmpty();
    });

    it('toggles negative sign of displayed number, if pressed after digit/op/decimal/plus-minus key', function() {
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
    });
  });

  describe('decimal-point key', function() {
    it('displays "0." when at fresh start (blank display)', function() {
      $('button:contains(".")').trigger('click');
      expect($(DISPLAY)).toHaveText("0.");
    });

    it('toggles decimal-point if current number ends with one or doesn\'t have one; otherwise does nothing', function() {
      $('button:contains(".")').trigger('click');
      expect($(DISPLAY)).toHaveText("0.");
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
      // Does nothing if number already has decimal-point
      $('button:contains(".")').trigger('click');
      $('button:contains("2")').trigger('click');
      $('button:contains(".")').trigger('click');
      expect($(DISPLAY)).toHaveText("-1.2");
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
    });
  });

  describe('CE key', function() {
    it('does nothing when pressed at fresh start (blank display)', function() {
      $('button:contains("CE")').trigger('click');
      expect($(DISPLAY)).toBeEmpty();
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
      // expect($('button:contains("+")')).not.toHaveClass("active");
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
      // expect($('button:contains("+")')).not.toHaveClass("active");
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
      // expect($('button:contains("+")')).not.toHaveClass("active");
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
      // expect($('button:contains("+")')).not.toHaveClass("active");
    });

  });

  describe('AC key', function() {
    it('resets everything', function() {
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
      // The test itself:
      $('button:contains("AC")').trigger('click');
      expect($(DISPLAY)).toBeEmpty();
      expect($('button')).not.toBeMatchedBy('button[class]');
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
      expect(this.calculator.getLastNumber()).toBe(null);
      expect(this.calculator.getLastEntryType()).toBe("digit");
      expect(this.calculator.getHasDecimal()).toBe(false);
      expect($('button')).not.toBeMatchedBy('button[class]');
    });

    it('starts calculation and displays result, when pressed after digit/plus-minus/decimal key', function() {
      $('button:contains(".")').trigger('click');
      $('button:contains("1")').trigger('click');
      $('button:contains("2")').trigger('click');
      $('button:contains("0")').trigger('click');
      $('button:contains("-")').trigger('click');
      $(`button:contains(${PLUS_MINUS})`).trigger('click');
      $('button:contains("0")').trigger('click');
      $('button:contains("3")').trigger('click');
      $('button:contains(".")').trigger('click');
      $('button:contains("=")').trigger('click');
      expect($(DISPLAY)).toHaveText("-3.12");
      expect(this.calculator.getLastNumber()).toBe(-3.21);
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
      expect($('button')).not.toBeMatchedBy('button[class]');
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
});
