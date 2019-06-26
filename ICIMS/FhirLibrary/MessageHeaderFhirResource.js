
<%include $repo$\ICIMS\FhirLibrary\FhirDataType.js%>

function MessageHeaderFhirResource(){

  this.GetResource = function(oHL7){
    Resource = new CreateResource(oHL7);
    return Resource;
  };
  
  function CreateResource(oHL7){
    
    var res = new function(){};
    res.resourceType = "MessageHeader";
    res.id = "NewGUID";
    var DataType = new FhirDataType();
    res.event = DataType.GetCoding("diagnosticreport-provide", "http://hl7.org/fhir/message-events", "diagnosticreport-provide");
    return res;
  }
}