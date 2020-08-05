
function ProvenanceFhirResource() {
  var FhirTool = new FhirTools();
  var oFhirConfig = new FhirConfig();
  var Resource = new DomainResource();

  Resource.resourceType = oFhirConfig.ResourceName.Provenance;

  Resource.SetOccurredDateTime = function (dateTime) {
    Resource.occurredDateTime = FhirTool.SetFhir(dateTime);
  }

  Resource.SetTarget = function (referenceArray) {
    Resource.target = FhirTool.SetFhir(referenceArray);
  };

  Resource.SetRecorded = function (instant) {
    Resource.recorded = FhirTool.SetFhir(instant);
  };

  Resource.SetActivity = function (oCodeableConcept) {
    Resource.activity = FhirTool.SetFhir(oCodeableConcept);
  };

  Resource.SetAgent = function (typeCodeableConcept, roleCodeableConcept, whoReference, onBehalfOfReference) {
    Resource.agent = GetAgent(typeCodeableConcept, roleCodeableConcept, whoReference, onBehalfOfReference);
  };

  Resource.SetEntity = function (roleCode, whatIdentifier) {
    Resource.entity = GetEntity(roleCode, whatIdentifier);
  };

  function GetAgent(typeCodeableConcept, roleCodeableConcept, whoReference, onBehalfOfReference) {
    var Agent = new function () { };
    Agent.type = FhirTool.SetFhir(typeCodeableConcept);
    Agent.role = FhirTool.SetFhir(roleCodeableConcept);
    Agent.who = FhirTool.SetFhir(whoReference);
    Agent.onBehalfOf = FhirTool.SetFhir(onBehalfOfReference);
    return Agent;
  }

  function GetEntity(roleCode, whatReference) {
    var Entity = new function () { };
    Entity.role = FhirTool.SetFhir(roleCode);
    Entity.what = FhirTool.SetFhir(whatReference);
    return Entity;
  }

  return Resource;

}