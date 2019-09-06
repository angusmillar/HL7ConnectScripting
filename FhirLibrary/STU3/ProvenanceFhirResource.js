
function ProvenanceFhirResource(){
  var FhirTool = new FhirTools();

  var Resource = new DomainResource();
  Resource.resourceType = "Provenance";

  Resource.SetTarget = function(referenceArray){
    Resource.target = FhirTool.SetFhir(referenceArray);
  };

  Resource.SetRecorded = function(instant){
    Resource.recorded = FhirTool.SetFhir(instant);
  };

  Resource.SetActivity = function(coding){
    Resource.activity = FhirTool.SetFhir(coding);
  };
  
  Resource.SetAgent = function(roleCodeableConcept, whoReference, onBehalfOfReference){
    Resource.agent = GetAgent(roleCodeableConcept, whoReference, onBehalfOfReference);
  };
  
  Resource.SetEntity = function(roleCode, whatIdentifier){
    Resource.entity = GetEntity(roleCode, whatIdentifier);
  };
  
  function GetAgent(roleCodeableConcept, whoReference, onBehalfOfReference)
  {
    var Agent = new function(){};
    Agent.role = FhirTool.SetFhir(roleCodeableConcept);
    Agent.whoReference = FhirTool.SetFhir(whoReference);
    Agent.onBehalfOfReference = FhirTool.SetFhir(onBehalfOfReference);
    return Agent;
  }

  function GetEntity(roleCode, whatIdentifier)
  {
    var Entity = new function(){};
    Entity.role = FhirTool.SetFhir(roleCode);
    Entity.whatIdentifier = FhirTool.SetFhir(whatIdentifier);
    return Entity;
  }

  return Resource;

}