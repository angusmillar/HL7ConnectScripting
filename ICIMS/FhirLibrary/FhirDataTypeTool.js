
function FhirDataTypeTool(){

  var FhirTool = new FhirTools();
    
  this.GetCoding = function(code, codeSystem, display, version)
  {
    return new Coding(code, codeSystem, display, version);
  };

  this.GetReference = function(resourceType, reference, display)
  {
    return new Reference(resourceType, reference, display);
  };

  this.GetIdentifier = function(use, oType, system, value, oPeriod, oAssigner)
  {
    return new Identifier(use, oType, system, value, oPeriod, oAssigner);
  };

  this.GetCodeableConcept = function(oCoding, text)
  {
    return new CodeableConcept(oCoding, text);
  };

  this.GetPeriod = function(start, end)
  {
    return new Period(start, end);
  };

  this.GetPdfAttachment = function(base64Data)
  {
    return new Attachment("application/pdf", undefined , base64Data);
  };

  this.GetHumanName = function(use, text, famly, given, prefix, suffix, oPeriod)
  {
    return new HumanName(use, text, famly, given, prefix, suffix, oPeriod);
  };

  this.GetAddress = function(use, type, text, line, city, district, state, postalCode, country, oPeriod)
  {
    return new Address(use, type, text, line, city, district, state, postalCode, country, oPeriod);
  };

  this.GetAddressAustrlian = function(use, text, line, suburb, state, postalCode, country, oPeriod)
  {
    return new Address(use, undefined, text, line, suburb, undefined, state, postalCode, country, oPeriod);
  };

  
  function Coding(code, codeSystem, display, version){
    var coding = new function(){};
    coding.code = FhirTool.SetFhir(code);
    coding.system = FhirTool.SetFhir(codeSystem);
    coding.display = FhirTool.SetFhir(display);
    coding.version = FhirTool.SetFhir(version);
    return coding;
  }
  
  function Reference(resourceType, reference, display){
    var ref = new function(){};
    ref.reference = FhirTool.SetFhir(resourceType + "/" + reference);
    ref.display = FhirTool.SetFhir(display);
    return ref;
  }

  function Identifier(use, oType, system, value, oPeriod, oAssigner){
    var id = new function(){};
    id.use = FhirTool.SetFhir(use);
    id.type = oType;
    id.system = FhirTool.SetFhir(system)
    id.value = FhirTool.SetFhir(value)
    id.period = oPeriod
    id.assigner = oAssigner
    return id;
  }

  function CodeableConcept(oCoding, text){
    var CodeableConcept = new function(){};
    CodeableConcept.coding = oCoding;
    CodeableConcept.text = FhirTool.SetFhir(text);
    return CodeableConcept;
  }

  function Period(start, end){
    var Period = new function(){};
    Period.start = FhirTool.SetFhir(start);
    Period.end = FhirTool.SetFhir(end);
    return Period;
  }

  function Attachment(contentType, language, data){
    var Attachment = new function(){};
    Attachment.contentType = FhirTool.SetFhir(contentType);
    Attachment.language = FhirTool.SetFhir(language);
    Attachment.data = FhirTool.SetFhir(data);
    return Attachment;
  }

  function HumanName(use, text, family, given, prefix, suffix, oPeriod){
    var HumanName = new function(){};
    HumanName.use = FhirTool.SetFhir(use);
    HumanName.text = FhirTool.SetFhir(text);
    HumanName.family = FhirTool.SetFhir(family);
    HumanName.given = FhirTool.SetFhir(given);
    HumanName.prefix = FhirTool.SetFhir(prefix);
    HumanName.suffix = FhirTool.SetFhir(suffix);
    HumanName.period = oPeriod;
    return HumanName;
  }

  function Address(use, type, text, line, city, district, state, postalCode, country, oPeriod){
    var Address = new function(){};
    Address.use = FhirTool.SetFhir(use);
    Address.type = FhirTool.SetFhir(type);
    Address.text = FhirTool.SetFhir(text);
    Address.line = FhirTool.SetFhir(line);
    Address.city = FhirTool.SetFhir(city);
    Address.district = FhirTool.SetFhir(district);
    Address.state = FhirTool.SetFhir(state);
    Address.postalCode = FhirTool.SetFhir(postalCode);
    Address.country = FhirTool.SetFhir(country);
    Address.period = oPeriod;
    return Address;
  }

}