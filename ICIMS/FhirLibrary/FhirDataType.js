function FhirDataType(){

  this.GetCoding = function(code, codeSystem, display, version)
  {
    return new Coding(code, codeSystem, display, version);
  };

  this.GetReference = function(reference, display)
  {
    return new Reference(reference, display);
  };

  
  function Coding(code, codeSystem, display, version){
    var coding = new function(){};
    coding.code = code;
    coding.system = codeSystem;
    coding.display = display;
    if (version != "")
      coding.version = version;
    return coding;
  }
  
  function Reference(reference, display){
    var ref = new function(){};
    ref.reference = reference;
    ref.display = display;
    return ref;
  }
  
}