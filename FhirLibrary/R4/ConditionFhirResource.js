
function ConditionFhirResource() {

  var FhirTool = new FhirTools();
  var Resource = new DomainResource();
  var oFhirConfig = new FhirConfig();

  Resource.resourceType = oFhirConfig.ResourceName.Condition;

  Resource.SetIdentifier = function (oIdentifierArray) {
    Resource.identifier = oIdentifierArray;
  };

  Resource.SetClinicalStatus = function (oCodeableConcept) {
    Resource.clinicalStatus = oCodeableConcept;
  };

  Resource.SetVerificationStatus = function (oCodeableConcept) {
    Resource.verificationStatus = oCodeableConcept;
  };

  Resource.SetCategory = function (oCodeableConcept) {
    Resource.category = oCodeableConcept;
  };

  Resource.SetSeverity = function (oCodeableConcept) {
    Resource.severity = oCodeableConcept;
  };

  Resource.SetCode = function (oCodeableConcept) {
    Resource.code = oCodeableConcept;
  };

  Resource.SetBodySite = function (oCodeableConcept) {
    Resource.bodySite = oCodeableConcept;
  };

  Resource.SetSubject = function (oReference) {
    Resource.subject = FhirTool.SetFhir(oReference);
  };

  Resource.SetEncounter = function (oReference) {
    Resource.encounter = FhirTool.SetFhir(oReference);
  };

  Resource.SetRecordedDate = function (dateTime) {
    Resource.recordedDate = FhirTool.SetFhir(dateTime);
  };

  return Resource;

}