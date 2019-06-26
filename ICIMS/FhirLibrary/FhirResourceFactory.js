
<%include $repo$\ICIMS\FhirLibrary\BundleFhirResource.js%>

function FhirResourceFactory(){
 BreakPoint
 
  this.CreatePathologyBundle = function(oORU)
  {
    Bundle = new CreatePathologyBundle(oORU);
    return Bundle;
  };

  function CreatePathologyBundle(oORU){
    BreakPoint;
    var oBundleFhirResource = new BundleFhirResource();
    var Bundle = oBundleFhirResource.GetResource(oORU);
    return Bundle;
  }

  
}