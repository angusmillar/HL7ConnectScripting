
function ProvenanceFhirResource(id){

  var Resource = new function(){};
  Resource.resourceType = "Provenance";
  Resource.id = id;

  this.GetResource = function(){
    return Resource;
  };

  this.SetTarget = function(referenceArray){
    Resource.target = referenceArray;
  };

  this.SetRecorded = function(instant){
    Resource.recorded = instant;
  };

  this.SetActivity = function(coding){
    Resource.activity = coding;
  };
  
  this.SetAgent = function(roleCodeableConcept, whoReference, onBehalfOfReference){
    Resource.agent = GetAgent(roleCodeableConcept, whoReference, onBehalfOfReference);
  };
  
  this.SetEntity = function(roleCode, whatIdentifier){
    Resource.entity = GetEntity(roleCode, whatIdentifier);
  };
  
  function GetAgent(roleCodeableConcept, whoReference, onBehalfOfReference)
  {
    var Agent = new function(){};
    Agent.role = roleCodeableConcept;
    Agent.whoReference = whoReference;
    Agent.onBehalfOfReference = onBehalfOfReference;
    return Agent;
  }

  function GetEntity(roleCode, whatIdentifier)
  {
    var Entity = new function(){};
    Entity.role = roleCode;
    Entity.whatIdentifier = whatIdentifier;
    return Entity;
  }


}