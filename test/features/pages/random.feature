Feature: Random
  Scenario: Successfully load the random color page
    Given I am on the random page
    Then the page URL is "/random"
    And the page header text is random color