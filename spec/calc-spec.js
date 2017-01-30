/* eslint-env jasmine */
/* global loadFixtures, calcFactory */
describe('calculator init', function () {
  jasmine.getFixtures().fixturesPath = 'spec/html/fixtures';
  beforeAll(function() {
    this.BUTTONS = 'div#buttons';
    this.DISPLAY = 'pre#display';
    this.initData = {display: this.DISPLAY, buttons: this.BUTTONS};
  });
  beforeEach(function() {
    loadFixtures('calculator-fixture.html');
    // The unit to test
    this.calculator = calcFactory(this.initData);
  });

  it('sets up click handler for buttons', function() {
    // console.log(this.BUTTONS);
    expect($(this.BUTTONS)).toHandle('click');
  });
});

describe('calculator digit key', function () {
  jasmine.getFixtures().fixturesPath = 'spec/html/fixtures';
  beforeAll(function() {
    this.BUTTONS = 'div#buttons';
    this.DISPLAY = 'pre#display';
    this.initData = {display: this.DISPLAY, buttons: this.BUTTONS};
  });
  beforeEach(function() {
    loadFixtures('calculator-fixture.html');
    // The unit to test
    this.calculator = calcFactory(this.initData);
  });

  it('displays digit when pressed at fresh start (blank display)', function(done) {
    $('button:contains("0")').trigger('click');
    expect($(this.DISPLAY)).toContainText('0');
    done();
  });

  it('appends digit to current displayed number', function(done) {
    $('button:contains("1")').trigger('click');
    $('button:contains("0")').trigger('click');
    expect($(this.DISPLAY)).toContainText('10');
    done();
  });

  it('does not display leading zero when followed by non-zero digit', function(done) {
    $('button:contains("0")').trigger('click');
    $('button:contains("5")').trigger('click');
    expect($(this.DISPLAY)).toContainText('5');
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
    expect($(this.DISPLAY)).toContainText('4');
    expect(this.calculator.getLastNumber()).toBe(4);
    expect(this.calculator.getLastEntryType()).toBe("digit");
    expect(this.calculator.getLastOp()).toBe("");
    done();
  });
});

describe('calculator operation key', function () {
  jasmine.getFixtures().fixturesPath = 'spec/html/fixtures';
  beforeAll(function() {
    this.BUTTONS = 'div#buttons';
    this.DISPLAY = 'pre#display';
    this.initData = {display: this.DISPLAY, buttons: this.BUTTONS};
  });
  beforeEach(function() {
    loadFixtures('calculator-fixture.html');
    // The unit to test
    this.calculator = calcFactory(this.initData);
  });

  // OPERATION keys
  it('displays nothing when op key pressed at fresh start', function(done) {
    $('button:contains("-")').trigger('click');
    expect($(this.DISPLAY)).toBeEmpty();
    $('button:contains("+")').trigger('click');
    expect($(this.DISPLAY)).toBeEmpty();
    $('button:contains("\u00F7")').trigger('click');
    expect($(this.DISPLAY)).toBeEmpty();
    $('button:contains("\u00D7")').trigger('click');
    expect($(this.DISPLAY)).toBeEmpty();
    done();
  });

  it('saves pressed op key as current op, highlights op key, if following digit key', function(done) {
    $('button:contains("6")').trigger('click');
    $('button:contains("\u00F7")').trigger('click');
    expect($(this.DISPLAY)).toContainText('6');
    expect(this.calculator.getLastOp()).toBe("\u00F7");
    // expect($('button:contains("\u00F7")')).toHaveClass("active");
    done();
  });

  it('saves pressed op key as current op, highlights op key, if following op key', function(done) {
    $('button:contains("7")').trigger('click');
    $('button:contains("\u00F7")').trigger('click');
    $('button:contains("\u00D7")').trigger('click');
    expect($(this.DISPLAY)).toContainText('7');
    expect(this.calculator.getLastOp()).toBe("\u00D7");
    // expect($('button:contains("\u00B1")')).toHaveClass("active");
    done();
  });

  it('saves pressed op key as current op, highlights op key, if following plus/minus key', function(done) {
    $('button:contains("8")').trigger('click');
    $('button:contains("\u00B1")').trigger('click');
    $('button:contains("-")').trigger('click');
    expect($(this.DISPLAY)).toContainText('8');
    expect(this.calculator.getLastOp()).toBe("-");
    // expect($('button:contains("\u00B1")')).toHaveClass("active");
    done();
  });

  it('saves pressed op key as current op, highlights op key, if following decimal point key', function(done) {
    $('button:contains("9")').trigger('click');
    $('button:contains(".")').trigger('click');
    $('button:contains("+")').trigger('click');
    expect($(this.DISPLAY)).toContainText('9.');
    expect(this.calculator.getLastOp()).toBe("+");
    // expect($('button:contains("\u00B1")')).toHaveClass("active");
    done();
  });

});
