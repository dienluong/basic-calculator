/* eslint-env jasmine */
/* global loadFixtures, calcFactory */
describe('calculator fixture', function () {
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

  it('sets up click handler', function() {
    // console.log(this.BUTTONS);
    expect($(this.BUTTONS)).toHandle('click');
  });

  it('displays digit when starting blank', function(done) {
    $('button:contains("1")').trigger('click');
    expect($(this.DISPLAY)).toContainText('1');
    done();
  });

  it('does not display leading zero', function(done) {
    $('button:contains("0")').trigger('click');
    $('button:contains("5")').trigger('click');
    expect($(this.DISPLAY)).toContainText('5');
    done();
  });

  it('appends digit to displayed number', function(done) {
    $('button:contains("1")').trigger('click');
    $('button:contains("0")').trigger('click');
    expect($(this.DISPLAY)).toContainText('10');
    done();
  });

  it('clears display and displays digit when pressed after "+" key', function(done) {
    $('button:contains("2")').trigger('click');
    $('button:contains("3")').trigger('click');
    $('button:contains("+")').trigger('click');
    $('button:contains("4")').trigger('click');
    expect($(this.DISPLAY)).toContainText('4');
    done();
  });


});
