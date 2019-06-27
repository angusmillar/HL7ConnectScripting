
<%include $repo$\ICIMS\FhirLibrary\FhirDataType.js%>

function DiagnosticReportFhirResource(id, oModels){
  var oModels = oModels;
  var Resource = new function(){};
  Resource.resourceType = "DiagnosticReport";
  Resource.id = id;
 
  this.GetResource = function(){
    return Resource;
  };


  this.SetSource = function(name, software, version, oContact, endpoint){
    Resource.source = GetSource(name, software, version, oContact, endpoint);
  };

 
  function GetSource(name, software, version, oContact, endpoint)
  {
    var Source = new function(){};
    if (name != "")
      Source.name = name;

    if (software != "")
      Source.endpoint = software;

    if (version != "")
      Source.endpoint = version;

    if (oContact != "")
      Source.endpoint = oContact;

    if (endpoint != "")
      Source.endpoint = endpoint;

    return Source;
  }


}