var assert = require('chai').assert;
var faker = require('faker');
var webdriver = require('selenium-webdriver'),
    By = require('selenium-webdriver').By,
    test = require('selenium-webdriver/testing');
var CommonUtils = require('./common');



test.describe('Registration', function() {
    this.timeout(60000);
    var driver;
    test.before(function() {
        driver = CommonUtils.buildDriver();
    });
    test.after(function() {
        driver.quit();
    });
    test.it('1.1 should create an account with valid data', function() {
        CommonUtils.signUp(driver);
        var userName = faker.internet.userName();
        while (userName.indexOf('.') > -1 || userName.indexOf('_') > -1) {
            userName = faker.internet.userName();
        }
        var email = faker.internet.email();
        CommonUtils.fillSignUpForm(driver, userName, email, faker.internet.password());
        var userNameElement = CommonUtils.signOut(driver);
        userNameElement.getText().then(function(text) {
           assert.equal(text, userName); 
        });
        CommonUtils.deleteNewUser(driver, email);
    });
    test.it('1.2 should not create an account with invalid email addresss', function() {
        CommonUtils.signUp(driver);
        CommonUtils.fillSignUpForm(driver, 'testName', '@testName', 'password');
        var helpTextElement = driver.findElement(By.xpath('//*[@id="at-pwd-form"]/fieldset/div[2]/span'));
        helpTextElement.getText().then(function(text) {
           assert.equal(text, 'Invalid email', 'Invalid email message doesn\'t match'); 
        });
    });
    test.it('1.3 should login to GIT with valid credentials', function() {
       CommonUtils.signUp(driver);
       driver.findElement(By.id('at-github')).click();
       driver.getAllWindowHandles().then(function(handles) {
           driver.switchTo().window(handles[1]);
       });
       driver.findElement(By.id('login_field')).sendKeys('kumargs');
       driver.findElement(By.id('password')).sendKeys('Delta@123');
       driver.findElement(By.xpath('//*[@id="login"]/form/div[4]/input[3]')).click();
       driver.getAllWindowHandles().then(function(handles) {
           driver.switchTo().window(handles[0]);        
           var userNameElement = CommonUtils.signOut(driver)
           userNameElement.getText().then(function(text) {
               assert.equal(text, 'kumargs'); 
           });
           driver.get('https://github.com');
           driver.findElement(By.xpath('//*[@id="user-links"]/li[3]/a')).click();
           driver.findElement(By.xpath('//*[@id="user-links"]/li[3]/div/div/form/button')).click();
           
       });
    });
    test.it('1.4 should not create github account with invalid email', function() {
        CommonUtils.signUp(driver);
        driver.findElement(By.id('at-github')).click();
        driver.getAllWindowHandles().then(function(handles) {
            driver.switchTo().window(handles[1]);
        });
        driver.findElement(By.id('login_field')).sendKeys('invalidEmail');
        driver.findElement(By.id('password')).sendKeys('asdfalkjl');
        driver.findElement(By.xpath('//*[@id="login"]/form/div[4]/input[3]')).click();
        var errorElement = driver.findElement(By.xpath('//*[@id="js-flash-container"]/div/div'));
        errorElement.getText().then(function(text) {
            assert.equal(text, "Incorrect username or password.");
        });
        driver.close();
        driver.getAllWindowHandles().then(function(handles) {
            driver.switchTo().window(handles[0]);
        });
    });
    test.it('1.5 should not create an account with missing email field', function() {
        CommonUtils.signUp(driver);
        driver.findElement(By.id('at-field-username')).sendKeys('testName');
        driver.findElement(By.id('at-field-password')).sendKeys('password');
        driver.findElement(By.id('at-btn')).click();
        var helpTextElement = driver.findElement(By.xpath('//*[@id="at-pwd-form"]/fieldset/div[2]/span'));
        helpTextElement.getText().then(function(text) {
           assert.equal(text, 'Required Field'); 
        });
    });
    test.it('1.6 should show unknown validation error with special character email field', function() {
        CommonUtils.signUp(driver);
        CommonUtils.fillSignUpForm(driver, 'testName', 'abc@testName.com"###"', 'password');
        var errorElement = driver.findElement(By.xpath('/html/body/div/div/div/div/div/div[4]/p'));
        errorElement.getText().then(function(text) {
           assert.equal(text, 'Unknown validation error'); 
        });
    });
    test.it('1.7 should show profile user name invalid with special character username field', function() {
        CommonUtils.signUp(driver);
        CommonUtils.fillSignUpForm(driver, 'testName&&&', 'abc@testName.com', 'password');
        var errorElement = driver.findElement(By.xpath('/html/body/div/div/div/div/div/div[4]/p'));
        errorElement.getText().then(function(text) {
           assert.equal(text, 'profile-usernameInvalid');
        });
    });
});