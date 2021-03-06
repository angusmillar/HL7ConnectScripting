
function EncounterFhirResource() {

  var FhirTool = new FhirTools();
  var Resource = new DomainResource();
  var oFhirConfig = new FhirConfig();

  Resource.resourceType = oFhirConfig.ResourceName.Encounter;

  Resource.SetIdentifier = function (oIdentifierArray) {
    Resource.identifier = oIdentifierArray;
  };

  Resource.SetStatus = function (oCode) {
    Resource.status = oCode;
  };

  Resource.SetClass = function (oCoding) {
    //This is a hack to ensure we can have a property named 'class'.
    //Class is a reserved word in Javascript and can not be used as a property name.
    //To get around this we can prefix the property name with '_xxx_', for example '_xxx_class'
    //This prefix is then removed from the property name in the FhirJson parser.                 
    Resource._xxx_class = oCoding;
  };

  Resource.SetSubject = function (reference) {
    Resource.subject = FhirTool.SetFhir(reference);
  };

  Resource.SetPeriod = function (oPeriod) {
    Resource.period = FhirTool.SetFhir(oPeriod);
  };

  Resource.AddDiagnosis = function (oConditionReference, useCodeableConcept, rankPositiveInt) {
    if (Resource.diagnosis == undefined) {
      Resource.diagnosis = [];
    }
    Resource.diagnosis.push(GetDiagnosis(oConditionReference, useCodeableConcept, rankPositiveInt));
  };

  Resource.AddLocation = function (oLocationReference, oStatusCode, oPhysicalTypeCodeableConcept, oPeriod) {
    if (Resource.location == undefined) {
      Resource.location = [];
    }
    Resource.location.push(GetLocation(oLocationReference, oStatusCode, oPhysicalTypeCodeableConcept, oPeriod));
  }

  function GetDiagnosis(oConditionReference, useCodeableConcept, rankPositiveInt) {
    var Diagnosis = new function () { };
    Diagnosis.condition = FhirTool.SetFhir(oConditionReference);
    Diagnosis.use = FhirTool.SetFhir(useCodeableConcept);
    Diagnosis.rank = FhirTool.SetFhir(rankPositiveInt);
    return Diagnosis;
  }

  function GetLocation(oLocationReference, oStatusCode, oPhysicalTypeCodeableConcept, oPeriod) {
    var Location = new function () { };
    Location.location = FhirTool.SetFhir(oLocationReference);
    Location.status = FhirTool.SetFhir(oStatusCode);
    Location.physicalType = FhirTool.SetFhir(oPhysicalTypeCodeableConcept);
    Location.period = FhirTool.SetFhir(oPeriod);
    return Location;
  }


  return Resource;

}