
function AllergyIntoleranceFhirResource() {

  var FhirTool = new FhirTools();
  var Resource = new DomainResource();
  var oFhirConfig = new FhirConfig();

  Resource.resourceType = oFhirConfig.ResourceName.AllergyIntolerance;

  Resource.SetIdentifier = function (oIdentifierArray) {
    Resource.identifier = oIdentifierArray;
  };

  Resource.SetClinicalStatus = function (oCodeableConcept) {
    Resource.clinicalStatus = oCodeableConcept;
  };

  Resource.SetVerificationStatus = function (oCodeableConcept) {
    Resource.verificationStatus = oCodeableConcept;
  };

  Resource.SetType = function (Code) {
    Resource.type = FhirTool.SetFhir(Code);
  };

  Resource.SetCategory = function (Code) {
    Resource.category = FhirTool.SetFhir(Code);
  };

  Resource.SetCriticality = function (Code) {
    Resource.Criticality = FhirTool.SetFhir(Code);
  };

  Resource.SetCode = function (oCodeableConcept) {
    Resource.code = oCodeableConcept;
  };

  Resource.SetPatient = function (oPatientReference) {
    Resource.patient = FhirTool.SetFhir(oPatientReference);
  };

  Resource.SetEncounter = function (oEncounterReference) {
    Resource.encounter = FhirTool.SetFhir(oEncounterReference);
  };

  Resource.SetOnSetDateTime = function (dateTime) {
    Resource.onsetDateTime = FhirTool.SetFhir(dateTime);
  };

  Resource.SetRecordedDate = function (dateTime) {
    Resource.recordedDate = FhirTool.SetFhir(dateTime);
  };

  //No currently added to this resource
  //asserter
  //LastOccurrence
  //note
  //reaction (Element)

  return Resource;

}