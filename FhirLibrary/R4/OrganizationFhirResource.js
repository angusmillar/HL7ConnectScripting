function OrganizationFhirResource() {
  var FhirTool = new FhirTools();
  var oFhirConfig = new FhirConfig();
  var Resource = new DomainResource();

  Resource.resourceType = oFhirConfig.ResourceName.Organization;

  Resource.SetName = function (name) {
    Resource.name = FhirTool.SetFhir(name);
  }

  Resource.SetAlias = function (aliasArray) {
    Resource.alias = FhirTool.SetFhir(aliasArray);
  }

  return Resource;
}