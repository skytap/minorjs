Feature: Ignored Tags "@manual" and "@nozombie"
  @manual
  Scenario: Successfully skips Scenario with "@manual" tag
    When the step fails
    Then the test doesn't fail because it's being ignored

  @nozombie
  Scenario: Successfully skips Scenario with "@nozombie" tag
    When the step fails
    Then the test doesn't fail because it's being ignored
