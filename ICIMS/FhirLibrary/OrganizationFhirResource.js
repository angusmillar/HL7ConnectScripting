function OrganizationFhirResource(){
  var FhirTool = new FhirTools();

  var Resource = new DomainResource();
  Resource.resourceType = "Organization";
  
  Resource.SetName = function(name){
    Resource.name = FhirTool.SetFhir(name);
  }

  Resource.SetAlias = function(aliasArray){
    Resource.alias = FhirTool.SetFhir(aliasArray);
  }

  return Resource;
}