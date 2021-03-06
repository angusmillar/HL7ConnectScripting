
function ObservationFhirResource() {
  var FhirTool = new FhirTools();
  var oFhirConfig = new FhirConfig();
  var Resource = new DomainResource();

  Resource.resourceType = oFhirConfig.ResourceName.Observation;

  Resource.SetIdentifierArray = function (identifierArray) {
    Resource.identifier = FhirTool.SetFhir(identifierArray);
  };

  Resource.SetStatus = function (statusCode) {
    Resource.status = FhirTool.SetFhir(statusCode);
  }

  Resource.SetCategory = function (codeableConceptArray) {
    Resource.category = FhirTool.SetFhir(codeableConceptArray);
  }

  Resource.SetCode = function (codeableConcept) {
    Resource.code = FhirTool.SetFhir(codeableConcept);
  }

  Resource.SetSubject = function (reference) {
    Resource.subject = FhirTool.SetFhir(reference);
  }

  Resource.SetEffectiveDateTime = function (dateTime) {
    Resource.effectiveDateTime = FhirTool.SetFhir(dateTime);
  }

  Resource.SetIssued = function (instant) {
    Resource.issued = FhirTool.SetFhir(instant);
  }

  Resource.SetValueString = function (string) {
    Resource.valueString = FhirTool.SetFhir(string);
  }

  Resource.SetValueQuantity = function (quantity) {
    Resource.valueQuantity = FhirTool.SetFhir(quantity);
  }

  Resource.SetReferenceRange = function (lowSimpleQuantity, highSimpleQuantity, typeCodeableConcept, appliesToCodeableConcept, ageRange, text) {
    Resource.referenceRange = GetReferenceRange(lowSimpleQuantity, highSimpleQuantity, typeCodeableConcept, appliesToCodeableConcept, ageRange, text);
  }

  Resource.SetInterpretation = function (codeableConcept) {
    Resource.interpretation = FhirTool.SetFhir(codeableConcept);
  }

  function GetReferenceRange(lowSimpleQuantity, highSimpleQuantity, typeCodeableConcept, appliesToCodeableConcept, ageRange, text) {
    var ReferenceRange = new function () { };
    ReferenceRange.low = lowSimpleQuantity;
    ReferenceRange.high = highSimpleQuantity;
    ReferenceRange.type = typeCodeableConcept;
    ReferenceRange.appliesTo = appliesToCodeableConcept;
    ReferenceRange.age = ageRange;
    ReferenceRange.text = FhirTool.SetFhir(text);
    return ReferenceRange;
  }

  return Resource;
}