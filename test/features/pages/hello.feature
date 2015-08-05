Feature: Hello
  Scenario: Successfully loads the hello page
    Given I am on the hello page
    Then the page URL is "/hello"
    And the page header text is "Welcome to the hello index page!"

  Scenario: Successfully load the new page which defers rendering to the hello controller
    Given I am on the hello new page
    Then the page URL is "/hello/new"
    And the page header text is "Welcome to the new hello page!"