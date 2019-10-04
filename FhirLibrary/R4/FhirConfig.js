function FhirConfig() {

  // The static action name required by ICIMS for AddPatient requests.*/
  this.MessageControlIdPrefix = null;

  this.HL7V2MessageTypeEventCodeSystemUri = "https://pyrohealth.net/fhir/CodeSystem/hl7-v2-message-type-event";

  this.MedicareNumberSystemUri = "http://ns.electronichealth.net.au/id/medicare-number";

  this.AllergyIntoleranceCategoryCodeSystem = "http://hl7.org/fhir/allergy-intolerance-category";

  this.PyroServerDeviceResourceId = "Pyro-Fhir-Server";

  this.ResourceName = {
    Patient: "Patient",
    MessageHeader: "MessageHeader",
    Organization: "Organization",
    DiagnosticReport: "DiagnosticReport",
    Device: "Device",
    Encounter: "Encounter",
    Condition: "Condition",
    AllergyIntolerance: "AllergyIntolerance"
  };

}
