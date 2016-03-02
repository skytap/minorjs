Feature: Frames
  Scenario: Successfully loads the frames page
    Given I am on the frames page
    Then the page URL is "/frames"
    And the name is "Hello: Jane Smith"