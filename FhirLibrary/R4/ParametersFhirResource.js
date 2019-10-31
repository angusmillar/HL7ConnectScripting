
function ParametersFhirResource() {

  var FhirTool = new FhirTools();
  var Resource = new DomainResource();
  var oFhirConfig = new FhirConfig();

  Resource.resourceType = oFhirConfig.ResourceName.Parameters;

  Resource.SetIdentifier = function (oIdentifierArray) {
    Resource.identifier = oIdentifierArray;
  };

  Resource.AddParameter = function (oParameter) {
    if (Resource.parameter == undefined) {
      Resource.parameter = [];
    }
    Resource.parameter.push(oParameter);
  }

  Resource.GetParameter = function (name, valueTypeName, value, resource, partArray) {
    var Parameter = new function () { };
    Parameter.name = FhirTool.SetFhir(name);
    Parameter["value" + valueTypeName] = FhirTool.SetFhir(value);
    Parameter.resource = FhirTool.SetFhir(resource);
    Parameter.part = FhirTool.SetFhir(partArray);
    return Parameter;
  };

  return Resource;

}