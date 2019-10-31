
function PatientFhirResource() {

  var FhirTool = new FhirTools();

  var oFhirConfig = new FhirConfig();
  var Resource = new DomainResource();

  Resource.resourceType = oFhirConfig.ResourceName.Patient;

  Resource.SetActive = function (bool) {
    Resource.active = FhirTool.GetBool(bool);
  };

  Resource.SetIdentifier = function (oIdentifierArray) {
    Resource.identifier = oIdentifierArray;
  };

  Resource.SetName = function (oHumanNameArray) {
    Resource.name = oHumanNameArray;
  };

  Resource.SetGender = function (oCode) {
    Resource.gender = oCode;
  };

  Resource.SetBirthDate = function (date) {
    Resource.birthDate = date;
  };

  Resource.SetAddress = function (oAddressArray) {
    Resource.address = oAddressArray;
  };

  Resource.AddContact = function (oRelationshipCodeableConcept, oNameHumanName, oTelecomContactPointArray, oAddress, oGenderCode, oOrganizationReference, oPeriod) {
    if (Resource.contact == null) {
      Resource.contact = [];
    }
    Resource.contact.push(GetContact(oRelationshipCodeableConcept, oNameHumanName, oTelecomContactPointArray, oAddress, oGenderCode, oOrganizationReference, oPeriod));
  };

  function GetContact(oRelationshipCodeableConcept, oNameHumanName, oTelecomContactPointArray, oAddress, oGenderCode, oOrganizationReference, oPeriod) {
    var Contact = new function () { };
    Contact.relationship = FhirTool.SetFhir(oRelationshipCodeableConcept);
    Contact.name = FhirTool.SetFhir(oNameHumanName);
    Contact.telecom = FhirTool.SetFhir(oTelecomContactPointArray);
    Contact.address = FhirTool.SetFhir(oAddress);
    Contact.gender = FhirTool.SetFhir(oGenderCode);
    Contact.organization = FhirTool.SetFhir(oOrganizationReference);
    Contact.period = FhirTool.SetFhir(oPeriod);
    return Contact;
  }

  return Resource;

}