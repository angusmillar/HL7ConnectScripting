
function DiagnosticReportFhirResource(id){

  var Resource = new function(){};
  Resource.resourceType = "DiagnosticReport";
  Resource.id = id;
 
  this.GetResource = function(){
    return Resource;
  };

  this.SetIdentifierArray = function(identifierArray){
    Resource.identifier = identifierArray;
  };

  this.SetStatus = function(code){
    Resource.status = code;
  };

  this.SetCategory = function(codableConcept){
    Resource.category = codableConcept;
  };
  
  this.SetCode = function(codableConcept){
    Resource.code = codableConcept;
  };

  this.SetSubject = function(reference){
    Resource.subject = reference;
  };

  this.SetEffectiveDateTime = function(dateTime){
    Resource.effectiveDateTime = dateTime;
  };

  this.SetIssued = function(dateTime){
    Resource.issued = dateTime;
  };

  this.SetResult = function(resultReferenceArray){
    Resource.result = resultReferenceArray;
  };

  this.SetPresentedForm = function(AttachmentArray){
    Resource.presentedForm = AttachmentArray;
  };

}